package com.example.demo.calendar.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.calendar.model.entity.CalendarCategoryEntity;


@Repository
public interface CalendarCategoryRepository extends JpaRepository<CalendarCategoryEntity, Long> {
    


    // 🔥 [핵심] 권한에 맞는 카테고리만 가져오는 쿼리
    // 1. 내 캘린더 (Type='1' AND 내 사번)
    // 2. 부서 캘린더 (Type='2' AND 내 부서코드로 시작하는 것들) -> 'HR%' 로 검색
    // 3. 전사 캘린더 (Type='3') -> 모두에게 보임
    @Query("SELECT c FROM CalendarCategoryEntity c WHERE " +
           "(c.type = '1' AND c.ownerEmpNo = :empNo) OR " +
           "(c.type = '2' AND c.deptCode LIKE CONCAT(:deptPrefix, '%')) OR " +
           "(c.type = '3')")
    List<CalendarCategoryEntity> findByUserPermissions(
        @Param("empNo") String empNo, 
        @Param("deptPrefix") String deptPrefix
    );
    
    
 // 이름으로 카테고리 찾기 (공휴일 카테고리 찾을 때 씀)
    CalendarCategoryEntity findByName(String name);
    
    
    Optional<CalendarCategoryEntity> findByNameAndOwnerEmpNo(String name, String ownerEmpNo);
    
    
    

}