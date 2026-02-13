package com.example.demo.approval.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.approval.model.dto.ApprovalDto;
import com.example.demo.approval.model.dto.ApprovalLineDto;
import com.example.demo.approval.model.dto.ExpenseDetailDto;
import com.example.demo.approval.model.dto.TotalVacationDto;

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
	
	// 1. 내 연차 정보 조회 (연도, 사번 필요)
	TotalVacationDto selectTotalVacation(@Param("empNo") String empNo, @Param("year") String year);

	// 2. 연차 차감 (사용일수 증가, 잔여일수 감소)
	int updateVacationUsage(
	    @Param("empNo") String empNo, 
	    @Param("year") String year, 
	    @Param("count") double count
	);
	
	// 1. 재직 중인 전 직원 사번 조회
	List<String> selectAllActiveEmpNos();

	// 2. 해당 연도 연차 데이터가 있는지 확인 (중복 생성 방지)
	int countVacationData(@Param("empNo") String empNo, @Param("year") String year);

	// 3. 연차 20개 생성 (INSERT)
	int insertTotalVacation(TotalVacationDto dto);

	// 공휴일 체크
	List<String> selectHolidayList(
	        @Param("startDate") String startDate, 
	        @Param("endDate") String endDate
	    );

	String selectDeductYn(String type);

	Map<String, Object> selectSidebarCounts(String empNo);

	void deleteApproval(String docNo);


}
