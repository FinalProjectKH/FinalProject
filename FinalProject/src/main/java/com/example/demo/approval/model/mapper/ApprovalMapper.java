package com.example.demo.approval.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.approval.model.dto.ApprovalDto;
import com.example.demo.approval.model.dto.ApprovalLineDto;
import com.example.demo.approval.model.dto.ExpenseDetailDto;

@Mapper
public interface ApprovalMapper {

	// 문서번호 생성
	String selectNextDocNo();

	// 기본 기안 등록
	int insertApproval(ApprovalDto dto);

	// 결재선 등록
	void insertApprovalLine(ApprovalLineDto line);

	// 지출결의서 등록
	void insertApprovalExpense(ApprovalDto dto);

	// 지출결의서 상세내역 등록
	void insertExpenseDetail(ExpenseDetailDto detail);

	// 휴가신청서 등록
	void insertApprovalVacation(ApprovalDto dto);

	// 결재 대기 문서
	List<ApprovalDto> selectWaitList(int empNo);

	// 결재 예정 문서
	List<ApprovalDto> selectUpcomingList(int empNo);

	// 기안 문서함
	List<ApprovalDto> selectMyDraftList(int empNo);

	// 임시 저장함
	List<ApprovalDto> selectTempList(int empNo);

	// 결재 문서함
	List<ApprovalDto> selectMyApprovedList(int empNo);

	
	ApprovalDto selectApprovalDetail(String docNo);

	List<ApprovalLineDto> selectApprovalLineList(String docNo);

	ApprovalDto selectVacationDetail(String docNo);

	ApprovalDto selectExpenseDetail(String docNo);

	List<ExpenseDetailDto> selectExpenseDetailList(String docNo);

	int updateApproval(ApprovalDto dto);

	void deleteApprovalLine(String docNo);

	void deleteApprovalVacation(String docNo);

	void deleteApprovalExpense(String docNo);

	void deleteExpenseDetail(String docNo);

	int updateApprovalLineStatus(ApprovalLineDto lineDto);

	void updateApprovalStatus(ApprovalDto docDto);

	int countRemainingApprovers(String docNo);

	int countApprovedLines(String docNo);

	int updateApprovalToTemp(ApprovalDto dto);

	int countWait(String empNo);

	int countDraft(String empNo);

	int countApproved(String empNo);

	List<ApprovalDto> selectWaitListTop5(String empNo);

	List<ApprovalDto> selectDraftListTop5(String empNo);

}
