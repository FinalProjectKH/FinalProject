package com.example.demo.employee.model.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
    
//    @ManyToOne // 사원(Many)은 하나의 부서(One)에 속한다.
//    @JoinColumn(name = "DEPT_CODE", insertable = false, updatable = false)
//    private Department department;

    @Column(name = "POSITION_CODE")
    private String positionCode;

    @Column(name = "EMP_EMAIL")
    private String empEmail;

    @Column(name = "EMP_NICKNAME")
    private String empNickname;

    @Column(name = "EMP_PHONE")
    private String empPhone;

    @Column(name = "ENROLL_DATE")
    private LocalDate enrollDate;

    @Column(name = "EMP_DEL_FL")
    private String empDelFl;

    @Column(name = "INTRODUCTION")
    private String introduction;

    @Column(name = "PROFILE_IMG")
    private String profileImg;

    @Column(name = "AUTHORITY_LEVEL")
    private Integer authorityLevel;
    
    @Column(name = "OWNER_EMP_NO")
    private String ownerEmpNo;
    
    @Builder.Default
    @Column(name = "TOTAL_LEAVE") // DB 컬럼명과 매칭 (없으면 자동 생성)
    private Double totalLeave = 15.0; // 기본값 15일 설정
}