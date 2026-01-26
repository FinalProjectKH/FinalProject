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
	
	private String epmNo;
	private String epmName;
	private String epmId;
	private String epmPw;
	private String deptCode;
	private String positionCode;
	private String epmEmail;
	private String epmNickname;
	private String epmPhone;
	private String enrollDate;
	private String epmDelFl;
	private String introduction;
	private String profileImg;

}
