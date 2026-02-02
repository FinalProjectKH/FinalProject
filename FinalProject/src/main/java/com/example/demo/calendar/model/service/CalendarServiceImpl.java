package com.example.demo.calendar.model.service;

import java.time.LocalDateTime;
// DateTimeFormatter 삭제됨 (필요 없음)
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
        
        // Dirty Checking (값 변경 시 자동 Update)
        // 🔥 NULL 체크: 값이 있을 때만 업데이트 (드래그 앤 드롭 지원용)
        if (dto.getCalTitle() != null) entity.setCalTitle(dto.getCalTitle());
        if (dto.getCalContent() != null) entity.setCalContent(dto.getCalContent());
        if (dto.getCalLocation() != null) entity.setLocation(dto.getCalLocation());
        
        // 🔥 [수정] 날짜 바로 대입 (NULL 체크 포함)
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
                 
                 entity.setCalCategory(newCategory);
                 entity.setTypeId(newCategory.getType());
            }
        }
        
        return toDto(entity);
    }

    @Override
    public void deleteEvent(Long id, String empNo) { // 파라미터에 empNo 추가
        // 1. 일정을 먼저 조회 (없으면 에러)
        CalendarEntity entity = calendarRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 일정이 없습니다."));

        // 2. 🔥 [핵심] 작성자(본인) 확인
        // 관리자(Admin)라면 패스하는 로직을 추가할 수도 있음
        if (!entity.getEmpNo().equals(empNo)) {
            throw new IllegalArgumentException("본인의 일정만 삭제할 수 있습니다!");
        }

        // 3. 검증 통과하면 삭제
        calendarRepository.delete(entity);
    }
    // ==========================================
    // 2. 카테고리(Category) 관련
    // ==========================================

    @Override
    @Transactional
    public List<CalendarCategoryDto> findAllCategories(String empNo, String deptCode) {
        
        // 1. 님께서 작성하신 멋진 쿼리로 조회 (부서 코드가 'HR01'이면 'HR'로 잘라서 검색 등 로직 필요하면 조정)
        // 일단은 deptCode 전체를 넘겨서 검색한다고 가정
        List<CalendarCategoryEntity> entities = categoryRepository.findByUserPermissions(empNo, deptCode);

        // 2. 🔥 [핵심] 조회된 게 하나도 없다? (신규 유저) -> 기본값 생성!
        if (entities.isEmpty()) {
            System.out.println(">>> [Service] 카테고리 없음! 기본값 생성 시작...");

            // (1) 내 캘린더 생성 (개인용 Type='1')
            CalendarCategoryEntity myCal = CalendarCategoryEntity.builder()
                    .name("내 캘린더")
                    .color("#9e5fff") 
                    .type("1")        
                    .ownerEmpNo(empNo)
                    .deptCode(deptCode)
                    .build();
            
            // (2) 팀 캘린더 생성 (부서용 Type='2')
            CalendarCategoryEntity teamCal = CalendarCategoryEntity.builder()
                    .name("팀 캘린더")
                    .color("#00a9ff") 
                    .type("2")        
                    .ownerEmpNo(empNo) // 생성자는 나
                    .deptCode(deptCode) // 내 부서 코드
                    .build();

            // DB에 저장!
            categoryRepository.save(myCal);
            categoryRepository.save(teamCal);

            // 리스트에 추가 (화면에 바로 보여주기 위해)
            entities.add(myCal);
            entities.add(teamCal);
            
            System.out.println(">>> [Service] 기본 카테고리 생성 완료!");
        }

        // 3. 변환해서 반환
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
        
        return CalendarCategoryDto.builder()
                .id(String.valueOf(saved.getId()))
                .name(saved.getName())
                .color(saved.getColor())
                .category(saved.getType())
                .ownerEmpNo(saved.getOwnerEmpNo())
                .deptCode(saved.getDeptCode())
                .build();
    }
    
    @Override
    public CalendarCategoryDto updateCategory(Long id, CalendarCategoryDto dto) {
        // 1. 🔥 [수정] DB에서 진짜 카테고리를 찾아옵니다. (없으면 에러)
        CalendarCategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 없습니다. id=" + id));
        
        // 2. 값 변경 (Dirty Checking으로 인해, 이 메서드가 끝나면 자동 저장됨)
        if (dto.getName() != null) {
            entity.setName(dto.getName());
        }
        
        if (dto.getColor() != null) {
            entity.setColor(dto.getColor()); 
            // 참고: 일정(Event) 테이블에는 색상이 없으므로, 카테고리만 바꾸면 끝!
        }
        
        // 부서 코드가 수정될 수 있다면 추가
        if (dto.getDeptCode() != null) {
            entity.setDeptCode(dto.getDeptCode());
        }
        
        // 3. 변경된 진짜 엔티티를 DTO로 변환해서 반환
        return toDto(entity);
    }

    @Override
    public void deleteCategory(Long id) {
        calendarRepository.deleteByCalCategory_Id(id);
        categoryRepository.deleteById(id);
    }


    private CalendarDto toDto(CalendarEntity entity) {
        // 1. 연결된 카테고리가 있는지 확인하고 색상 추출
        String colorCode = "#000000"; // 기본값 (혹시 카테고리가 없을 경우)
        
        // 🔥 [핵심] 일정이 가지고 있는 카테고리 객체에서 색상을 꺼냅니다.
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
                
                // 🔥 [수정] 위에서 꺼낸 카테고리 색상을 DTO에 넣어줍니다.
                // 프론트엔드는 이 값을 보고 색칠을 합니다.
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
                .id(String.valueOf(entity.getId())) // Long -> String 변환
                .name(entity.getName())
                .color(entity.getColor())
                .category(entity.getType())         // Entity의 type -> DTO의 category
                .ownerEmpNo(entity.getOwnerEmpNo())
                .deptCode(entity.getDeptCode())
                .build();
    }
    
    
    
    
    
    
}