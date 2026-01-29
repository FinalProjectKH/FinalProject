package com.example.demo.employee.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.employee.model.service.EmployeeService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("employee")
@RequiredArgsConstructor
//@SessionAttributes({"loginMember"})
public class EmployeeController {
	
	private final EmployeeService service;
	
	@PostMapping("login")
	public LoginMemberDTO login(@RequestBody Employee inputMember, HttpSession session) {
		
		LoginMemberDTO  loginMember = service.login(inputMember);
		
		if(loginMember == null) return null;
		
        session.setAttribute("loginMember", loginMember);
        
		return loginMember;
		
	}
	
}
