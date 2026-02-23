package com.example.demo.attendance.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDTO {
	private String empNo;
    private String workDate;
    private String startTime;
    private String endTime;
    private long workMinutes; // 🏎️💨 리액트가 바로 더할 수 있는 숫자!
    private String status;

}
