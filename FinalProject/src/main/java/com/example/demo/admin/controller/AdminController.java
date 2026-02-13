package com.example.demo.admin.controller;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
	
	public record CreateEmployeeRequest(
		    String empName,
		    String empId,
		    String deptCode,
		    String positionCode
		) {}
	
	public record UpdateEmployeeRequest(
		    String empNo,
			String empName,
		    String empId,
		    String deptCode,
		    String positionCode
		) {}

	
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
	
	//부서 전체 조회
	@GetMapping("fetchDeptList")
	public ResponseEntity<List<Map<String, Object>>> fetchDeptList(){
		return ResponseEntity.ok(service.fetchDeptList());
	}
	
	//직급 전체 조회
	@GetMapping("fetchPositionList")
	public ResponseEntity<List<Map<String, Object>>> fetchPositionList(){
		return ResponseEntity.ok(service.fetchPositionList());
	}
	
	//전체 직원 정보 검색
	@GetMapping("employee/search")
	public ResponseEntity<List<Map<String, Object>>> employeeSearch (@RequestParam("keyword") String keyword, @RequestParam("includeResigned") boolean includeResigned) {
		return ResponseEntity.ok(service.employeeSearch (keyword, includeResigned));
	}
	
	//전체 직원 정보 검색
	@GetMapping("getEmployee")
	public ResponseEntity<Map<String, Object>> getEmployee (@RequestParam("empNo") String empNo) {
		return ResponseEntity.ok(service.getEmployee (empNo));
	}
	
	//계정 추가
	@PostMapping("employee")
	public ResponseEntity<Map<String, Object>> createEmployee(
	    @RequestBody CreateEmployeeRequest req,
	    HttpSession session
	) {
	    LoginMemberDTO loginMember = (LoginMemberDTO) session.getAttribute("loginMember");
	    if (loginMember == null) return ResponseEntity.status(401).build();
	    if (loginMember.getAuthorityLevel() < 3) return ResponseEntity.status(403).build();

	    return ResponseEntity.ok(service.createEmployee(req,loginMember.getEmpNo()));
	}
	
	//계정 수정
	@PutMapping("update")
	public ResponseEntity<Map<String, Object>> updateEmployee(@RequestBody UpdateEmployeeRequest req){
		try {
			Map<String, Object> result = service.updateEmployee(req);
			 return ResponseEntity.ok(result); // 200
		}catch(IllegalArgumentException e){
	        return ResponseEntity
	                .badRequest()
	                .body(Map.of("message", e.getMessage())); // 400
		}catch(NoSuchElementException e){
	        return ResponseEntity
	                .status(HttpStatus.NOT_FOUND)
	                .body(Map.of("message", e.getMessage())); // 404
		}catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "서버 오류")); // 500
		}
	}

}
