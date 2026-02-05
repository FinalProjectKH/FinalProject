package com.example.demo.mypage.model.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;

public interface MypageService {

	LoginMemberDTO updateProfile(String empNo, Employee req);

	LoginMemberDTO updateProfileImg(LoginMemberDTO loginMember, MultipartFile file) throws IOException;

}
