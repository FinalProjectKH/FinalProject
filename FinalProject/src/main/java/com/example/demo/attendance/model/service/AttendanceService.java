package com.example.demo.attendance.model.service;

public interface AttendanceService {
	
	// 출근 서비스
	String checkIn(String empNo);

	// 퇴근 서비스
	String checkOut(String empNo);
}
