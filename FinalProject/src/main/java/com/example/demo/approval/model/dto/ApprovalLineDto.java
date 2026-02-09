package com.example.demo.approval.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalLineDto {
	
	private String appLineNo;     // 결재선 고유 번호 (20260202-00000001-001) 문서번호 + 001 002 ...
	private String docNo;         // 문서 번호
	private String approverNo;    // 결재자 사번
	private int appLineOrder;     // 결재 순서 1 2 3
	private String appLineStatus; // 결재 처리 상태 (대기 / 승인 / 반려 / 선결 등등)
	private String appLineDate;   // 결재 처리한 날짜
	private String rejectReason;  // 반려 사유
	
	private String positionName; // 직급명
	private String deptName; // 부서명
	private String empName; // 직원명

}
