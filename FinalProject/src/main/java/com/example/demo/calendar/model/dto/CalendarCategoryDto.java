package com.example.demo.calendar.model.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarCategoryDto {
    private String id;          
    private String name;
    private String color;
    private String category;    // 1(개인), 2(부서), 3(전사) -> 프론트 변수명과 일치시킴
    private String calNo;
	private String ownerEmpNo;
}