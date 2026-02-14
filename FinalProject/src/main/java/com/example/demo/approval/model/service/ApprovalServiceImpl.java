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
import com.example.demo.common.utility.Pagination;

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
        // 🛡️ [수정] 휴가 신청 시 '잔여 연차' 확인 로직
        // ========================================================
        boolean hasDates = dto.getStartDate() != null && !dto.getStartDate().isEmpty() 
                        && dto.getEndDate() != null && !dto.getEndDate().isEmpty();

        if (dto.getVacationType() != null && !dto.getVacationType().isEmpty() 
            && hasDates 
            && "N".equals(dto.getTempSaveYn())) {
            
            String currentYear = String.valueOf(LocalDate.now().getYear());
            
            // 사용 일수 계산
            double useCount = calculateVacationDays(dto.getStartDate(), dto.getEndDate(), dto.getVacationType());
            
            TotalVacationDto myVacation = mapper.selectTotalVacation(dto.getEmpNo(), currentYear);
            
            if (myVacation == null) {
                throw new IllegalArgumentException(currentYear + "년도 연차 정보가 존재하지 않습니다. 인사팀에 문의하세요.");
            }
            
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
	public List<ApprovalDto> selectWaitList(String empNo, Pagination pagination) {
		return mapper.selectWaitList(empNo, pagination);
	}

	@Override
	public List<ApprovalDto> selectUpcomingList(String empNo, Pagination pagination) {
		return mapper.selectUpcomingList(empNo, pagination);
	}

	@Override
	public List<ApprovalDto> selectMyDraftList(String empNo, Pagination pagination) {
		return mapper.selectMyDraftList(empNo, pagination);
	}

	@Override
	public List<ApprovalDto> selectTempList(String empNo, Pagination pagination) {
		return mapper.selectTempList(empNo, pagination);
	}

	@Override
	public List<ApprovalDto> selectMyApprovedList(String empNo, Pagination pagination) {
		return mapper.selectMyApprovedList(empNo, pagination);
	}

    // --------------------------------------------------------------------------------
    // 3. 상세 조회
    // --------------------------------------------------------------------------------
    
    // 단순 조회 (수정 폼 채우기용)
    @Override
    public ApprovalDto selectApprovalDetail(String docNo) {
        return mapper.selectApprovalDetail(docNo);
    }

    // 권한 체크 포함 조회 (열람용)
	@Override
	public Map<String, Object> selectApprovalDetailWithAuth(String docNo, String empNo) {
		Map<String, Object> map = new HashMap<>();

        ApprovalDto approval = mapper.selectApprovalDetail(docNo);
        if (approval == null) {
            throw new IllegalArgumentException("존재하지 않는 문서입니다.");
        }

        List<ApprovalLineDto> lines = mapper.selectApprovalLineList(docNo);

        // 조회 권한 체크
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

        // (옵션) 관리자 권한이 있다면 여기서 패스시키는 로직 추가 가능
        if (!isWriter && !isApprover) {
            // throw new IllegalArgumentException("이 문서를 조회할 권한이 없습니다.");
            // 개발 중엔 불편하니 일단 로그만 찍고 통과시킬 수도 있음
             log.warn("권한 없는 사용자가 문서 조회 시도: docNo={}, empNo={}", docNo, empNo);
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

                // 연차 차감 & 캘린더 등록
                ApprovalDto vacationInfo = mapper.selectVacationDetail(docNo);
                
                if (vacationInfo != null) {
                    ApprovalDto docInfo = mapper.selectApprovalDetail(docNo);
                    
                    // 연차 차감
                    double useCount = calculateVacationDays(
                        vacationInfo.getStartDate(), 
                        vacationInfo.getEndDate(), 
                        vacationInfo.getVacationType()
                    );
                    
                    String currentYear = String.valueOf(LocalDate.now().getYear());
                    mapper.updateVacationUsage(docInfo.getEmpNo(), currentYear, useCount);
                    log.info("✅ 연차 차감 완료: 사번 {}, 차감 {}일", docInfo.getEmpNo(), useCount);

                    // 캘린더 등록
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
	
    // --------------------------------------------------------------------------------
    // 5. 홈 데이터 & 사이드바
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

    // 🔥 [추가] 사이드바 카운트
    @Override
    public Map<String, Object> getSidebarCounts(String empNo) {
        return mapper.selectSidebarCounts(empNo);
    }

    // --------------------------------------------------------------------------------
    // 6. 헬퍼 메서드 (연차 계산 / 삭제 / 일괄 생성)
    // --------------------------------------------------------------------------------
    
    // 연차 계산
	@Override 
    public double calculateVacationDays(String startDate, String endDate, String type) {
        if (startDate == null || startDate.isEmpty() || endDate == null || endDate.isEmpty()) {
            return 0.0;
        }

        String deductionYn = mapper.selectDeductYn(type);
        if (deductionYn == null || "N".equals(deductionYn)) {
            return 0.0;
        }

        if (type.contains("반차")) {
            return 0.5;
        }

        List<String> holidays = mapper.selectHolidayList(startDate, endDate);
        
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        
        double count = 0;
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            DayOfWeek day = date.getDayOfWeek();
            String dateStr = date.format(formatter);
            
            if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) continue; 
            if (holidays.contains(dateStr)) continue;

            count++;
        }
        return count;
    }

    // 🔥 [추가] 문서 삭제
    @Override
    public void deleteApproval(String docNo) {
        // 자식 먼저 삭제
        mapper.deleteApprovalLine(docNo);
        mapper.deleteApprovalVacation(docNo);
        mapper.deleteApprovalExpense(docNo);
        mapper.deleteExpenseDetail(docNo);
        // 부모 삭제
        mapper.deleteApproval(docNo);
    }
    
    // 전 직원 연차 생성
    @Override
    public int grantAnnualLeaveAll(String year) {
        List<String> empList = mapper.selectAllActiveEmpNos();
        int successCount = 0;

        for (String empNo : empList) {
            int exists = mapper.countVacationData(empNo, year);
            
            if (exists == 0) {
                TotalVacationDto dto = TotalVacationDto.builder()
                        .year(year)
                        .empNo(empNo)
                        .totalDays(20.0)
                        .usedDays(0.0)
                        .remainDays(20.0)
                        .build();
                
                mapper.insertTotalVacation(dto);
                successCount++;
            }
        }
        return successCount; 
    }


    // 갯수 새기

	@Override
	public int getWaitListCount(String empNo) {
		// TODO Auto-generated method stub
		return mapper.getWaitListCount(empNo);
	}

	@Override
	public int getUpcomingListCount(String empNo) {
		// TODO Auto-generated method stub
		return mapper.getUpcomingListCount(empNo);
	}

	@Override
	public int getMyDraftListCount(String empNo) {
		// TODO Auto-generated method stub
		return mapper.getMyDraftListCount(empNo);
	}

	@Override
	public int getTempListCount(String empNo) {
		// TODO Auto-generated method stub
		return mapper.getTempListCount(empNo);
	}

	@Override
	public int getMyApprovedListCount(String empNo) {
		// TODO Auto-generated method stub
		return mapper.getMyApprovedListCount(empNo);
	}

}