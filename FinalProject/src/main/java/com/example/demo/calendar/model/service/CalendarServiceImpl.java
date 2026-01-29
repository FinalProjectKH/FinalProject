package com.example.demo.calendar.model.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.calendar.model.dto.CalendarDto;
import com.example.demo.calendar.model.dto.CalendarCategoryDto; 
import com.example.demo.calendar.model.entity.CalendarEntity;
import com.example.demo.calendar.model.entity.CalendarCategoryEntity; 
import com.example.demo.calendar.model.repository.CalendarRepository;
import com.example.demo.calendar.model.repository.CalendarCategoryRepository; 

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarServiceImpl implements CalendarService {
	
	private final CalendarRepository calendarRepository;
	private final CalendarCategoryRepository categoryRepository;
	
    // ==========================================
    // 1. 일정(Event) 관련
    // ==========================================
    
    @Override
	public CalendarDto createEvent(CalendarDto dto) {
        CalendarEntity entity = CalendarEntity.builder()
                .empNo("TEST_USER")
                .calTitle(dto.getTitle())
                .calContent(dto.getBody())
                .startDate(dto.getStart())
                .endDate(dto.getEnd())
                .location(dto.getLocation())
                .calType(dto.getType())
                .calCategory(dto.getCategory())
                .calColor("#3b82f6") // 기본값 (나중에 카테고리 색으로 덮어써야 함)
                .alldayYn(dto.isAllday() ? "Y" : "N") 
                .openYn(dto.isPrivate() ? "N" : "Y")  
                .build();
        return toDto(calendarRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalendarDto> findAllEvents() {
        return calendarRepository.findAll().stream()
                .map(this::toDto) 
                .collect(Collectors.toList());
    }
    
    @Override
    public CalendarDto updateEvent(Long id, CalendarDto dto) {
        CalendarEntity entity = calendarRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 일정이 없습니다. id=" + id));
        
        // Dirty Checking (값만 바꾸면 트랜잭션 끝날 때 알아서 update 쿼리 날아감)
        entity.setCalTitle(dto.getTitle());
        entity.setCalContent(dto.getBody());
        entity.setStartDate(dto.getStart());
        entity.setEndDate(dto.getEnd());
        entity.setLocation(dto.getLocation());
        entity.setCalType(dto.getType());
        entity.setCalCategory(dto.getCategory());
        entity.setAlldayYn(dto.isAllday() ? "Y" : "N");
        entity.setOpenYn(dto.isPrivate() ? "N" : "Y");
        
        return toDto(entity);
    }

    @Override
    public void deleteEvent(Long id) {
        calendarRepository.deleteById(id);
    }

    // ==========================================
    // 2. 카테고리(Category) 관련
    // ==========================================

    @Override
    public List<CalendarCategoryDto> findAllCategories() {
        List<CalendarCategoryEntity> list = categoryRepository.findAll();
        
        // 데이터가 아예 없으면 기본 데이터 생성 (테스트용)
        if(list.isEmpty()) {
             categoryRepository.save(CalendarCategoryEntity.builder().name("내 캘린더").type("1").color("#3b82f6").ownerEmpNo("SYSTEM").build());
             categoryRepository.save(CalendarCategoryEntity.builder().name("팀 캘린더").type("2").color("#10b981").ownerEmpNo("SYSTEM").build());
             list = categoryRepository.findAll();
        }

        return list.stream()
                .map(entity -> CalendarCategoryDto.builder()
                        .id(String.valueOf(entity.getId()))
                        .name(entity.getName())
                        .color(entity.getColor())
                        .category(entity.getType())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public CalendarCategoryDto createCategory(CalendarCategoryDto dto) {
        CalendarCategoryEntity entity = CalendarCategoryEntity.builder()
                .name(dto.getName())
                .color(dto.getColor())
                .type(dto.getCategory())
                .ownerEmpNo("TEST_USER")
                .build();
        
        CalendarCategoryEntity saved = categoryRepository.save(entity);
        
        return CalendarCategoryDto.builder()
                .id(String.valueOf(saved.getId()))
                .name(saved.getName())
                .color(saved.getColor())
                .category(saved.getType())
                .build();
    }
    
    // Entity -> DTO 변환
    private CalendarDto toDto(CalendarEntity entity) {
        return CalendarDto.builder()
                .id(entity.getCalNo())
                .title(entity.getCalTitle())
                .body(entity.getCalContent())
                .start(entity.getStartDate())
                .end(entity.getEndDate())
                .location(entity.getLocation())
                .type(entity.getCalType())
                .category(entity.getCalCategory())
                .isAllday("Y".equals(entity.getAlldayYn()))
                .isPrivate("N".equals(entity.getOpenYn()))
                .build();
    }
}