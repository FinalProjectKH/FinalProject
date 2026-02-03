package com.example.demo.attendance.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.attendance.model.entity.Attendance;
import com.example.demo.attendance.model.service.AttendanceServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {
	
	private final AttendanceServiceImpl attendanceService;
	
	// 출근
	@PostMapping("/check-in")
	public ResponseEntity<?> checkIn(@RequestBody Map<String, String> request) {
	    try {
	        String empNo = request.get("empNo"); // JSON에서 empNo만 추출
	        
	        // 1. 출근 처리 수행
	        attendanceService.checkIn(empNo);
	        
	        // 2. 새로고침 방지를 위해 여기서 바로 최신 목록을 조회해서 반환
	        // 서비스 메서드에 startDate가 추가되었으므로, null 추가
	        // 이번 주 월요일 기준으로 목록을 가져옴
	        List<Attendance> updatedList = attendanceService.getWeeklyAttendance(empNo, null);
	        
	        return ResponseEntity.ok(updatedList); // 메시지 대신 리스트를 보냄
	        
	    } catch (RuntimeException e) {
	        return ResponseEntity.badRequest().body(e.getMessage());
	    }
	}
	
	// 퇴근
	@PostMapping("/check-out")
	public ResponseEntity<String> checkOut(@RequestBody Map<String, String> request) {
	    
	    String empNo = request.get("empNo"); // 1. 사번 추출
	    
	    // 2. 서비스 호출(실제로 DB 업데이트와 시간 계산이 일어남)
	    try {
	        String resultMessage = attendanceService.checkOut(empNo); 
	        return ResponseEntity.ok(resultMessage); // 3. 서비스에서 보낸 성공 메시지 리턴
	    } catch (RuntimeException e) {
	        // 서비스에서 던진 "출근 기록이 없습니다" 등의 에러 메시지를 프론트로 전달
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
	    }
	}
	
	@GetMapping("/weekly/{empNo}")
	public ResponseEntity<List<Attendance>> getWeeklyAttendance
										(@PathVariable("empNo") String empNo,
										@RequestParam(name = "startDate", required = false) String startDate) {
		
		List<Attendance> list = attendanceService.getWeeklyAttendance(empNo, startDate);
		
		return ResponseEntity.ok(list);
	}
}
