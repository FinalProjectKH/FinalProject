package com.example.demo.admin.modal.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.admin.modal.mapper.AdminMapper;

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

}
