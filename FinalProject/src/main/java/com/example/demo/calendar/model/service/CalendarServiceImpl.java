package com.example.demo.calendar.model.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.calendar.model.dto.CalendarCategoryDto;
import com.example.demo.calendar.model.dto.CalendarDto;
import com.example.demo.calendar.model.entity.CalendarCategoryEntity;
import com.example.demo.calendar.model.entity.CalendarEntity;
import com.example.demo.calendar.model.repository.CalendarCategoryRepository;
import com.example.demo.calendar.model.repository.CalendarRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarServiceImpl implements CalendarService {
	
	private final CalendarRepository calendarRepository;
	private final CalendarCategoryRepository categoryRepository;
	
    // 날짜 포맷터 (프론트엔드 "yyyy-MM-dd HH:mm:ss" <-> 백엔드 LocalDateTime)
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
	
    // ==========================================
    // 1. 일정(Event) 관련
    // ==========================================
    
    @Override
    public CalendarDto createEvent(CalendarDto dto) {
        // 1. 선택한 카테고리 조회 (프론트에서 보낸 '55'번 같은 ID로 조회)
        Long categoryId = Long.parseLong(dto.getTypeId()); 
        CalendarCategoryEntity categoryEntity = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리 없음 ID=" + categoryId));

        // 2. 엔티티 생성
        CalendarEntity entity = CalendarEntity.builder()
                .empNo(dto.getEmpNo())
                .calTitle(dto.getCalTitle())
                .calContent(dto.getCalContent())
                .startDate(LocalDateTime.parse(dto.getCalStartDt(), formatter))
                .endDate(LocalDateTime.parse(dto.getCalEndDt(), formatter))
                .location(dto.getCalLocation())
                
                // 🔥 [핵심 1] 구체적인 카테고리 객체 연결 (FK: CAL_CATEGORY)
                .calCategory(categoryEntity)
                
                // 🔥 [핵심 2] 카테고리 객체에서 대분류(1,2,3)를 꺼내서 TYPE_ID 컬럼에 저장
                .typeId(categoryEntity.getType()) 
                
                // 색상은 카테고리 색을 따라감
                .calColor(categoryEntity.getColor())
                .alldayYn(dto.getAlldayYn())
                .openYn(dto.getOpenYn())
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
        
        // Dirty Checking (값 변경 시 자동 Update)
        entity.setCalTitle(dto.getCalTitle());
        entity.setCalContent(dto.getCalContent());
        entity.setLocation(dto.getCalLocation());
        
        // 날짜 변환하여 수정
        entity.setStartDate(LocalDateTime.parse(dto.getCalStartDt(), formatter));
        entity.setEndDate(LocalDateTime.parse(dto.getCalEndDt(), formatter));
        
        entity.setAlldayYn(dto.getAlldayYn());
        entity.setOpenYn(dto.getOpenYn());
        
        // 카테고리가 변경되었을 경우 로직
        if (dto.getTypeId() != null) {
            Long newCategoryId = Long.parseLong(dto.getTypeId());
            
            // 기존 카테고리와 다를 때만 업데이트 수행
            if (entity.getCalCategory() == null || !entity.getCalCategory().getId().equals(newCategoryId)) {
                 CalendarCategoryEntity newCategory = categoryRepository.findById(newCategoryId)
                         .orElseThrow(() -> new IllegalArgumentException("카테고리 없음 ID=" + newCategoryId));
                 
                 // 1. 카테고리 참조 변경
                 entity.setCalCategory(newCategory);
                 // 2. 대분류(TYPE_ID)도 같이 변경해줘야 함 ('1' -> '2' 등으로 바뀔 수 있으니까)
                 entity.setTypeId(newCategory.getType());
                 // 3. 색상 변경
                 entity.setCalColor(newCategory.getColor()); 
            }
        }
        
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
                .ownerEmpNo(dto.getOwnerEmpNo())
                .build();
        
        CalendarCategoryEntity saved = categoryRepository.save(entity);
        
        return CalendarCategoryDto.builder()
                .id(String.valueOf(saved.getId()))
                .name(saved.getName())
                .color(saved.getColor())
                .category(saved.getType())
                .build();
    }
    
    // Entity -> DTO 변환 메서드
    private CalendarDto toDto(CalendarEntity entity) {
        return CalendarDto.builder()
                .calNo(entity.getCalNo())           // PK
                .calTitle(entity.getCalTitle())     // 제목
                .calContent(entity.getCalContent()) // 내용
                
                // 날짜: LocalDateTime -> String 변환
                .calStartDt(entity.getStartDate().format(formatter))
                .calEndDt(entity.getEndDate().format(formatter))
                
                .calLocation(entity.getLocation())
                
                // 🔥 [조회 매핑 1] 대분류(1, 2, 3)는 DB의 TYPE_ID 컬럼에서 가져옴
                .calType(entity.getTypeId()) 
                
                // 🔥 [조회 매핑 2] 구체적인 카테고리 ID(55 등)는 연결된 객체에서 가져옴
                .typeId(entity.getCalCategory() != null ? String.valueOf(entity.getCalCategory().getId()) : null)
                
                .alldayYn(entity.getAlldayYn())
                .openYn(entity.getOpenYn())
                .empNo(entity.getEmpNo())
                .build();
    }
}