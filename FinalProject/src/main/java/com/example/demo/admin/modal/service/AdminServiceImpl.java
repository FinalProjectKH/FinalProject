package com.example.demo.admin.modal.service;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.admin.controller.AdminController.CreateEmployeeRequest;
import com.example.demo.admin.controller.AdminController.UpdateEmployeeRequest;
import com.example.demo.admin.modal.mapper.AdminMapper;
import com.example.demo.common.utility.TempPwUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService{
	
	private final AdminMapper mapper;
	private final BCryptPasswordEncoder bcrypt; 

	@Override
	public boolean verifyPassword(String empNo, String adminPw) {
		
		String adminHash = mapper.selectAdminHash(empNo);
		
		if (adminHash == null) {
			log.warn("비밀번호 해시 조회 실패ㅜㅜ" );
			return false;
			};
		
		if(!bcrypt.matches(adminPw, adminHash)) {
			log.warn("관리자 비밀번호 불일치: empNo={} ", empNo);
			log.warn("관리자 비밀번호 불일치: adminPw.length() = {} " , (adminPw == null) ? 0 : adminPw.length());
			return false;
		}
		
		log.info("비밀번호 해시 조회 성공!!" );

		return true;
	}
	
	//부서 전체 조회
	@Override
	public List<Map<String, Object>> fetchDeptList() {
		return mapper.fetchDeptList();
	}
	
	//직급 전체 조회
	@Override
	public List<Map<String, Object>> fetchPositionList() {
		return mapper.fetchPositionList();
	}
	
	//전체 직원 정보 검색
	@Override
	public List<Map<String, Object>> employeeSearch(String keyword, boolean includeResigned) {
		return mapper.employeeSearch(keyword, includeResigned);
	}

	@Override
	public Map<String, Object> getEmployee(String empNo) {
		return mapper.getEmployee (empNo);
	}

	@Override
	public Map<String, Object> createEmployee(CreateEmployeeRequest req, String empNo) {
		
		// 기본 이메일
		String genEmail = req.empId() + "@japcompany.com";
		//기본 닉네임
		String genNickname = req.empName();
		//기본 닉네임
		String genPhone = "010-****-****";
		
        // 1) 임시 비밀번호 생성 (원하시는 정책으로)
        String tempPw = TempPwUtil.makeTempPw(8); // 예: 8자리
        String encPw = BCrypt.hashpw(tempPw, BCrypt.gensalt()); // 스프링 시큐리티 쓰면 PasswordEncoder 사용 추천

        // 2) 중복 ID 체크 (선택)
        int dup = mapper.countByEmpId(req.empId());
        if (dup > 0) throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        
        // 3) INSERT
        int inserted = mapper.insertEmployee(req, encPw, genEmail, genNickname, genPhone);
        if (inserted != 1) throw new RuntimeException("사원 추가에 실패했습니다.");
        
        //사번 조회
        String createdEmpNo = mapper.selectEmpNoByEmpId(req.empId());
        
        // 4) 프론트에 1회 표시할 값 리턴
        return Map.of("empNo", createdEmpNo, "empId", req.empId(), "tempPw", tempPw);
	}

	@Override
	public Map<String, Object> updateEmployee(UpdateEmployeeRequest req) {
		
	    if (req.empNo() == null) {
	    	//400 Bad Request
	        throw new IllegalArgumentException("empNo 필수");
	    }
	    
	    if (req.empName() == null
	            && req.empId() == null
	            && req.deptCode() == null
	            && req.positionCode() == null) {
	            throw new IllegalArgumentException("수정할 항목이 없습니다.");
	    }
	    
	    int updated = mapper.updateEmployee(req);
	    
	    if (updated == 0) {
	    	//404 Not Found
	        throw new NoSuchElementException("수정 대상 없음");
	    }
	    
		return Map.of("success", true);
	}

}
