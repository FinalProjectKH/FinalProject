package com.example.demo.attendance.model.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.demo.employee.model.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ATTENDANCE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(AttendanceId.class) // 복합키 설정을 위한 클래스 지정
public class Attendance {
	
	@Id
	@Column(name = "EMP_NO")
	private String empNo;
	
	@ManyToOne
	@JoinColumn(name = "EMP_NO", insertable = false, updatable = false)
	private Employee employee;
	
	@Id
	@Column(name = "WORK_DATE")
	private LocalDate workDate; // 날짜만 저장 (DEFAULT SYSDATE 반영)
	
	@Column(name = "START_TIME")
	private LocalDateTime startTime;
	
	@Column(name = "END_TIME")
	private LocalDateTime endTime;
	
	@Column(name = "WORKING_HOURS")
	private Double workingHours;
	
	@Column(name = "STATUS", nullable = false)
	private String status = "정상";

}
