package com.example.demo.approval.model.service;

import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.approval.model.dto.ApprovalDto;
import com.example.demo.approval.model.dto.ApprovalLineDto;
import com.example.demo.approval.model.dto.ExpenseDetailDto;
import com.example.demo.approval.model.mapper.ApprovalMapper;
import com.example.demo.calendar.model.dto.CalendarDto;
import com.example.demo.calendar.model.service.CalendarService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
@Slf4j
public class ApprovalServiceImpl implements ApprovalService {
	
	private final ApprovalMapper mapper;
	private final CalendarService calendarService;

    @Value("${file.upload-dir}")
    private String uploadDir; 
	
    // --------------------------------------------------------------------------------
    // 1. 기안 작성 (INSERT)
    // --------------------------------------------------------------------------------
    @Override
    public int insertApproval(ApprovalDto dto, List<MultipartFile> files) throws Exception {
        
        int result = 0;
        String docNo = dto.getDocNo();

        // [1] 파일 저장 로직
        if (files != null && !files.isEmpty()) {
            String projectPath = System.getProperty("user.dir") + "\\src\\main\\resources\\static\\uploads\\approval\\";
            File saveFolder = new File(projectPath);

            if (!saveFolder.exists()) {
                saveFolder.mkdirs();
            }

            List<String> renameFileNames = new ArrayList<>();

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String originalFileName = file.getOriginalFilename();
                    String renameFileName = UUID.randomUUID().toString() + "_" + originalFileName;
                    file.transferTo(new File(projectPath + renameFileName));
                    renameFileNames.add(renameFileName);
                }
            }

