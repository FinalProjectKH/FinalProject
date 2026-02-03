package com.example.demo.org.model.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.org.model.mapper.OrgMapper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
public class OrgServiceImpl implements OrgService{
	
	private final OrgMapper mapper;

	@Override
	public List<LoginMemberDTO> selectOrgTree() {
		List<LoginMemberDTO> orgList = mapper.selectOrgTree();
		
		for(LoginMemberDTO dto : orgList) {
			dto.setEmpPw(null);
		}
		return orgList;
	}

}
