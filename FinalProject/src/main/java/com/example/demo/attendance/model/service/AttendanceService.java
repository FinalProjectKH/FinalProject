package com.example.demo.attendance.model.service;

import java.util.List;

import com.example.demo.attendance.model.dto.AttendanceDept;
import com.example.demo.attendance.model.entity.Attendance;

public interface AttendanceService {

	// 출근 서비스
	String checkIn(String empNo);

	// 퇴근 서비스
	String checkOut(String empNo);

	// IP 주소 체크 서비스
	void checkIpAddress(String clientIp);

	// 근태 주간리스트 목록 서비스
	List<Attendance> getWeeklyAttendance(String empNo, String startDate);

	// 부서 근태 목록 서비스
	List<AttendanceDept> getDeptAttendanceList(Long deptId, String date);

	

}
