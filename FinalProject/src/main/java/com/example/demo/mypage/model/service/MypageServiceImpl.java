package com.example.demo.mypage.model.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.mypage.model.mapper.MypageMapper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
public class MypageServiceImpl implements MypageService{
	
	private final MypageMapper mapper;

	@Override
	public LoginMemberDTO updateProfile(String empNo, Employee req) {
		
		
		// 1. empNo로 기존 회원 조회
		Employee origin = mapper.selectEmployee(empNo);
		if (origin == null) return null;
		
		// 2. req 값 중 null 아닌 필드만 선별
		Employee update = new Employee();
		
		//StringUtils.hasText(문자)-> null 아님 + 빈 문자열 아님 + 공백만 있는 문자열 아님 인지 확인
		//값이 있을 때만 UPDATE, 조건에 만족하지 않으면 필드는 업데이트에서 제외
		if (StringUtils.hasText(req.getEmpEmail())) update.setEmpEmail(req.getEmpEmail());
		if (StringUtils.hasText(req.getEmpNickname())) update.setEmpNickname(req.getEmpNickname());
		if (StringUtils.hasText(req.getEmpPhone())) update.setEmpPhone(req.getEmpPhone());
		if (StringUtils.hasText(req.getIntroduction())) update.setIntroduction(req.getIntroduction());

		update.setEmpNo(empNo); 
		
		// 3. UPDATE 실행
		int result = mapper.updateEmployee(update);
		
		// 4. UPDATE 결과 확인
		if (result == 0) return null;
		
		// 5. UPDATE 성공 시 SELECT
		LoginMemberDTO updated = mapper.selectLoginMember(empNo);

		// 6. 조회 결과를 `LoginMemberDTO`로 반환
		return updated;
	}

}
