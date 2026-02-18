package com.example.demo.attendance.model.service;

import java.time.Duration;

import java.time.LocalDate;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.chrono.ChronoLocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.attendance.model.dto.AttendanceDTO;
import com.example.demo.attendance.model.dto.AttendanceDept;
import com.example.demo.attendance.model.entity.Attendance;
import com.example.demo.attendance.model.entity.LeaveHistory;
import com.example.demo.attendance.model.repository.AttendanceRepository;
import com.example.demo.attendance.model.repository.CompanyInfoRepository;
import com.example.demo.attendance.model.repository.LeaveHistoryRepository;
import com.example.demo.employee.model.entity.Employee;
import com.example.demo.employee.model.repository.EmployeeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

	private final AttendanceRepository attendanceRepository;
	private final CompanyInfoRepository companyInfoRepository;
	private final LeaveHistoryRepository leaveHistoryRepository;
	private final EmployeeRepository employeeRepository;

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
	@Override
	public List<AttendanceDTO> getWeeklyAttendance(String empNo, String startDate) {
	    LocalDate start;
	    try {
	        if (startDate == null || startDate.isEmpty()) {
	            start = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
	        } else {
	            // 🏎️💨 안전하게 앞 10자리만 잘라서 파싱 (yyyy-MM-dd)
	            start = LocalDate.parse(startDate.substring(0, 10));
	        }
	    } catch (Exception e) {
	        start = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
	    }
	    
	    LocalDate end = start.plusDays(6);

	    List<Attendance> list = attendanceRepository.findByEmpNoAndWorkDateBetweenOrderByWorkDateAsc(empNo, start, end);

	    return list.stream().map(attendance -> {
	        long minutes = 0;
	        if (attendance.getStartTime() != null) {
	            // 퇴근 시간 없으면 18시로 가상 종료 시간 설정
	            LocalDateTime calcEnd = (attendance.getEndTime() != null) 
	                ? attendance.getEndTime() 
	                : attendance.getStartTime().withHour(18).withMinute(0).withSecond(0).withNano(0);
	            
	            minutes = java.time.Duration.between(attendance.getStartTime(), calcEnd).toMinutes();
	        }

	        return AttendanceDTO.builder()
	                .empNo(attendance.getEmpNo())
	                .workDate(attendance.getWorkDate().toString())
	                .startTime(attendance.getStartTime().toString())
	                .endTime(attendance.getEndTime() != null ? attendance.getEndTime().toString() : null)
	                .workMinutes(minutes) 
	                .status(attendance.getStatus())
	                .build();
	    }).collect(Collectors.toList());
	}
	
	// 사내 IP 서비스
	public void checkIpAddress(String clientIp) {
		// DB에서 허용된 IP 목록에 있는지 조회
		boolean isAllowed = companyInfoRepository.existsByAllowedIp(clientIp);
		log.info("DB 대조 결과 - 존재 여부: {}", isAllowed); // 여기서 false가 뜨는지 확인!

		if (!isAllowed) {
			// 1. 서버 로그에는 남김 (관리자용)
			log.info("[보안 알림] 허용되지 않은 IP 접속 시도됨 - 접속 IP: {}", clientIp);

			// 2. 사용자에게는 핵심 내용만 전달
			throw new RuntimeException("사내 지정 네트워크 환경에서만 출근이 가능합니다. (사내 Wi-Fi를 확인해 주세요)");
		}
	}
	
	// 부서 근태 관리 조회 서비스
	@Override
	public List<AttendanceDept> getDeptAttendanceList(String deptCode, String date) {
	    log.info("[Service] 부서 근태 데이터 프로세싱 시작 - 부서: {}", deptCode);
	    
	    LocalDate targetDate = LocalDate.parse(date);
	    List<Attendance> entities = attendanceRepository.findByDeptCodeAndWorkDate(deptCode, targetDate);

	    if (entities.isEmpty()) {
	        log.info("[Service] 조회된 근태 기록이 없음 - 부서: {}, 일자: {}", deptCode, date);
	        return Collections.emptyList();
	    }

	    return entities.stream()
	            .filter(entity -> entity.getEmployee() != null)
	            .map(entity -> {
	                AttendanceDept dto = new AttendanceDept();
	                dto.setEmpNo(entity.getEmployee().getEmpNo());
	                dto.setEmpName(entity.getEmployee().getEmpName());
	                dto.setDeptCode(entity.getEmployee().getDeptCode());

	                // 시간 데이터 안전하게 변환
	                String start = (entity.getStartTime() != null) ? 
	                               entity.getStartTime().toLocalTime().toString() : "-";
	                String end = (entity.getEndTime() != null) ? 
	                             entity.getEndTime().toLocalTime().toString() : "-";

	                dto.setStartTime(start);
	                dto.setEndTime(end);

	                // 실무형 근태 판별 로직
	                LocalTime standardIn = LocalTime.of(9, 0);
	                if (entity.getStartTime() != null) {
	                    dto.setLate(entity.getStartTime().toLocalTime().isAfter(standardIn));
	                    dto.setMissing(entity.getEndTime() == null);
	                } else {
	                    dto.setMissing(true); // 출근 기록 자체가 없으면 일단 누락/결근 처리
	                }

	                return dto;
	            }).collect(Collectors.toList());
	}

	@Override
	// 개인 잔여 휴가 계산
    public double getRemainingLeave(String empNo) {
        Employee emp = employeeRepository.findById(empNo).orElseThrow();
        
        // emp.getTotalLeave()가 null이면 15.0을 사용하도록 방어 코드 추가
        double totalLeave = (emp.getTotalLeave() != null) ? emp.getTotalLeave() : 15.0;
        
        double usedLeave = leaveHistoryRepository.findByEmployeeEmpNo(empNo)
                .stream()
                .mapToDouble(LeaveHistory::getLeaveDays)
                .sum();
                
        return totalLeave - usedLeave;
    }

	@Override
	public int getTodayLeaveCount(String deptCode) {
		return leaveHistoryRepository.countTodayLeave(deptCode, LocalDate.now());
	}
	
	@Override
	public List<LeaveHistory> getDeptLeaveHistory(String deptCode, int authorityLevel) {
	    // 💡 방어 코드: 권한 레벨이 2(과장/관리자) 이상인 경우에만 데이터 반환
	    if (authorityLevel < 2) {
	        throw new RuntimeException("조회 권한이 없습니다.");
	    }
	    
	    return leaveHistoryRepository.findByDepartment(deptCode);
	}
}
