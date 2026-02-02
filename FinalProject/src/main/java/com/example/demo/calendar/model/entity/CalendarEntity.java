package com.example.demo.calendar.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor 
@AllArgsConstructor
@Builder 
@Table(name = "CALENDAR") 
public class CalendarEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cal_seq_gen")
    @SequenceGenerator(name = "cal_seq_gen", sequenceName = "SEQ_CAL_NO", allocationSize = 1)
    @Column(name = "CAL_NO")
    private Long calNo;

    @Column(name = "EMP_NO", nullable = false)
    private String empNo;

    // 1. 카테고리 객체 (FK) - 55번 같은 구체적인 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CAL_CATEGORY", nullable = false)
    private CalendarCategoryEntity calCategory;
    
    // 2. 대분류 (1, 2, 3) - Service에서 넣어주는 값
    // 🔥 [여기 변수명이 typeId 여야 에러가 안 납니다!]
    @Column(name = "TYPE_ID", nullable = false)
    private String typeId; 

    @Column(name = "CAL_TITLE", nullable = false)
    private String calTitle;

    @Column(name = "CAL_CONTENT")
    private String calContent;

    @Column(name = "LOCATION")
    private String location;

    @Column(name = "START_DATE", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "END_DATE", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "ALLDAY_YN", nullable = false, length = 1)
    private String alldayYn;

    @Column(name = "OPEN_YN", nullable = false, length = 1)
    private String openYn;
    
    
}