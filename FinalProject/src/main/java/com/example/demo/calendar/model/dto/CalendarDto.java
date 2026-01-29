package com.example.demo.calendar.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CalendarDto {

    private Long calNo;          // PK (DB 컬럼명 calNo, 기존 id)
    
    private String calTitle;     // 제목
    private String calContent;   // 내용 (기존 body -> 이름 변경 필수!)
    
    private String calStartDt;   // 시작일 (기존 start -> 이름/타입 변경)
    private String calEndDt;     // 종료일 (기존 end -> 이름/타입 변경)
    
    private String calLocation;  // 장소 (기존 location -> 이름 변경)
    
    private String empNo;        // 사번
    
    private String typeId;       // 🔥 [핵심] 카테고리 ID (이게 있어야 저장됨)
    
    private String alldayYn;     // 종일 여부 (Y/N)
    private String openYn;       // 공개 여부 (Y/N)
    
    // 아래는 필요하다면 유지, 아니면 삭제해도 됨 (로직상엔 당장 안 쓰임)
    private String calType;      // (구 type)
    private String categoryName; // (구 category)
    
    
}