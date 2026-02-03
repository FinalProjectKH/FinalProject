package com.example.demo.employee.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
	
	@PostMapping("logout")
	public ResponseEntity<String> logout(HttpSession session) {
		// ResponseEntity 
		// Spring에서 제공하는 Http 응답 데이터를
		// 커스터마이징 할 수 있도록 지원하는 클래스
		// -> Http 상태코드, 헤더, 응답 본문(body)을 모두 설정 가능
		try {
			session.invalidate(); // 세션 무효화 처리
			return ResponseEntity.status(HttpStatus.OK) // 200
					.body("로그아웃이 완료되었습니다");
			
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) // 500
					.body("로그아웃 중 예외 발생 : " + e.getMessage());
		}
	}
	
}