            if (!renameFileNames.isEmpty()) {
                dto.setApprovalFile(String.join(",", renameFileNames));
            }
        }

        // [2] 문서 번호 유무에 따른 INSERT / UPDATE 분기
        if (docNo != null && !docNo.isEmpty()) {
            // 수정
            result = mapper.updateApproval(dto);
            mapper.deleteApprovalLine(docNo);
            mapper.deleteApprovalVacation(docNo);
            mapper.deleteApprovalExpense(docNo);
            mapper.deleteExpenseDetail(docNo);
        } else {
            // 신규
            docNo = mapper.selectNextDocNo(); 
            dto.setDocNo(docNo);
            result = mapper.insertApproval(dto);
        }

        // [3] 하위 데이터 등록
        if (dto.getApprovalLineList() != null) {
            for (ApprovalLineDto line : dto.getApprovalLineList()) {
                line.setDocNo(docNo);
                mapper.insertApprovalLine(line);
            }
        }

        if (dto.getVacationType() != null && !dto.getVacationType().isEmpty()) {
            mapper.insertApprovalVacation(dto);
        } else if (dto.getTotalAmount() > 0) {
            mapper.insertApprovalExpense(dto);
            if (dto.getExpenseDetailList() != null) {
                for (ExpenseDetailDto detail : dto.getExpenseDetailList()) {
                    detail.setDocNo(docNo);
                    mapper.insertExpenseDetail(detail);
                }
            }
        }

        return result;
    }

    // --------------------------------------------------------------------------------
    // 2. 각종 조회 메서드
    // --------------------------------------------------------------------------------
	@Override
	public List<ApprovalDto> selectWaitList(int empNo) {
		return mapper.selectWaitList(empNo);
	}

	@Override
	public List<ApprovalDto> selectUpcomingList(int empNo) {
		return mapper.selectUpcomingList(empNo);
	}

	@Override
	public List<ApprovalDto> selectMyDraftList(int empNo) {
		return mapper.selectMyDraftList(empNo);
	}

	@Override
	public List<ApprovalDto> selectTempList(int empNo) {
		return mapper.selectTempList(empNo);
	}

	@Override
	public List<ApprovalDto> selectMyApprovedList(int empNo) {
		return mapper.selectMyApprovedList(empNo);
	}

    // --------------------------------------------------------------------------------
    // 3. 상세 조회 (권한 체크 포함)
    // --------------------------------------------------------------------------------
	@Override
	public Map<String, Object> selectApprovalDetail(String docNo, String empNo) {
		Map<String, Object> map = new HashMap<>();

        // 1. 문서 기본 정보 조회
        ApprovalDto approval = mapper.selectApprovalDetail(docNo);
        if (approval == null) {
            throw new IllegalArgumentException("존재하지 않는 문서입니다.");
        }

        // 2. 결재선 정보 조회
        List<ApprovalLineDto> lines = mapper.selectApprovalLineList(docNo);

        // ========================================================
        // 🛡️ [보안] 조회 권한 체크 (Security Check)
        // ========================================================
        boolean isWriter = String.valueOf(approval.getEmpNo()).equals(empNo); // 기안자인가?
        boolean isApprover = false; // 결재자인가?

        if (lines != null) {
            for (ApprovalLineDto line : lines) {
                if (String.valueOf(line.getApproverNo()).equals(empNo)) {
                    isApprover = true;
                    break;
                }
            }
        }

        if (!isWriter && !isApprover) {
            throw new IllegalArgumentException("이 문서를 조회할 권한이 없습니다.");
        }
        // ========================================================

        map.put("approval", approval);
        map.put("lines", lines);

        ApprovalDto vacation = mapper.selectVacationDetail(docNo);
        if (vacation != null) map.put("vacation", vacation);

        ApprovalDto expense = mapper.selectExpenseDetail(docNo);
        if (expense != null) {
            map.put("expense", expense);
            List<ExpenseDetailDto> expenseDetails = mapper.selectExpenseDetailList(docNo);
            map.put("expenseDetails", expenseDetails);
        }

        return map;
	}

    // --------------------------------------------------------------------------------
    // 4. 결재 처리 (승인/반려) - 핵심 로직 🔥
    // --------------------------------------------------------------------------------
	@Override
	public int processApproval(Map<String, Object> params) {
		
        // 1. 파라미터 꺼내기
		String docNo = (String) params.get("docNo");
        String empNo = String.valueOf(params.get("empNo")); // 요청한 사람 (로그인한 사람)
        String status = (String) params.get("status"); 
        String rejectReason = (String) params.get("rejectReason"); 

        // ========================================================
        // 🛡️ [보안] 결재 권한 체크 (진짜 내 차례가 맞는지?)
        // ========================================================
        List<ApprovalLineDto> lines = mapper.selectApprovalLineList(docNo);
        boolean isMyTurn = false;

        if (lines != null) {
            for (ApprovalLineDto line : lines) {
                // 내 사번과 일치하고
                if (String.valueOf(line.getApproverNo()).equals(empNo)) {
                    // 현재 상태가 'W'(대기) 상태여야만 결재 가능
                    if ("W".equals(line.getAppLineStatus())) {
                        isMyTurn = true;
                    } else {
                        // 이미 승인(C)했거나 반려(R)한 경우, 혹은 아직 순서가 안 된 경우(null/I)
                        throw new IllegalArgumentException("이미 결재했거나, 아직 결재 차례가 아닙니다.");
                    }
                    break;
                }
            }
        }

        if (!isMyTurn) {
            throw new IllegalArgumentException("결재 권한이 없습니다. (결재선에 없거나 차례가 아님)");
        }
        // ========================================================
        
        // 2. 결재선 업데이트
        ApprovalLineDto lineDto = new ApprovalLineDto();
        lineDto.setDocNo(docNo);
        lineDto.setApproverNo(empNo);
        lineDto.setAppLineStatus(status);
        
        if("R".equals(status)) {
            lineDto.setRejectReason(rejectReason);
        }
        
        int result = mapper.updateApprovalLineStatus(lineDto);
        
        // 3. 반려(R)인 경우 -> 문서 전체 상태 반려 처리 후 종료
        if ("R".equals(status)) {
            ApprovalDto docDto = new ApprovalDto();
            docDto.setDocNo(docNo);
            docDto.setApprovalStatus("R"); 
            mapper.updateApprovalStatus(docDto); 
            return result; 
        }
        
        // 4. 승인(C)인 경우 -> 최종 승인 여부 확인
        if ("C".equals(status)) {
            int remaining = mapper.countRemainingApprovers(docNo);
            
            // 남은 결재자가 0명이면 -> 최종 승인 처리
            if (remaining == 0) {
                ApprovalDto docDto = new ApprovalDto();
                docDto.setDocNo(docNo);
                docDto.setApprovalStatus("C");
                mapper.updateApprovalStatus(docDto);

                // ========================================================
                // 🔥 [JPA 연동] 휴가 문서 -> 캘린더 자동 등록
                // ========================================================
                
                ApprovalDto vacationInfo = mapper.selectVacationDetail(docNo);
                
                if (vacationInfo != null) {
                    ApprovalDto docInfo = mapper.selectApprovalDetail(docNo);
                    
                    String startStr = vacationInfo.getStartDate() + " 00:00:00";
                    String endStr = vacationInfo.getEndDate() + " 00:00:00";
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

                    // 카테고리 ID 동적 가져오기
                    String vacationCategoryId = calendarService.getOrCreateVacationCategoryId(docInfo.getEmpNo());

                    CalendarDto calendarEvent = CalendarDto.builder()
                            .calTitle("[휴가] " + docInfo.getEmpName() + " - " + vacationInfo.getVacationType()) 
                            .calContent("전자결재 문서번호: " + docNo) 
                            .calStartDt(LocalDateTime.parse(startStr, formatter)) 
                            .calEndDt(LocalDateTime.parse(endStr, formatter))     
                            .calColor("#FF6B6B")  
                            .calLocation("휴가")    
                            .empNo(docInfo.getEmpNo()) 
                            .typeId(vacationCategoryId) 
                            .alldayYn("Y")        
                            .openYn("Y")          
                            .build();

                    calendarService.createEvent(calendarEvent);
                    log.info("✅ 휴가 일정 캘린더 등록 완료: {}", calendarEvent.getCalTitle());
                }
            } 
        } 

        return result;
	}

    // --------------------------------------------------------------------------------
    // 5. 상신 취소
    // --------------------------------------------------------------------------------
	@Override
	public int cancelApproval(String docNo, String empNo) {
		int count = mapper.countApprovedLines(docNo);
		if(count > 0) return 0; // 이미 누군가 결재했다면 취소 불가
		
		ApprovalDto dto = new ApprovalDto();
		dto.setDocNo(docNo);
		dto.setTempSaveYn("Y"); 
		dto.setApprovalStatus("W"); 
		
		return mapper.updateApprovalToTemp(dto);
	}
	
    // --------------------------------------------------------------------------------
    // 6. 메인 홈 데이터
    // --------------------------------------------------------------------------------
	@Override
    public Map<String, Object> getHomeData(String empNo) {
        Map<String, Object> map = new HashMap<>();
        
        map.put("waitCount", mapper.countWait(empNo));       
        map.put("draftCount", mapper.countDraft(empNo));     
        map.put("approveCount", mapper.countApproved(empNo)); 

        map.put("waitList", mapper.selectWaitListTop5(empNo)); 
        map.put("draftList", mapper.selectDraftListTop5(empNo));
        
        return map;
    }

}