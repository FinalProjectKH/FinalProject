package com.example.demo.calendar.model.service;

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
	private final CalendarCategoryRepository categoryRepository; // 변수명 통일
	
    // ==========================================
    // 1. 일정(Event) 관련
    // ==========================================
    
    @Override
    public CalendarDto createEvent(CalendarDto dto) {
        // 1. 선택한 카테고리 조회
        Long categoryId = Long.parseLong(dto.getTypeId()); 
        CalendarCategoryEntity categoryEntity = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리 없음 ID=" + categoryId));

        // 2. 엔티티 생성
        CalendarEntity entity = CalendarEntity.builder()
                .empNo(dto.getEmpNo())
                .calTitle(dto.getCalTitle())
                .calContent(dto.getCalContent())
                .startDate(dto.getCalStartDt())
                .endDate(dto.getCalEndDt())
                .location(dto.getCalLocation())
                .calCategory(categoryEntity) 
                .typeId(categoryEntity.getType()) // Entity에 필드가 없다면 주석 처리
                .alldayYn(dto.getAlldayYn())
                .openYn(dto.getOpenYn())
                .build();

        return toDto(calendarRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalendarDto> findAllEvents(String empNo, String deptCode) {
    	return calendarRepository.findByUserPermissions(empNo, deptCode).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public CalendarDto updateEvent(Long id, CalendarDto dto) {
        CalendarEntity entity = calendarRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 일정이 없습니다. id=" + id));
        
        // Dirty Checking (값 변경 시 자동 Update)
        if (dto.getCalTitle() != null) entity.setCalTitle(dto.getCalTitle());
        if (dto.getCalContent() != null) entity.setCalContent(dto.getCalContent());
        if (dto.getCalLocation() != null) entity.setLocation(dto.getCalLocation());
        
        if (dto.getCalStartDt() != null) entity.setStartDate(dto.getCalStartDt());
        if (dto.getCalEndDt() != null) entity.setEndDate(dto.getCalEndDt());
        
        if (dto.getAlldayYn() != null) entity.setAlldayYn(dto.getAlldayYn());
        if (dto.getOpenYn() != null) entity.setOpenYn(dto.getOpenYn());
        
        // 카테고리가 변경되었을 경우 로직
        if (dto.getTypeId() != null) {
            Long newCategoryId = Long.parseLong(dto.getTypeId());
            
            if (entity.getCalCategory() == null || !entity.getCalCategory().getId().equals(newCategoryId)) {
                 CalendarCategoryEntity newCategory = categoryRepository.findById(newCategoryId)
                         .orElseThrow(() -> new IllegalArgumentException("카테고리 없음 ID=" + newCategoryId));
                 
                 entity.setCalCategory(newCategory); // 연관관계 변경
            }
        }
        
        return toDto(entity);
    }

    @Override
    public void deleteEvent(Long id, String empNo) { 
        CalendarEntity entity = calendarRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 일정이 없습니다."));

        if (!entity.getEmpNo().equals(empNo)) {
            throw new IllegalArgumentException("본인의 일정만 삭제할 수 있습니다!");
        }

        calendarRepository.delete(entity);
    }

    // ==========================================
    // 2. 카테고리(Category) 관련
    // ==========================================

    @Override
    @Transactional
    public List<CalendarCategoryDto> findAllCategories(String empNo, String deptCode) {
        List<CalendarCategoryEntity> entities = categoryRepository.findByUserPermissions(empNo, deptCode);

        if (entities.isEmpty()) {
            System.out.println(">>> [Service] 카테고리 없음! 기본값 생성 시작...");

            CalendarCategoryEntity myCal = CalendarCategoryEntity.builder()
                    .name("내 캘린더")
                    .color("#9e5fff") 
                    .type("1")        
                    .ownerEmpNo(empNo)
                    .deptCode(deptCode)
                    .build();
            
            CalendarCategoryEntity teamCal = CalendarCategoryEntity.builder()
                    .name("팀 캘린더")
                    .color("#00a9ff") 
                    .type("2")        
                    .ownerEmpNo(empNo) 
                    .deptCode(deptCode) 
                    .build();

            categoryRepository.save(myCal);
            categoryRepository.save(teamCal);

            entities.add(myCal);
            entities.add(teamCal);
            
            System.out.println(">>> [Service] 기본 카테고리 생성 완료!");
        }

        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CalendarCategoryDto createCategory(CalendarCategoryDto dto) {
        CalendarCategoryEntity entity = CalendarCategoryEntity.builder()
                .name(dto.getName())
                .color(dto.getColor())
                .type(dto.getCategory())
                .ownerEmpNo(dto.getOwnerEmpNo())
                .deptCode(dto.getDeptCode())
                .build();
        
        CalendarCategoryEntity saved = categoryRepository.save(entity);
        
        return toDto(saved); // 중복 코드 제거 (toDto 활용)
    }
    
    @Override
    public CalendarCategoryDto updateCategory(Long id, CalendarCategoryDto dto) {
        CalendarCategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 없습니다. id=" + id));
        
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getColor() != null) entity.setColor(dto.getColor()); 
        if (dto.getDeptCode() != null) entity.setDeptCode(dto.getDeptCode());
        
        return toDto(entity);
    }

    @Override
    public void deleteCategory(Long id) {
        // FK 제약조건 때문에 연결된 일정을 먼저 지워야 함 (CASCADE 설정 안 되어 있다면 필수)
        calendarRepository.deleteByCalCategory_Id(id);
        categoryRepository.deleteById(id);
    }

    // ==========================================
    // 🔥 [핵심 기능] 휴가 카테고리 ID 가져오기 (없으면 생성)
    // ==========================================
    @Override
    public String getOrCreateVacationCategoryId(String empNo) {
        // 🔥 [수정] calendarRepository -> categoryRepository 로 변경해야 함!
        return categoryRepository.findByNameAndOwnerEmpNo("휴가", empNo)
                .map(entity -> String.valueOf(entity.getId())) 
                .orElseGet(() -> {
                    CalendarCategoryEntity newCat = CalendarCategoryEntity.builder()
                            .name("휴가")            
                            .color("#FF6B6B")        // 빨간색
                            .ownerEmpNo(empNo)       
                            .type("1")               // '1'(개인) 또는 '3'(전사) 등 정책에 맞게
                            .deptCode(null)          
                            .build();
                    
                    // 🔥 [수정] 변수명 통일 (categoryRepository)
                    CalendarCategoryEntity saved = categoryRepository.save(newCat);
                    System.out.println("✅ '휴가' 카테고리 생성 완료. ID: " + saved.getId());
                    
                    return String.valueOf(saved.getId());
                });
    }


    // ==========================================
    // DTO 변환 메서드
    // ==========================================
    private CalendarDto toDto(CalendarEntity entity) {
        String colorCode = "#000000"; 
        if (entity.getCalCategory() != null) {
            colorCode = entity.getCalCategory().getColor(); 
        }

        return CalendarDto.builder()
                .calNo(entity.getCalNo())
                .calTitle(entity.getCalTitle())
                .calContent(entity.getCalContent())
                .calStartDt(entity.getStartDate()) 
                .calEndDt(entity.getEndDate())
                .calLocation(entity.getLocation())
                .calColor(colorCode) 
                .typeId(entity.getCalCategory() != null ? String.valueOf(entity.getCalCategory().getId()) : null)
                .alldayYn(entity.getAlldayYn())
                .openYn(entity.getOpenYn())
                .empNo(entity.getEmpNo())
                .build();
    }
    
    private CalendarCategoryDto toDto(CalendarCategoryEntity entity) {
        if (entity == null) return null;
        
        return CalendarCategoryDto.builder()
                .id(String.valueOf(entity.getId()))
                .name(entity.getName())
                .color(entity.getColor())
                .category(entity.getType())         
                .ownerEmpNo(entity.getOwnerEmpNo())
                .deptCode(entity.getDeptCode())
                .build();
    }
}