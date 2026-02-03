package com.example.demo.calendar.model.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.calendar.model.entity.CalendarEntity;


// JpaRepository<엔티티, PK타입>을 상속받으면 CRUD 메서드가 공짜로 생깁니다.
@Repository
public interface CalendarRepository extends JpaRepository<CalendarEntity, Long> {
    
	@Query("SELECT e FROM CalendarEntity e " +
	           "JOIN FETCH e.calCategory c " +
	           "WHERE (c.type = '1' AND c.ownerEmpNo = :empNo) " +
	           "   OR (c.type = '2' AND c.deptCode = :deptCode) " +
	           "   OR (c.type = '3')")
	    List<CalendarEntity> findByUserPermissions(
	            @Param("empNo") String empNo, 
	            @Param("deptCode") String deptCode
	    );
	
	void deleteByCalCategory_Id(Long categoryId);
	
	List<CalendarEntity> findByCalCategory_Id(Long categoryId);
	
	// 중복 저장 방지용 (제목과 시작시간이 같은 게 있는지 확인)
	boolean existsByCalTitleAndStartDate(String calTitle, LocalDateTime startDate);
	
	
	
	
}