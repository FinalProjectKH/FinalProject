package com.example.demo.employee.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.employee.model.service.EmployeeService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

//@SessionAttributes({"loginMember"})
@RestController
//@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("employee")
@RequiredArgsConstructor
public class EmployeeController {
	
	private final EmployeeService service;
	
	public record ChangePasswordRequest(
	        String currentPassword,
	        String newPassword
	) {}
	
	public enum ChangePwResult {
		  SUCCESS,          // 변경 성공
		  WRONG_CURRENT_PW, // 현재 비번 불일치
		  SAME_AS_OLD,      // 새 비번이 기존과 동일(선택)
		  UPDATE_FAILED     // DB 업데이트 실패(0 row 등)
		}

	@PostMapping("login")
	// 시큐리티 사용을 위해 현재의 로그인 로직을 유지하려면, 
	// 세션을 강제로 생성해서 브라우저에 주입
	public LoginMemberDTO login(@RequestBody Employee inputMember, HttpServletRequest request) { 
		
		LoginMemberDTO  loginMember = service.login(inputMember);
		
		if(loginMember == null) return null;
		
		// 세션을 강제로 생성하고 시큐리티 컨텍스트에 등록될 수 있게 함
		HttpSession session = request.getSession(true);
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
	
	@PostMapping("change-password")
	public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request, HttpSession session){
		LoginMemberDTO loginMember = (LoginMemberDTO) session.getAttribute("loginMember");
		if (loginMember == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		
		if(request == null) return ResponseEntity.badRequest().build();
		
		ChangePwResult result = service.changePasswordRequest(loginMember.getEmpNo(),request);
		
	    return switch (result) {
        case SUCCESS -> ResponseEntity.ok().build();
        case WRONG_CURRENT_PW -> ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        case SAME_AS_OLD -> ResponseEntity.status(HttpStatus.CONFLICT).build();      // 409 (선택)
        case UPDATE_FAILED -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
	    };
	}
	
}
