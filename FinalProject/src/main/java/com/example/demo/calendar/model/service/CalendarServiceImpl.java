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
import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.employee.model.mapper.EmployeeMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CalendarServiceImpl implements CalendarService {
	
	private final CalendarRepository calendarRepository;
	private final CalendarCategoryRepository categoryRepository;
    private final EmployeeMapper employeeMapper; 
	
    // ==========================================
    // 1. 일정(Event) 관련
    // ==========================================
    
    @Override
    public CalendarDto createEvent(CalendarDto dto) {
        Long categoryId = Long.parseLong(dto.getTypeId()); 
        CalendarCategoryEntity categoryEntity = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리 없음 ID=" + categoryId));

        // [권한 체크] 전사 캘린더('3')인 경우
        if ("3".equals(categoryEntity.getType())) {
            checkCompanyCalendarPermission(dto.getEmpNo());
        }

        CalendarEntity entity = CalendarEntity.builder()
                .empNo(dto.getEmpNo())
                .calTitle(dto.getCalTitle())
                .calContent(dto.getCalContent())
                .startDate(dto.getCalStartDt())
                .endDate(dto.getCalEndDt())
                .location(dto.getCalLocation())
                .calCategory(categoryEntity)
                
                // 🔥🔥🔥 [수정] 이 부분이 빠져서 에러가 났습니다! 다시 추가!
                .typeId(categoryEntity.getType()) 
                
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
        
        // [수정] 수정 권한 체크
        boolean isCompanyEvent = entity.getCalCategory() != null && "3".equals(entity.getCalCategory().getType());
        
        if (isCompanyEvent) {
             checkCompanyCalendarPermission(dto.getEmpNo()); 
        } else {
             if (!entity.getEmpNo().equals(dto.getEmpNo())) {
                 throw new SecurityException("본인의 일정만 수정할 수 있습니다.");
             }
        }
        
        // Dirty Checking
        if (dto.getCalTitle() != null) entity.setCalTitle(dto.getCalTitle());
        if (dto.getCalContent() != null) entity.setCalContent(dto.getCalContent());
        if (dto.getCalLocation() != null) entity.setLocation(dto.getCalLocation());
        
        if (dto.getCalStartDt() != null) entity.setStartDate(dto.getCalStartDt());
        if (dto.getCalEndDt() != null) entity.setEndDate(dto.getCalEndDt());
        
        if (dto.getAlldayYn() != null) entity.setAlldayYn(dto.getAlldayYn());
        if (dto.getOpenYn() != null) entity.setOpenYn(dto.getOpenYn());
        
        // 카테고리 변경 시
        if (dto.getTypeId() != null) {
            Long newCategoryId = Long.parseLong(dto.getTypeId());
            
            if (entity.getCalCategory() == null || !entity.getCalCategory().getId().equals(newCategoryId)) {
                 CalendarCategoryEntity newCategory = categoryRepository.findById(newCategoryId)
                         .orElseThrow(() -> new IllegalArgumentException("카테고리 없음 ID=" + newCategoryId));
                 
                 if ("3".equals(newCategory.getType())) {
                     checkCompanyCalendarPermission(dto.getEmpNo());
                 }
                 
                 entity.setCalCategory(newCategory);
                 
                 // 🔥🔥🔥 [수정] 카테고리가 바뀌면 typeId(일정 타입)도 같이 바꿔줘야 데이터가 안 꼬입니다.
                 entity.setTypeId(newCategory.getType()); 
            }
        }
        
        return toDto(entity);
    }

    @Override
    public void deleteEvent(Long id, String empNo) { 
        CalendarEntity entity = calendarRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 일정이 없습니다."));

        // [수정] 삭제 권한 체크
        boolean isCompanyEvent = entity.getCalCategory() != null && "3".equals(entity.getCalCategory().getType());

        if (isCompanyEvent) {
            checkCompanyCalendarPermission(empNo);
        } else {
            if (!entity.getEmpNo().equals(empNo)) {
                throw new SecurityException("본인의 일정만 삭제할 수 있습니다!"); 
            }
        }

        calendarRepository.delete(entity);
    }
    
    // =========================================================
    // 전사 캘린더 권한 체크
    // =========================================================
    private void checkCompanyCalendarPermission(String empNo) {
        LoginMemberDTO emp = employeeMapper.login(empNo);
        
        if (emp == null) {
            throw new IllegalArgumentException("사용자 정보가 없습니다.");
        }
        
        // 권한 레벨 체크 (3 미만이면 차단)
        if (emp.getAuthorityLevel() < 3) { 
            log.warn("전사 캘린더 접근 권한 없음: {}", empNo);
            throw new SecurityException("전사 일정은 관리자만 등록/수정/삭제할 수 있습니다.");
        }
    }

    // ==========================================
    // 2. 카테고리(Category) 관련 (기존 코드 유지)
    // ==========================================

    @Override
    @Transactional
    public List<CalendarCategoryDto> findAllCategories(String empNo, String deptCode) {
        List<CalendarCategoryEntity> entities = categoryRepository.findByUserPermissions(empNo, deptCode);

        if (entities.isEmpty()) {
             CalendarCategoryEntity myCal = CalendarCategoryEntity.builder()
                     .name("내 캘린더").color("#9e5fff").type("1").ownerEmpNo(empNo).deptCode(deptCode).build();
             CalendarCategoryEntity teamCal = CalendarCategoryEntity.builder()
                     .name("팀 캘린더").color("#00a9ff").type("2").ownerEmpNo(empNo).deptCode(deptCode).build();

             categoryRepository.save(myCal);
             categoryRepository.save(teamCal);

             entities.add(myCal);
             entities.add(teamCal);
        }
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public CalendarCategoryDto createCategory(CalendarCategoryDto dto) {
        if ("3".equals(dto.getCategory())) {
            checkCompanyCalendarPermission(dto.getOwnerEmpNo());
        }

        CalendarCategoryEntity entity = CalendarCategoryEntity.builder()
                .name(dto.getName())
                .color(dto.getColor())
                .type(dto.getCategory())
                .ownerEmpNo(dto.getOwnerEmpNo())
                .deptCode(dto.getDeptCode())
                .build();
        
        return toDto(categoryRepository.save(entity));
    }
    
    @Override
    public CalendarCategoryDto updateCategory(Long id, CalendarCategoryDto dto) {
        CalendarCategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 없습니다. id=" + id));
        
        if ("3".equals(entity.getType())) {
            checkCompanyCalendarPermission(dto.getOwnerEmpNo());
        }
        
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getColor() != null) entity.setColor(dto.getColor()); 
        if (dto.getDeptCode() != null) entity.setDeptCode(dto.getDeptCode());
        
        return toDto(entity);
    }

    @Override
    public void deleteCategory(Long id) {
        calendarRepository.deleteByCalCategory_Id(id);
        categoryRepository.deleteById(id);
    }

    @Override
    public String getOrCreateVacationCategoryId(String empNo) {
        return categoryRepository.findByNameAndOwnerEmpNo("휴가", empNo)
                .map(entity -> String.valueOf(entity.getId())) 
                .orElseGet(() -> {
                    CalendarCategoryEntity newCat = CalendarCategoryEntity.builder()
                            .name("휴가")            
                            .color("#FF6B6B")        
                            .ownerEmpNo(empNo)       
                            .type("1")               
                            .deptCode(null)          
                            .build();
                    
                    CalendarCategoryEntity saved = categoryRepository.save(newCat);
                    return String.valueOf(saved.getId());
                });
    }

    private CalendarDto toDto(CalendarEntity entity) {
        String colorCode = "#000000"; 
        if (entity.getCalCategory() != null) {
            colorCode = entity.getCalCategory().getColor(); 
        }
        String typeId = (entity.getCalCategory() != null && entity.getCalCategory().getId() != null) 
                        ? String.valueOf(entity.getCalCategory().getId()) 
                        : null;

        return CalendarDto.builder()
                .calNo(entity.getCalNo())
                .calTitle(entity.getCalTitle())
                .calContent(entity.getCalContent())
                .calStartDt(entity.getStartDate()) 
                .calEndDt(entity.getEndDate())
                .calLocation(entity.getLocation())
                .calColor(colorCode) 
                .typeId(typeId)
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