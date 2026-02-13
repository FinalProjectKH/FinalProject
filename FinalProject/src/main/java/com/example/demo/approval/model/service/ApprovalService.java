package com.example.demo.approval.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.example.demo.approval.model.dto.ApprovalDto;

public interface ApprovalService {

	// 기안 작성
	int insertApproval(ApprovalDto dto, List<MultipartFile> files) throws Exception;

	// 목록 조회
	List<ApprovalDto> selectWaitList(int empNo);
	List<ApprovalDto> selectUpcomingList(int empNo);
	List<ApprovalDto> selectMyDraftList(int empNo);
	List<ApprovalDto> selectTempList(int empNo);
	List<ApprovalDto> selectMyApprovedList(int empNo);

	// 상세 조회 (단순)
	ApprovalDto selectApprovalDetail(String docNo);
	
	// 상세 조회 (권한 체크 포함)
	Map<String, Object> selectApprovalDetailWithAuth(String docNo, String empNo);

	// 승인/반려/취소
	int processApproval(Map<String, Object> params);
	int cancelApproval(String docNo, String empNo);

	// 홈 데이터 & 사이드바
	Map<String, Object> getHomeData(String empNo);
	Map<String, Object> getSidebarCounts(String empNo);

	// 연차 관리
	int grantAnnualLeaveAll(String year);
	double calculateVacationDays(String start, String end, String type);

	// 삭제
	void deleteApproval(String docNo);
}