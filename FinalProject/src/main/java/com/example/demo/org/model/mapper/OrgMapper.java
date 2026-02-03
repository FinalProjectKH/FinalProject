package com.example.demo.org.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.employee.model.dto.LoginMemberDTO;

@Mapper
public interface OrgMapper {

	List<LoginMemberDTO> selectOrgTree();

}
