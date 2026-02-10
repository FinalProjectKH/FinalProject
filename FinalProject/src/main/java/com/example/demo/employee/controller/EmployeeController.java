package com.example.demo.employee.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.employee.model.service.EmployeeService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

//@SessionAttributes({"loginMember"})
@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("employee")
@RequiredArgsConstructor
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

		try {
			session.invalidate(); 
			return ResponseEntity.status(HttpStatus.OK) 
					.body("로그아웃이 완료되었습니다");
			
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("로그아웃 중 예외 발생 : " + e.getMessage());
		}
	}
	
	
	/** 전자결재에 필요함 (로그인한 회원 정보 들고오기)
	 * @param session
	 * @return
	 */
	@GetMapping("myInfo")
    public ResponseEntity<LoginMemberDTO> getMyInfo(HttpSession session) {
        
        // 1. 세션에서 로그인 정보 가져오기
        LoginMemberDTO loginMember = (LoginMemberDTO) session.getAttribute("loginMember");
        
        // 2. 로그인 안 된 상태면 401 Unauthorized 반환
        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // 3. 보안상 비밀번호는 제거하고 반환 (선택사항)
        loginMember.setEmpPw(null); 
        
        return ResponseEntity.ok(loginMember);
    }
	
}
