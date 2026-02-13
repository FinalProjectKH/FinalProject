package com.example.demo.approval.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TotalVacationDto {
	
	private String year; // 년도
	private String empNo; // 사번
	private double totalDays; // 총 연차
	private double usedDays; // 사용한 연차
	private double remainDays; // 남은 연차
}   // double인 이유 : 반차 ( 0.5 ) 계산하기위해
