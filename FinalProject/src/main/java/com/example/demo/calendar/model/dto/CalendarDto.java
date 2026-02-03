package com.example.demo.calendar.model.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

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
    
    // 🔥 String 대신 LocalDateTime 사용
    // 🔥 pattern을 프론트에서 보내는 형식과 똑같이 맞춰줍니다.
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime calStartDt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime calEndDt;
    private String calColor;
    
    private String calLocation;  // 장소 (기존 location -> 이름 변경)
    
    private String empNo;        // 사번
    
    private String typeId;       // 🔥 [핵심] 카테고리 ID (이게 있어야 저장됨)
    
    private String alldayYn;     // 종일 여부 (Y/N)
    private String openYn;       // 공개 여부 (Y/N)
    
    // 아래는 필요하다면 유지, 아니면 삭제해도 됨 (로직상엔 당장 안 쓰임)
    private String categoryName; // (구 category)
    
    private String deptCode;
    
    private String ownerEmpNo;
    
    
}