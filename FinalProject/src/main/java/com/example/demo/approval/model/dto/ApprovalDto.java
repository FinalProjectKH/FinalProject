package com.example.demo.approval.model.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalDto {
	
	/*APPROVAL TABLE*/
	
	private String docNo;           // 문서번호 => 20260202-00000001 이런형식
	private String empNo;           // 기안자 사번
	private String approvalDate;    // 기안 일자
	private int retentionYear;      // 보존년한
	private String approvalTitle;   // 문서 제목
	private String approvalContent; // 문서 내용
	private String approvalStatus;  // 결재 상태
	private String approvalFile;    // 첨부 파일
	private String relatedDocNo;    // 관련 문서
	private String tempSaveYn;      // 임시저장 여부
	
	private String empName;         // 사원 이름
	private String deptName;        // 부서 이름
	
	// ---------------------------------------------- //
	/*APPROVAL_VACATION TABLE*/
	
	private String vacationType;   // 휴가 종류
	private String startDate;      // 휴가 시작일
	private String endDate;        // 휴가 종료일
	private double totalUse;       // 총 사용 휴가
	
	// ---------------------------------------------- //
	/*VACATION_TYPE TABLE*/
	
	private String deductYn;     // 연차 차감 여부
	private double deductCount;  // 연차 차감 일수 (0.5 = 반차)
	private String payYn;        // 유급 휴가 여부 (Y = 유급)
	
	// ---------------------------------------------- //
	/*APPROVAL_EXPENSE TABLE*/
	private int totalAmount;      // 총 신청 금액

	private List<ExpenseDetailDto> expenseDetailList;
	// ---------------------------------------------- //
	/*APPROVAL_LINE TABLE*/
	private List<ApprovalLineDto> approvalLineList;
	
	
	
	

}
