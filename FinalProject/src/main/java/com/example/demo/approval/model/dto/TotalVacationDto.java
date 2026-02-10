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
	
	private String year;
	private String empNo;
	private int totalDays;
	private int usedDays;
	private int remainDays;
}
