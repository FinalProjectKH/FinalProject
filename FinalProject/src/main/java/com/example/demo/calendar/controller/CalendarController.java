package com.example.demo.calendar.controller;



import java.util.List;

import org.springframework.http.ResponseEntity;
// 모든 어노테이션 import
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.calendar.model.dto.CalendarCategoryDto;
import com.example.demo.calendar.model.dto.CalendarDto;
import com.example.demo.calendar.model.service.CalendarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor 
@CrossOrigin(origins = "https://localhost:5173")
public class CalendarController {

    private final CalendarService calendarService;
    
    // 1. 일정(Event)

    @GetMapping 
    public List<CalendarDto> getEvents(
    		@RequestParam("empNo") String empNo,
    		@RequestParam("deptCode") String deptCode) {
        return calendarService.findAllEvents(empNo, deptCode);
    }

    @PostMapping 
    public CalendarDto createEvent(@RequestBody CalendarDto dto) {
        return calendarService.createEvent(dto);
    }

    @PutMapping("/{id}")
    public CalendarDto updateEvent(@PathVariable("id") Long id, @RequestBody CalendarDto dto) {
        return calendarService.updateEvent(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable("id") Long id,
    						@RequestParam("empNo") String empNo) {
    	try {
            calendarService.deleteEvent(id, empNo);
            return ResponseEntity.ok("삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage()); // 권한 없음 에러 리턴
        }
    }


    // 2. 카테고리(Category) 
    
    // [GET] 카테고리 조회
    @GetMapping("/categories")
    public List<CalendarCategoryDto> getCategories(
    		@RequestParam("empNo") String empNo,
    		@RequestParam("deptCode") String deptCode) {
        return calendarService.findAllCategories(empNo, deptCode);
    }

    // [POST] 카테고리 추가
    @PostMapping("/categories")
    public CalendarCategoryDto createCategory(@RequestBody CalendarCategoryDto dto) {
        return calendarService.createCategory(dto);
    }
        
     // 카테고리 수정 (색상 변경 등)
    @PutMapping("/categories/{id}")
        public CalendarCategoryDto updateCategory(
        		@PathVariable("id") Long id, 
        		@RequestBody CalendarCategoryDto dto) {
            return calendarService.updateCategory(id, dto);
        }

        // 카테고리 삭제
    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable("id") Long id) {
        calendarService.deleteCategory(id);
    }
    
}