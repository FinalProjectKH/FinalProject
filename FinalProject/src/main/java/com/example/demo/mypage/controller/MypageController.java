package com.example.demo.mypage.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.mypage.model.service.MypageService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("mypage")
@RequiredArgsConstructor
public class MypageController {
	
	private final MypageService service;
	
	@PutMapping("profile")
	public ResponseEntity<LoginMemberDTO> updateProfile (@RequestBody Employee req, HttpSession session) {
		
		LoginMemberDTO loginMember = (LoginMemberDTO)session.getAttribute("loginMember");
		if(loginMember == null) {
			return ResponseEntity.status(401).build();
		}
		LoginMemberDTO result = service.updateProfile(loginMember.getEmpNo(), req);
		
		if(result == null) return ResponseEntity.status(400).build();
		
        session.setAttribute("loginMember", result);
		
		return ResponseEntity.ok(result) ;
	}
	
}
