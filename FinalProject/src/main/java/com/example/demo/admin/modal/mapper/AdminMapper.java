package com.example.demo.admin.modal.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AdminMapper {

	String selectAdminHash(String empNo);

	List<Map<String, Object>> fetchDeptList();

	List<Map<String, Object>> fetchPositionList();

}
