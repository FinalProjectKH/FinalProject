package com.example.demo.approval.model.service;

import java.io.File;
import java.time.DayOfWeek;
import java.time.LocalDate;
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
import com.example.demo.approval.model.dto.TotalVacationDto;
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
    // 1. 기안 작성 (INSERT) + 잔여 연차 검증
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
        
        // ========================================================
        // 🛡️ [추가] 휴가 신청 시 '잔여 연차' 확인 (TOTAL_VACATION)
        // ========================================================
        if (dto.getVacationType() != null && !dto.getVacationType().isEmpty()) {
            
            // 1. 현재 연도 구하기 (String "2026")
            String currentYear = String.valueOf(LocalDate.now().getYear());
            
            // 2. 사용 일수 계산 (주말 제외)
            double useCount = calculateVacationDays(dto.getStartDate(), dto.getEndDate(), dto.getVacationType());
            
            // 3. 내 연차 정보 가져오기 (Mapper에 메서드 추가 필수!)
            TotalVacationDto myVacation = mapper.selectTotalVacation(dto.getEmpNo(), currentYear);
            
            // 정보가 없으면 예외 처리
            if (myVacation == null) {
                throw new IllegalArgumentException(currentYear + "년도 연차 정보가 존재하지 않습니다. 인사팀에 문의하세요.");
            }
            
            // 4. 부족하면 예외 발생 (저장 안 되고 튕김)
            if (myVacation.getRemainDays() < useCount) {
                throw new IllegalArgumentException("잔여 연차가 부족합니다. (신청: " + useCount + "일 / 잔여: " + myVacation.getRemainDays() + "일)");
            }
        }
        // ========================================================


        // [2] 문서 번호 유무에 따른 INSERT / UPDATE 분기
        if (docNo != null && !docNo.isEmpty()) {
            result = mapper.updateApproval(dto);
            mapper.deleteApprovalLine(docNo);
            mapper.deleteApprovalVacation(docNo);
            mapper.deleteApprovalExpense(docNo);
            mapper.deleteExpenseDetail(docNo);
        } else {
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
    // 3. 상세 조회 (보안 체크 포함)
    // --------------------------------------------------------------------------------
	@Override
	public Map<String, Object> selectApprovalDetail(String docNo, String empNo) {
		Map<String, Object> map = new HashMap<>();

        ApprovalDto approval = mapper.selectApprovalDetail(docNo);
        if (approval == null) {
            throw new IllegalArgumentException("존재하지 않는 문서입니다.");
        }

        List<ApprovalLineDto> lines = mapper.selectApprovalLineList(docNo);

        // 🛡️ [보안] 조회 권한 체크
        boolean isWriter = String.valueOf(approval.getEmpNo()).equals(empNo);
        boolean isApprover = false;

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
    // 4. 결재 처리 (승인/반려) + 연차 차감 + 캘린더 등록 🔥
    // --------------------------------------------------------------------------------
	@Override
	public int processApproval(Map<String, Object> params) {
		
		String docNo = (String) params.get("docNo");
        String empNo = String.valueOf(params.get("empNo")); 
        String status = (String) params.get("status"); 
        String rejectReason = (String) params.get("rejectReason"); 

        // 🛡️ [보안] 결재 권한 체크 (내 차례 확인)
        List<ApprovalLineDto> lines = mapper.selectApprovalLineList(docNo);
        boolean isMyTurn = false;

        if (lines != null) {
            for (ApprovalLineDto line : lines) {
                if (String.valueOf(line.getApproverNo()).equals(empNo)) {
                    if ("W".equals(line.getAppLineStatus())) {
                        isMyTurn = true;
                    } else {
                        throw new IllegalArgumentException("이미 결재했거나, 아직 결재 차례가 아닙니다.");
                    }
                    break;
                }
            }
        }

        if (!isMyTurn) {
            throw new IllegalArgumentException("결재 권한이 없습니다. (순서 아님)");
        }
        
        // 결재선 업데이트
        ApprovalLineDto lineDto = new ApprovalLineDto();
        lineDto.setDocNo(docNo);
        lineDto.setApproverNo(empNo);
        lineDto.setAppLineStatus(status);
        
        if("R".equals(status)) {
            lineDto.setRejectReason(rejectReason);
        }
        
        int result = mapper.updateApprovalLineStatus(lineDto);
        
        // 반려(R) -> 문서 전체 반려
        if ("R".equals(status)) {
            ApprovalDto docDto = new ApprovalDto();
            docDto.setDocNo(docNo);
            docDto.setApprovalStatus("R"); 
            mapper.updateApprovalStatus(docDto); 
            return result; 
        }
        
        // 승인(C) -> 최종 승인 확인
        if ("C".equals(status)) {
            int remaining = mapper.countRemainingApprovers(docNo);
            
            if (remaining == 0) {
                ApprovalDto docDto = new ApprovalDto();
                docDto.setDocNo(docNo);
                docDto.setApprovalStatus("C");
                mapper.updateApprovalStatus(docDto);

                // ========================================================
                // 🔥 [최종 승인 후속 작업] 연차 차감 & 캘린더 등록
                // ========================================================
                ApprovalDto vacationInfo = mapper.selectVacationDetail(docNo);
                
                if (vacationInfo != null) {
                    ApprovalDto docInfo = mapper.selectApprovalDetail(docNo);
                    
                    // 1. 연차 사용 일수 계산
                    double useCount = calculateVacationDays(
                        vacationInfo.getStartDate(), 
                        vacationInfo.getEndDate(), 
                        vacationInfo.getVacationType()
                    );
                    
                    // 2. 현재 연도
                    String currentYear = String.valueOf(LocalDate.now().getYear());
                    
                    // 3. 🔥 실제 연차 차감 (Mapper 메서드 호출)
                    mapper.updateVacationUsage(docInfo.getEmpNo(), currentYear, useCount);
                    log.info("✅ 연차 차감 완료: 사번 {}, 차감 {}일", docInfo.getEmpNo(), useCount);

                    // 4. 캘린더 등록
                    String startStr = vacationInfo.getStartDate() + " 00:00:00";
                    String endStr = vacationInfo.getEndDate() + " 00:00:00";
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

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
                    log.info("✅ 캘린더 등록 완료: {}", calendarEvent.getCalTitle());
                }
            } 
        } 

        return result;
	}

	@Override
	public int cancelApproval(String docNo, String empNo) {
		int count = mapper.countApprovedLines(docNo);
		if(count > 0) return 0;
		
		ApprovalDto dto = new ApprovalDto();
		dto.setDocNo(docNo);
		dto.setTempSaveYn("Y"); 
		dto.setApprovalStatus("W"); 
		
		return mapper.updateApprovalToTemp(dto);
	}
	
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

    // ========================================================
    // 📅 [Helper] 주말(토,일) 제외하고 연차 사용일수 계산
    // ========================================================
    private double calculateVacationDays(String startDate, String endDate, String type) {
        // 반차는 무조건 0.5일
        if (type != null && type.contains("반차")) {
            return 0.5;
        }

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        
        double count = 0;
        
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            DayOfWeek day = date.getDayOfWeek();
            // 토요일(SATURDAY) 아니고, 일요일(SUNDAY) 아니면 카운트
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                count++;
            }
        }
        return count;
    }
    
    
 // ========================================================
    // 👑 [관리자] 전 직원 연차 일괄 생성 (20개)
    // ========================================================
    @Override
    @Transactional
    public int grantAnnualLeaveAll(String year) {
        
        // 1. 재직 중인 전 직원 사번 조회
        List<String> empList = mapper.selectAllActiveEmpNos();
        int successCount = 0; // 생성된 사람 수 카운트

        // 2. 한 명씩 돌면서 연차 생성
        for (String empNo : empList) {
            
            // (1) 이미 이 사람의 해당 연도 데이터가 있는지 확인 (방어 코드)
            int exists = mapper.countVacationData(empNo, year);
            
            if (exists == 0) {
                // (2) 데이터가 없으면 새로 생성 (20개)
                TotalVacationDto dto = TotalVacationDto.builder()
                        .year(year)
                        .empNo(empNo)
                        .totalDays(20.0)  // 20개 부여
                        .usedDays(0.0)    // 사용 0
                        .remainDays(20.0) // 잔여 20
                        .build();
                
                mapper.insertTotalVacation(dto);
                successCount++;
            }
        }
        
        log.info("✅ {}년도 연차 생성 완료. 대상자: {}명, 신규생성: {}명", year, empList.size(), successCount);
        
        return successCount; // 몇 명 생성했는지 리턴
    }

}