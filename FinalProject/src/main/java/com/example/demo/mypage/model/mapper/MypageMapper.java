package com.example.demo.mypage.model.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;

@Mapper
public interface MypageMapper {

	Employee selectEmployee(String empNo);

	int updateEmployee(Employee update);

	LoginMemberDTO selectLoginMember(String empNo);

}
