package com.example.demo.employee.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {
	
	private String empNo;
	private String empName;
	private String empId;
	private String empPw;
	private String deptCode;
	private String positionCode;
	private String empEmail;
	private String empNickname;
	private String empPhone;
	private String enrollDate;
	private String empDelFl;
	private String introduction;
	private String profileImg;

}
