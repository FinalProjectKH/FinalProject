package com.example.demo.calendar.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.calendar.model.entity.CalendarEntity;


// JpaRepository<엔티티, PK타입>을 상속받으면 CRUD 메서드가 공짜로 생깁니다.
@Repository
public interface CalendarRepository extends JpaRepository<CalendarEntity, Long> {
    
   
    
}