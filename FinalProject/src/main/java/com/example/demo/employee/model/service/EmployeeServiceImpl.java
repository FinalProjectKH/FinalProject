package com.example.demo.employee.model.service;


import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.mapper.EmployeeMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {
	
	private final EmployeeMapper mapper;
	private final BCryptPasswordEncoder bcrypt;
	
	@Override
	public Employee login(Employee inputMember) {
		
		log.info("입력 empId = " + inputMember.getEmpId());
		log.info("입력 empPw = " + inputMember.getEmpPw());

		Employee loginMember = mapper.login(inputMember.getEmpId());
		
		if (loginMember == null) {
			  System.out.println("loginMember == null (empId=" + inputMember.getEmpId() + ")");
			  return null;
			}
				
		log.info("조회한 empId = " + loginMember.getEmpId());
		log.info("조회한 empPw = " + loginMember.getEmpPw());
		
		if(loginMember == null) return null;
		
		if(!bcrypt.matches(inputMember.getEmpPw(), 
							loginMember.getEmpPw())) return null;
		
		loginMember.setEmpPw(null);
		return loginMember;
	}
}
