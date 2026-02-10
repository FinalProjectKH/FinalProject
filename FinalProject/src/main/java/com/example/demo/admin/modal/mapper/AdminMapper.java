package com.example.demo.admin.modal.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.bind.annotation.RequestParam;

@Mapper
public interface AdminMapper {

	String selectAdminHash(String empNo);

	List<Map<String, Object>> fetchDeptList();

	List<Map<String, Object>> fetchPositionList();

	List<Map<String, Object>> employeeSearch(@Param("keyword") String keyword, @Param("includeResigned") boolean includeResigned);

	Map<String, Object> getEmployee(String empNo);

}
