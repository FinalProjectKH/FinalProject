package com.example.demo.attendance.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.attendance.model.entity.CompanyInfo;

@Repository
public interface CompanyInfoRepository extends JpaRepository<CompanyInfo, Long> {
	
	// DB에 해당 IP가 등록되어 있는지 확인 (존재하면 true 반환)
    boolean existsByAllowedIp(String ip); 
}
