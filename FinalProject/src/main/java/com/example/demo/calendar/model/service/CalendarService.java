package com.example.demo.calendar.model.service;

import java.util.List;

import com.example.demo.calendar.model.dto.CalendarCategoryDto;
import com.example.demo.calendar.model.dto.CalendarDto;

public interface CalendarService {


    CalendarDto createEvent(CalendarDto dto);
    
    List<CalendarDto> findAllEvents();
    
    CalendarDto updateEvent(Long id, CalendarDto dto);
    
    void deleteEvent(Long id);
    
    List<CalendarCategoryDto> findAllCategories(); 

    CalendarCategoryDto createCategory(CalendarCategoryDto dto);

}
