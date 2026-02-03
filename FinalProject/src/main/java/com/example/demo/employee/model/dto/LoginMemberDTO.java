package com.example.demo.employee.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 로그인 응답용 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginMemberDTO {
	
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
	
	private String positionName;
	private int authorityLevel;
	
	private String deptName;
	private String parentDeptCode;
	
}
