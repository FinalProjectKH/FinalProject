package com.example.demo.org.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.employee.model.service.EmployeeService;
import com.example.demo.org.model.service.OrgService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("org")
@RequiredArgsConstructor
public class OrgController {
	
	private final OrgService service;
	
	//로그인용 DTO를 재사용하여 반환 중임 -> 추후 조직도에 필요한 필드 추가/제거 할때 조직도용 DTO 만들기 바람.
	
	@PostMapping("orgTree")
	public List<LoginMemberDTO> selectOrgTree(){
		
		List<LoginMemberDTO> orgList = service.selectOrgTree();
		
		return orgList;
	}

}
