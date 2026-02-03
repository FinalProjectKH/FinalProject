package com.example.demo.calendar.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "CALENDAR_CATEGORY") // 캘린더 목록 테이블
public class CalendarCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;            // 카테고리 ID

    private String name;        // 캘린더 이름 (예: 내 캘린더, 프로젝트 A팀)
    private String color;       // 라벨 색상
    
    // 1: 개인, 2: 부서, 3: 전사
    @Column(name = "CAL_CATEGORY_TYPE")
    private String type;        
    
    @Column(name = "OWNER_EMP_NO")
    private String ownerEmpNo;  // 누구 건지 (사번)
    
    @Column(name = "DEPT_CODE")
    private String deptCode;
    
    
}