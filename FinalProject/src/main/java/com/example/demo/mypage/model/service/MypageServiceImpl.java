package com.example.demo.mypage.model.service;

import java.io.File;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.common.utility.CommonUtils;
import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.mypage.model.mapper.MypageMapper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
public class MypageServiceImpl implements MypageService {

	private final MypageMapper mapper;

	@Value("${my.profile.web-path}")
	private String profileWebPath; // -> /myPage/profile/**

	@Value("${my.profile.folder-path}")
	private String profileFolderPath; // -> file:///C:/japFiles/profileImg/

	@Override
	public LoginMemberDTO updateProfile(String empNo, Employee req) {

		// 1. empNo로 기존 회원 조회
		Employee origin = mapper.selectEmployee(empNo);
		if (origin == null)
			return null;

		// 2. req 값 중 null 아닌 필드만 선별
		Employee update = new Employee();

		// StringUtils.hasText(문자)-> null 아님 + 빈 문자열 아님 + 공백만 있는 문자열 아님 인지 확인
		// 값이 있을 때만 UPDATE, 조건에 만족하지 않으면 필드는 업데이트에서 제외
		if (StringUtils.hasText(req.getEmpEmail()))
			update.setEmpEmail(req.getEmpEmail());
		if (StringUtils.hasText(req.getEmpNickname()))
			update.setEmpNickname(req.getEmpNickname());
		if (StringUtils.hasText(req.getEmpPhone()))
			update.setEmpPhone(req.getEmpPhone());
		if (StringUtils.hasText(req.getIntroduction()))
			update.setIntroduction(req.getIntroduction());

		update.setEmpNo(empNo);

		// 3. UPDATE 실행
		int result = mapper.updateEmployee(update);

		// 4. UPDATE 결과 확인
		if (result == 0)
			return null;

		// 5. UPDATE 성공 시 SELECT
		LoginMemberDTO updated = mapper.selectLoginMember(empNo);

		// 6. 조회 결과를 `LoginMemberDTO`로 반환
		return updated;
	}

	@Override
	public LoginMemberDTO updateProfileImg(LoginMemberDTO loginMember, MultipartFile file) {

		// 1. empNo로 기존 회원 조회
		Employee origin = mapper.selectEmployee(loginMember.getEmpNo());
		if (origin == null)
			return null;

	    // 2. 파일명 변경
	    String rename = CommonUtils.fileRename(file.getOriginalFilename());

	    // 3. 실제 저장 경로
	    File saveFile = new File(profileFolderPath + "/" + rename);// 실제 저장 위치
	    try {
	    	file.transferTo(saveFile);
		} catch (IOException e) {
			throw new RuntimeException("프로필 이미지 저장 실패", e);
		}
	    
	    // 4. DB에 저장할 웹 경로
	    String webPath = profileWebPath + "/" + rename;// DB에 저장할 값

	    // 5. DB UPDATE
	    mapper.updateProfileImg(loginMember.getEmpNo(), webPath);

	    // 6. 최신 사용자 정보 재조회
	    return mapper.selectLoginMember(loginMember.getEmpNo());
	}

}
