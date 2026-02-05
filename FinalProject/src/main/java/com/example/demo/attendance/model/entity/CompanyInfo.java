package com.example.demo.attendance.model.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COMPANY_INFO")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyInfo {
	@Id
	@Column(name = "IP_NO")
    private Long ipNo;

    @Column(name = "ALLOWED_IP")
    private String allowedIp;

    @Column(name = "UPDATING_EMP_NO")
    private String updatingEmpNo;

    @Column(name = "MODIFY_DT")
    private LocalDate modifyDt;

}
