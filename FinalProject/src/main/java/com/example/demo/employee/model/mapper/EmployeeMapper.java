package com.example.demo.employee.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.mybatis.spring.annotation.MapperScan;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;

@Mapper
public interface EmployeeMapper {

	LoginMemberDTO login(@Param("empId") String empId);
	
	
}
