package com.example.demo.mypage.controller;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
	
	@PutMapping("profileImg")
	public ResponseEntity<LoginMemberDTO> updateProfileImg ( @RequestPart("profileImg") MultipartFile file, HttpSession session) throws IOException{
		
		LoginMemberDTO loginMember = (LoginMemberDTO)session.getAttribute("loginMember");
			if(loginMember == null) {
				return ResponseEntity.status(401).build();
			}
		
		//파일 없음
		if (file == null || file.isEmpty()) {
		    return ResponseEntity.badRequest().build();
		}
		
		//이미지 파일만 업로드 가능
		String type = file.getContentType();
		if (type == null || !type.startsWith("image/")) {
		    return ResponseEntity.badRequest().build();
		}
		LoginMemberDTO result = service.updateProfileImg(loginMember, file);
		
		return ResponseEntity.ok(result);
	}
	
}
