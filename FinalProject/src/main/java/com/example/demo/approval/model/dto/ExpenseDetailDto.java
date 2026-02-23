package com.example.demo.approval.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDetailDto {
	
	private String docNo;
	private String detailNo;   // 상세 고유 번호 (seq)
	private LocalDateTime expenseDate; // 사용 일자
	private String category; // 분류
	private String usageDetail; // 사용내역
	private int amount; // 개별 금액
	private String note; // 비고

}
