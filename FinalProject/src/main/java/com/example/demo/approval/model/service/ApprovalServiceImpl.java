package com.example.demo.approval.model.service;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value; // 🔥 추가됨
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.approval.model.dto.ApprovalDto;
import com.example.demo.approval.model.dto.ApprovalLineDto;
import com.example.demo.approval.model.dto.ExpenseDetailDto;
import com.example.demo.approval.model.mapper.ApprovalMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
@Slf4j
public class ApprovalServiceImpl implements ApprovalService {
	
	private final ApprovalMapper mapper;

    @Value("${file.upload-dir}")
    private String uploadDir; 
	
    @Override
    public int insertApproval(ApprovalDto dto, List<MultipartFile> files) throws Exception {
        
        int result = 0;
        String docNo = dto.getDocNo();

        // --------------------------------------------------------
        // 🔥 [1] 파일 저장 로직 (여기가 추가되었습니다!)
        // --------------------------------------------------------
        if (files != null && !files.isEmpty()) {
            
            // 저장할 경로 설정 (프로젝트 내 src/main/resources/static/uploads/approval 폴더)
            // 주의: 배포 시에는 외부 경로로 잡는 것이 좋지만, 로컬 테스트용으로 static 경로 사용
            String projectPath = System.getProperty("user.dir") + "\\src\\main\\resources\\static\\uploads\\approval\\";
            File saveFolder = new File(projectPath);

            // 폴더가 없으면 자동 생성
            if (!saveFolder.exists()) {
                saveFolder.mkdirs();
            }

            // DB에 넣을 파일명 리스트 (여러 개일 경우 콤마로 구분하거나, 첫 번째만 저장)
            List<String> renameFileNames = new ArrayList<>();

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    // 원본 파일명
                    String originalFileName = file.getOriginalFilename();
                    
                    // 파일명 중복 방지 (UUID 사용) -> "랜덤문자열_원본이름.png"
                    String renameFileName = UUID.randomUUID().toString() + "_" + originalFileName;
                    
                    // 실제 서버(폴더)에 저장
                    file.transferTo(new File(projectPath + renameFileName));
                    
                    renameFileNames.add(renameFileName);
                }
            }

            // DB 컬럼(APPROVAL_FILE)에 저장할 이름 세팅
            // 파일이 여러 개면 콤마(,)로 이어서 저장 (예: file1.jpg,file2.jpg)
            // 만약 DB가 파일 하나만 지원하면 첫 번째 파일만 저장됨
            if (!renameFileNames.isEmpty()) {
                dto.setApprovalFile(String.join(",", renameFileNames));
            }
        }
        // --------------------------------------------------------


        // [2] 문서 번호 유무에 따른 INSERT / UPDATE 분기
        if (docNo != null && !docNo.isEmpty()) {
            // 수정 (Update)
            result = mapper.updateApproval(dto);
            
            // 기존 데이터 삭제 (초기화)
            mapper.deleteApprovalLine(docNo);
            mapper.deleteApprovalVacation(docNo);
            mapper.deleteApprovalExpense(docNo);
            mapper.deleteExpenseDetail(docNo);
            
        } else {
            // 신규 (Insert)
            docNo = mapper.selectNextDocNo(); 
            dto.setDocNo(docNo);
            result = mapper.insertApproval(dto);
        }

        // [3] 하위 데이터 등록 (공통)
        
        // 결재선 등록
        if (dto.getApprovalLineList() != null) {
            for (ApprovalLineDto line : dto.getApprovalLineList()) {
                line.setDocNo(docNo);
                mapper.insertApprovalLine(line);
            }
        }

        // 휴가/지출 등록
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

	@Override
	public List<ApprovalDto> selectWaitList(int empNo) {
		// TODO Auto-generated method stub
		return mapper.selectWaitList(empNo);
	}

	@Override
	public List<ApprovalDto> selectUpcomingList(int empNo) {
		// TODO Auto-generated method stub
		return mapper.selectUpcomingList(empNo);
	}

	@Override
	public List<ApprovalDto> selectMyDraftList(int empNo) {
		// TODO Auto-generated method stub
		return mapper.selectMyDraftList(empNo);
	}

	@Override
	public List<ApprovalDto> selectTempList(int empNo) {
		// TODO Auto-generated method stub
		return mapper.selectTempList(empNo);
	}

	@Override
	public List<ApprovalDto> selectMyApprovedList(int empNo) {
		// TODO Auto-generated method stub
		return mapper.selectMyApprovedList(empNo);
	}

	
	// 결재 상세조회 서비스
	@Override
	public Map<String, Object> selectApprovalDetail(String docNo) {
		Map<String, Object> map = new HashMap<>();

        // 1. 문서 기본 정보 (제목, 내용, 기안자 등)
        ApprovalDto approval = mapper.selectApprovalDetail(docNo);
        map.put("approval", approval);

        // 2. 결재선 정보 (누가 승인했고, 누구 차례인지)
        List<ApprovalLineDto> lines = mapper.selectApprovalLineList(docNo);
        map.put("lines", lines);

        // 3. (선택) 휴가 신청서 상세
        ApprovalDto vacation = mapper.selectVacationDetail(docNo);
        if (vacation != null) {
            map.put("vacation", vacation);
        }

        // 4. (선택) 지출 결의서 상세 (총액 + 내역)
        ApprovalDto expense = mapper.selectExpenseDetail(docNo);
        if (expense != null) {
            map.put("expense", expense);
            List<ExpenseDetailDto> expenseDetails = mapper.selectExpenseDetailList(docNo);
            map.put("expenseDetails", expenseDetails);
        }

        return map;
	}

	/** 승인 , 반려 서비스
	 *
	 */
	@Override
	public int processApproval(Map<String, Object> params) {
		String docNo = (String) params.get("docNo");
        String status = (String) params.get("status"); // "C"(승인) or "R"(반려)
        String empNo = String.valueOf(params.get("empNo"));
        
        // 1. 내 결재선 상태 업데이트 (대기 'W' -> 승인 'C' or 반려 'R')
        // (Mapper에 updateApprovalLineStatus 쿼리가 필요함)
        ApprovalLineDto lineDto = new ApprovalLineDto();
        lineDto.setDocNo(docNo);
        lineDto.setApproverNo(empNo);
        lineDto.setAppLineStatus(status);
        
        int result = mapper.updateApprovalLineStatus(lineDto);
        
        // 2. 반려(R)인 경우 -> 문서 전체 상태도 바로 반려(R)로 끝냄
        if ("R".equals(status)) {
            ApprovalDto docDto = new ApprovalDto();
            docDto.setDocNo(docNo);
            docDto.setApprovalStatus("R");
            mapper.updateApprovalStatus(docDto); // 문서 상태 업데이트
            return result;
        }
        
        // 3. 승인(C)인 경우 -> 내가 마지막 결재자인지 확인해야 함
        if ("C".equals(status)) {
            // 남은 결재자가 있는지 확인 (내 다음 순서이면서 상태가 'W'인 사람)
            // 간단하게: 이 문서의 결재선 중 'W'가 하나라도 남았는지 카운트
            int remaining = mapper.countRemainingApprovers(docNo);
            
            if (remaining == 0) {
                // 남은 사람이 없으면 -> 최종 승인 처리
                ApprovalDto docDto = new ApprovalDto();
                docDto.setDocNo(docNo);
                docDto.setApprovalStatus("C"); // 최종 승인
                mapper.updateApprovalStatus(docDto);
            }
        }

        return result;
	}



	
}