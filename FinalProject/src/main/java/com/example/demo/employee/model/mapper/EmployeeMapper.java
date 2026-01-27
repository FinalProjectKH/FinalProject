package com.example.demo.employee.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.mybatis.spring.annotation.MapperScan;

import com.example.demo.employee.model.dto.Employee;

@Mapper
public interface EmployeeMapper {

	Employee login(@Param("empId") String empId);
	
	
}
