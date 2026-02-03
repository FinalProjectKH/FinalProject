package com.example.demo.mypage.model.service;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;

public interface MypageService {

	LoginMemberDTO updateProfile(String empNo, Employee req);

}
