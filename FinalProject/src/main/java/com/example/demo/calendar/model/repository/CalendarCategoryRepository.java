package com.example.demo.calendar.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.calendar.model.entity.CalendarCategoryEntity;


@Repository
public interface CalendarCategoryRepository extends JpaRepository<CalendarCategoryEntity, Long> {
    
    

}