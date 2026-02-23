package com.example.demo.attendance.model.entity;

import java.time.LocalDate;

import com.example.demo.employee.model.entity.Employee;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "LEAVE_HISTORY")
@Data
public class LeaveHistory {
	
	    @Id
	    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "leave_seq_gen")
	    @SequenceGenerator(
	            name = "leave_seq_gen", 
	            sequenceName = "SEQ_LEAVE_NO", // 💡 DB에 만든 시퀀스 이름
	            allocationSize = 1             // 💡 시퀀스에서 한 번에 가져올 번호 양
	        )
	    private Long leaveNo;

	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "EMP_NO")
	    private Employee employee; // 사원 엔티티와 연관관계 매핑

	    private LocalDate startDate;
	    private LocalDate endDate;
	    private String leaveType;
	    private Double leaveDays;
	}
