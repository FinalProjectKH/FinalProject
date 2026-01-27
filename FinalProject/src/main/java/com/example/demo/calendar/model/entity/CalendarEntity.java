package com.example.demo.calendar.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CAL_NO")
    private Long calNo;

    @Column(name = "EMP_NO", nullable = false)
    private String empNo;

    @Column(name = "CAL_CATEGORY", nullable = false)
    private String calCategory; // '1'(개인), '2'(부서), '3'(전사)
    
    @Column(name = "CAL_TYPE", nullable = false)
    private String calType; // '회의', '업무' 등

    @Column(name = "CAL_TITLE", nullable = false)
    private String calTitle;

    @Column(name = "CAL_CONTENT")
    private String calContent;

    @Column(name = "CAL_COLOR")
    private String calColor;

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