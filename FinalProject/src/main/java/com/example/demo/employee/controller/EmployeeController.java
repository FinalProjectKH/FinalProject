package com.example.demo.employee.controller;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttributes;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.service.EmployeeService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("employee")
@RequiredArgsConstructor
@SessionAttributes({"loginMember"})
public class EmployeeController {
	
	private final EmployeeService service;
	
	@PostMapping("login")
	public Employee login(@RequestBody Employee inputMember, Model model) {
		
		Employee loginMember = service.login(inputMember);
		
		if(loginMember == null) return null;
		
		model.addAttribute("loginMember", loginMember);
		return loginMember;
		
	}
	
}
