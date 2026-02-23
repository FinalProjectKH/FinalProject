package com.example.demo.attendance.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDept {
	
	private String empNo;		// 사번
	private String empName;		// 사원명
	private String deptCode; 	// 부서명
	private String startTime;	// 출근시간
	private String endTime;		// 퇴근시간
	
	private boolean isLate;		  // 지각여부
	private boolean	isEarlyLeave; // 조퇴여부
	private boolean	isMissing;	  // 출퇴근 누락 여부
	
}
