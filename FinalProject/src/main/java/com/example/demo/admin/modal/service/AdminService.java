package com.example.demo.admin.modal.service;

import java.util.List;
import java.util.Map;

import com.example.demo.admin.controller.AdminController.CreateEmployeeRequest;

public interface AdminService {

	boolean verifyPassword(String empNo, String adminPw);
	
	//부서 전체 조회
	List<Map<String, Object>> fetchDeptList();
	
	//직급 전체 조회
	List<Map<String, Object>> fetchPositionList();
	
	//전체 직원 정보 검색
	List<Map<String, Object>> employeeSearch(String keyword, boolean includeResigned);
	
	//선택한 직원 정보 검색
	Map<String, Object> getEmployee(String empNo);

	Map<String, Object> createEmployee(CreateEmployeeRequest req, String empNo);

}
