package com.example.demo.admin.modal.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.demo.admin.controller.AdminController.CreateEmployeeRequest;
import com.example.demo.admin.controller.AdminController.UpdateEmployeeRequest;

@Mapper
public interface AdminMapper {

	String selectAdminHash(String empNo);

	List<Map<String, Object>> fetchDeptList();

	List<Map<String, Object>> fetchPositionList();

	List<Map<String, Object>> employeeSearch(@Param("keyword") String keyword, @Param("includeResigned") boolean includeResigned);

	Map<String, Object> getEmployee(String empNo);

	String selectNextEmpNoForUpdate();

	int countByEmpId(String empId);

	int insertEmployee(@Param("req") CreateEmployeeRequest req, @Param("encPw") String encPw, @Param("genEmail") String genEmail, @Param("genNickname") String genNickname, @Param("genPhone") String genPhone);

	String selectEmpNoByEmpId(String empId);

	int updateEmployee(@Param("req") UpdateEmployeeRequest req);

	int empResigned(String empNo);

	int empReturn(String empNo);

}
