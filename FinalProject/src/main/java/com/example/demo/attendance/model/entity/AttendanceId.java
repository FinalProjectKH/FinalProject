package com.example.demo.attendance.model.entity;

import java.io.Serializable;
import java.time.LocalDate;

import lombok.EqualsAndHashCode;

@EqualsAndHashCode
public class AttendanceId implements Serializable {
	
	private String empNo;
	private LocalDate workDate;
}
