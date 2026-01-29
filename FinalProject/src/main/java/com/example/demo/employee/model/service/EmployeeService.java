package com.example.demo.employee.model.service;

import com.example.demo.employee.model.dto.Employee;
import com.example.demo.employee.model.dto.LoginMemberDTO;

public interface EmployeeService {

	LoginMemberDTO login(Employee inputMember);

}
