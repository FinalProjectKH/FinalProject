package com.example.demo.admin.modal.service;

import java.util.List;
import java.util.Map;

public interface AdminService {

	boolean verifyPassword(String empNo, String adminPw);
	
	//부서 전체 조회
	List<Map<String, Object>> fetchDeptList();
	
	//직급 전체 조회
	List<Map<String, Object>> fetchPositionList();

}
