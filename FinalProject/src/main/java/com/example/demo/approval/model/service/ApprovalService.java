package com.example.demo.approval.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.example.demo.approval.model.dto.ApprovalDto;

public interface ApprovalService {

	int insertApproval(ApprovalDto dto, List<MultipartFile> files) throws Exception;

	List<ApprovalDto> selectWaitList(int empNo);

	List<ApprovalDto> selectUpcomingList(int empNo);

	List<ApprovalDto> selectMyDraftList(int empNo);

	List<ApprovalDto> selectTempList(int empNo);

	List<ApprovalDto> selectMyApprovedList(int empNo);

	Map<String, Object> selectApprovalDetail(String docNo, String empNo);

	int processApproval(Map<String, Object> params);

	int cancelApproval(String docNo, String empNo);

	Map<String, Object> getHomeData(String empNo);

	int grantAnnualLeaveAll(String year);


}
