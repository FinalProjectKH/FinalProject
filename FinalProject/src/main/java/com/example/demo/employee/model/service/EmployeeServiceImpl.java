package com.example.demo.employee.model.service;


import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.employee.controller.EmployeeController.ChangePasswordRequest;
import com.example.demo.employee.controller.EmployeeController.ChangePwResult;
import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.employee.model.mapper.EmployeeMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {
	
	private final EmployeeMapper mapper;
	private final BCryptPasswordEncoder bcrypt;
	
	@Override
	public LoginMemberDTO login(Employee inputMember) {
		
		log.info("입력 empId = " + inputMember.getEmpId());
		log.info("입력 empPw = " + inputMember.getEmpPw());

		LoginMemberDTO loginMember = mapper.login(inputMember.getEmpId());
		
		if (loginMember == null) {
			  System.out.println("loginMember == null (empId=" + inputMember.getEmpId() + ")");
			  return null;
			}
				
		log.info("조회한 empId = " + loginMember.getEmpId());
		log.info("조회한 empPw = " + loginMember.getEmpPw());
		
		if(loginMember == null) return null;
		
		if(!bcrypt.matches(inputMember.getEmpPw(), 
							loginMember.getEmpPw())) return null;
		
		loginMember.setEmpPw(null);
		return loginMember;
	}

	@Override
	public ChangePwResult changePasswordRequest(String empNo, ChangePasswordRequest request) {
		
		// 1. 현재 암호 조회
        String dbHash = mapper.findPasswordByEmpNo(empNo);
        if (dbHash == null) {
            return ChangePwResult.UPDATE_FAILED;
        }
        
        // 2. 현재 비밀번호 검증
        if (!bcrypt.matches(request.currentPassword(), dbHash)) {
            return ChangePwResult.WRONG_CURRENT_PW;
        }
        
        // 3️. 새 비밀번호가 기존과 동일한지 체크
        if (bcrypt.matches(request.newPassword(), dbHash)) {
            return ChangePwResult.SAME_AS_OLD;
        }
        
        // 4️. 새 비밀번호 암호화
        String encodedPw = bcrypt.encode(request.newPassword());
        
        // 5️. 업데이트
        int updated = mapper.updatePassword(empNo, encodedPw);

        return updated == 1
                ? ChangePwResult.SUCCESS
                : ChangePwResult.UPDATE_FAILED;
	}
}
