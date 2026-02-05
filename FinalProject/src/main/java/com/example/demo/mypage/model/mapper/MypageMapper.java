package com.example.demo.mypage.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;

@Mapper
public interface MypageMapper {

	Employee selectEmployee(String empNo);

	int updateEmployee(Employee update);

	LoginMemberDTO selectLoginMember(String empNo);

	void updateProfileImg( @Param("empNo") String empNo, @Param("webPath") String webPath);

}
