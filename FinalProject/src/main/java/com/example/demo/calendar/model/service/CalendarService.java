package com.example.demo.calendar.model.service;

import java.util.List;

import com.example.demo.calendar.model.dto.CalendarCategoryDto;
import com.example.demo.calendar.model.dto.CalendarDto;

public interface CalendarService {


    CalendarDto createEvent(CalendarDto dto);
    
	List<CalendarDto> findAllEvents(String empNo, String deptCode);
    
    CalendarDto updateEvent(Long id, CalendarDto dto);

    CalendarCategoryDto createCategory(CalendarCategoryDto dto);

	CalendarCategoryDto updateCategory(Long id, CalendarCategoryDto dto);

	void deleteCategory(Long id);

	List<CalendarCategoryDto> findAllCategories(String empNo, String deptCode);

	void deleteEvent(Long id, String empNo);



}
