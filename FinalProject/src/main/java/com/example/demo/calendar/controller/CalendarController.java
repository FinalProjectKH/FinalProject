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
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor 
@CrossOrigin(origins = "https://localhost:5173")
@Slf4j
public class CalendarController {

    private final CalendarService calendarService;
    
    // 1. 일정(Event)

    @GetMapping 
    public List<CalendarDto> getEvents(
    		@RequestParam("empNo") String empNo,
    		@RequestParam(value = "deptCode", required = false) String deptCode) {
        return calendarService.findAllEvents(empNo, deptCode);
    }

    @PostMapping 
    public ResponseEntity<?> createEvent(@RequestBody CalendarDto dto) {
        try {
            
            CalendarDto result = calendarService.createEvent(dto);
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            log.error("권한 없는 일정 등록 시도: {}", dto.getEmpNo());
            return ResponseEntity.status(403).body("전사 일정은 관리자만 등록할 수 있습니다.");
        } catch (Exception e) {
            log.error("일정 등록 실패", e);
            return ResponseEntity.status(500).body("일정 등록 실패");
        }
    }

    // 🔥 일정 수정 (권한 체크 추가)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable("id") Long id, @RequestBody CalendarDto dto) {
        try {
            CalendarDto result = calendarService.updateEvent(id, dto);
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body("수정 권한이 없습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("수정 실패");
        }
    }

    // 🔥 일정 삭제 (권한 체크 추가)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(
            @PathVariable("id") Long id,
            @RequestParam("empNo") String empNo) { // 삭제 요청자 사번
        try {
            calendarService.deleteEvent(id, empNo);
            return ResponseEntity.ok("삭제되었습니다.");
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body("삭제 권한이 없습니다."); // 403 Forbidden
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body("일정을 찾을 수 없습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("삭제 중 오류 발생");
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