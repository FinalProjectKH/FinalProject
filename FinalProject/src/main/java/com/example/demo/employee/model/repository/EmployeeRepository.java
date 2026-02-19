package com.example.demo.employee.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.employee.model.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, String> {
    // 사번(empNo)이 String이라면 <Employee, String>
    // 사번이 Long(숫자)이라면 <Employee, Long>으로 타입을 맞춰줘!
}