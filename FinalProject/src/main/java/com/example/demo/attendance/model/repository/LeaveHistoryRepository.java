package com.example.demo.attendance.model.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.attendance.model.entity.LeaveHistory;

public interface LeaveHistoryRepository extends JpaRepository<LeaveHistory, Long> {
    
    // 특정 사원의 모든 휴가 기록 조회
    List<LeaveHistory> findByEmployeeEmpNo(String empNo);

    // 오늘 날짜가 시작일과 종료일 사이에 있는 휴가 기록 조회 (오늘의 휴가자)
    @Query("SELECT COUNT(l) FROM LeaveHistory l WHERE l.employee.deptCode = :deptCode " +
           "AND :today BETWEEN l.startDate AND l.endDate")
    int countTodayLeave(@Param("deptCode") String deptCode, @Param("today") LocalDate today);
    
    // 특정 부서(deptCode)에 속한 모든 사원의 휴가 기록 조회
    @Query("SELECT l FROM LeaveHistory l WHERE l.employee.deptCode = :deptCode")
    List<LeaveHistory> findByDepartment(@Param("deptCode") String deptCode);
}
