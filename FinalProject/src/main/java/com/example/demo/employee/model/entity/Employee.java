package com.example.demo.employee.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "EMPLOYEE") // 실제 오라클 테이블 명칭
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {
    
    @Id
    @Column(name = "EMP_NO")
    private String empNo; // 사번 (Primary Key)

    @Column(name = "EMP_NAME")
    private String empName;

    @Column(name = "EMP_ID")
    private String empId;

    @Column(name = "EMP_PW")
    private String empPw;

    @Column(name = "DEPT_CODE")
    private String deptCode;

    @Column(name = "POSITION_CODE")
    private String positionCode;

    @Column(name = "EMP_EMAIL")
    private String empEmail;

    @Column(name = "EMP_NICKNAME")
    private String empNickname;

    @Column(name = "EMP_PHONE")
    private String empPhone;

    @Column(name = "ENROLL_DATE")
    private String enrollDate;

    @Column(name = "EMP_DEL_FL")
    private String empDelFl;

    @Column(name = "INTRODUCTION")
    private String introduction;

    @Column(name = "PROFILE_IMG")
    private String profileImg;

    @Column(name = "AUTHORITY_LEVEL")
    private int authorityLevel; // 주영님 요청 필드

    @Column(name = "OWNER_EMP_NO")
    private String ownerEmpNo;
}