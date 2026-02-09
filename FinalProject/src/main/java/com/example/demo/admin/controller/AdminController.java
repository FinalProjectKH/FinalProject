package com.example.demo.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.admin.modal.service.AdminService;
import com.example.demo.employee.model.dto.LoginMemberDTO;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;


@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("admin")
@RequiredArgsConstructor
public class AdminController {
	
	private final AdminService service;
	
	public record AdminPwRequest(String adminPw) {}
	
	@PostMapping("verify-password")
	public ResponseEntity<Void> verifyPassword(@RequestBody AdminPwRequest req, HttpSession session) {

	    LoginMemberDTO loginMember = (LoginMemberDTO) session.getAttribute("loginMember");
	    if (loginMember == null) return ResponseEntity.status(401).build();
	    
	    //권한 레벨 확인
	    if (loginMember.getAuthorityLevel() < 3) return ResponseEntity.status(403).build();
	   
	    String adminPw = req.adminPw();
	    if (adminPw == null || adminPw.isBlank()) return ResponseEntity.badRequest().build();

	    boolean ok = service.verifyPassword(loginMember.getEmpNo(), adminPw);

	    if (!ok) return ResponseEntity.status(401).build();
	    return ResponseEntity.ok().build();
	}
}
