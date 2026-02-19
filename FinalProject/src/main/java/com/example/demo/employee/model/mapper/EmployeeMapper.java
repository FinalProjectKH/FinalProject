package com.example.demo.employee.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.employee.model.dto.LoginMemberDTO;

@Mapper
public interface EmployeeMapper {

	LoginMemberDTO login(@Param("empId") String empId);

	String findPasswordByEmpNo(@Param("empNo") String empNo);

	int updatePassword(@Param("empNo") String empNo,@Param("encPw") String encodedPw);
	
}
