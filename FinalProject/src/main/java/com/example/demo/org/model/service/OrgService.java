package com.example.demo.org.model.service;

import java.util.List;

import com.example.demo.employee.model.dto.LoginMemberDTO;

public interface OrgService {

	List<LoginMemberDTO> selectOrgTree();

}
