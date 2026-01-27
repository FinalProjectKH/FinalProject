package com.example.demo.calendar.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CalendarDto {

    private Long id;            // 캘린더 ID (calNo)
    private String title;       // 제목 (calTitle)
    private String body;        // 내용 (calContent)


    private LocalDateTime start; 
    private LocalDateTime end;
    
    private String location;
    private String type;        // 회의, 업무 등 (calType)
    private String category;    // 개인, 부서, 전사 (calCategory)


    private boolean isAllday;   // alldayYn -> boolean 변환
    private boolean isPrivate;  // openYn -> boolean 변환 (반대 개념 주의)
}