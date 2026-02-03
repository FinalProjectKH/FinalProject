package com.example.demo.attendance.model.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.attendance.model.entity.Attendance;
import com.example.demo.attendance.model.entity.AttendanceId;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, AttendanceId> {
	
	/**
	 * 사원 번호와 일자를 기준으로 출근 기록 존재 여부 확인
	 * [사용처] 출근 버튼 중복 클릭 방지 로직
	 * [DBA Point] SELECT 1 및 LIMIT 1을 사용하여 실제 데이터 로드 없이 존재 여부만 빠르게 판단
	 */
	boolean existsByEmpNoAndWorkDate(String empNo, LocalDate workDate);
	
	
	/**
	 * 사원 번호와 근무 일자를 기준으로 특정 출근 상세 기록 조회
	 * [사용처] 퇴근 시간 업데이트(Dirty Checking) 또는 근태 정보 상세 조회
	 * [DBA Point] 엔티티 전체를 영속성 컨텍스트에 로드하므로, 단순 존재 확인용으로는 사용 지양
	 */
	Optional<Attendance> findByEmpNoAndWorkDate(String empNo, LocalDate workDate);
	
	// 특정 사원의 특정 기간(시작일 ~ 종료일) 데이터를 모두 가져오는 쿼리 메서드
	List<Attendance> findByEmpNoAndWorkDateBetweenOrderByWorkDateAsc(String empNo, LocalDate startDate, LocalDate endDate);
	
	
}