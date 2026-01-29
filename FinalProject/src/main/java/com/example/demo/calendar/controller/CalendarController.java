package com.example.demo.calendar.controller;



import java.util.List;

import org.springframework.web.bind.annotation.*; // 모든 어노테이션 import

import com.example.demo.calendar.model.dto.CalendarCategoryDto;
import com.example.demo.calendar.model.dto.CalendarDto;
import com.example.demo.calendar.model.service.CalendarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor 
public class CalendarController {

    private final CalendarService calendarService;

    // ==========================================
    // 1. 일정(Event)
    // ==========================================

    @GetMapping 
    public List<CalendarDto> getEvents() {
        return calendarService.findAllEvents();
    }

    @PostMapping 
    public CalendarDto createEvent(@RequestBody CalendarDto dto) {
        return calendarService.createEvent(dto);
    }

    @PutMapping("/{id}")
    public CalendarDto updateEvent(@PathVariable Long id, @RequestBody CalendarDto dto) {
        return calendarService.updateEvent(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        calendarService.deleteEvent(id);
    }


    // ==========================================
    // 2. 카테고리(Category) - 🚨 여기 수정됨!
    // ==========================================
    
    // [GET] 카테고리 조회
    @GetMapping("/categories")
    public List<CalendarCategoryDto> getCategories() {
        return calendarService.findAllCategories();
    }

    // [POST] 카테고리 추가 (String 반환하는 거 지움!)
    @PostMapping("/categories")
    public CalendarCategoryDto createCategory(@RequestBody CalendarCategoryDto dto) {
        return calendarService.createCategory(dto);
    }
}