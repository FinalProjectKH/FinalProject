package com.example.demo.attendance.model.service;

import java.time.Duration;
import java.time.LocalDate;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.attendance.model.entity.Attendance;
import com.example.demo.attendance.model.repository.AttendanceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AttendanceServiceImpl implements AttendanceService {

	private final AttendanceRepository attendanceRepository;

	// 업무일 존재 여부 서비스
	@Override
	public String checkIn(String empNo) {

		LocalDate today = LocalDate.now();

		// 1. 이미 출근했는지 확인
		if (attendanceRepository.existsByEmpNoAndWorkDate(empNo, today)) {
			throw new RuntimeException("이미 출근 처리된 사원입니다.");
		}

		// 2. 현재 시간 확인 및 지각 여부 판단
		LocalDateTime now = LocalDateTime.now();
		String status = LocalTime.now().isAfter(LocalTime.of(9, 0)) ? "지각" : "정상";

		// 3. Entity 객체 생성 및 저장
		Attendance attendance = Attendance.builder().empNo(empNo).workDate(today).startTime(now).status(status).build();

		attendanceRepository.save(attendance);

		return "출근 처리되었습니다.";

	}

	// 퇴근 조회 서비스
	@Override
	public String checkOut(String empNo) {

		LocalDate today = LocalDate.now();

		// 1. 오늘 출근 기록 조회
		Attendance attendance = attendanceRepository.findByEmpNoAndWorkDate(empNo, today)
				.orElseThrow(() -> new RuntimeException("출근 기록이 없습니다. 먼저 출근해 주세요."));

		if (attendance.getEndTime() != null) {
			throw new RuntimeException("이미 퇴근 처리가 완료되었습니다.");
		}

		// 2. 퇴근 시간 기록(현재 시각)
		LocalDateTime now = LocalDateTime.now();
		attendance.setEndTime(LocalDateTime.now());

		// 3. 근무 시간 계산 (START_TIME과 END_TIME의 차이)
		// Duration : 두 시간 사이의 차이를 계산하게 도와주는 객체
		// between : 두 시간 사이의 간격을 계산
		Duration duration = Duration.between(attendance.getStartTime(), now);

		// 초 단위로 차이를 구함
		double hours = duration.getSeconds() / 3600.0;

		// 소수점 둘쨰 자리까지만 깔끔하게 반올림해서 저장
		double formattedHours = Math.round(hours * 100) / 100.0;

		attendance.setWorkingHours(formattedHours);

		return "퇴근 처리되었습니다. (오늘 총 근무 시간 : " + formattedHours + "시간)";
	}

	// 출퇴근 목록 조회 서비스
	public List<Attendance> getWeeklyAttendance(String empNo, String startDate) {
		
		// 1. 프론트에서 넘겨준 문자열(예 : "2026-02-02")을 LocalDate 객체로 변환
		// 만약 전달값이 없을 경우를 대비해 null 체크 후 오늘 기준 월요일로 방어 로직 추가
		LocalDate start;
		if(startDate == null || startDate.isEmpty()) {
			start = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
		} else {
			start = LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE);
		}
		
		// 2. 시작 날짜(월요일)로부터 6일 뒤인 일요일을 계산 (주간 범위 생성)
		LocalDate end = start.plusDays(6);
		
		// JPA가 생성하는 쿼리: WHERE work_date BETWEEN start AND end
		// 날짜 순서대로 보여주기 위해 ASC 메서드 사용
		return attendanceRepository.findByEmpNoAndWorkDateBetweenOrderByWorkDateAsc(empNo, start, end);
	}

}
