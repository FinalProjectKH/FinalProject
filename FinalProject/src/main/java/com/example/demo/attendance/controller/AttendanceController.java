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
import com.example.demo.common.utility.CommonUtils;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {
	
	private final AttendanceServiceImpl attendanceService;
	
	// 출근 처리 컨트롤러
	@PostMapping("/check-in")
	public ResponseEntity<?> checkIn(@RequestBody Map<String, String> request, 
	                                 HttpServletRequest httpRequest) {
	    
	    try {
	        // 1. 유틸리티 IP 추출
	        String clientIp = CommonUtils.getClientIp(httpRequest);
	        
	        // 로컬 테스트(IPv6) 환경 대응
	        if ("0:0:0:0:0:0:0:1".equals(clientIp)) {
	            clientIp = "127.0.0.1";
	        }
	        
	        // 2. IP 검증 로직 수행 (가장 먼저 수행하여 보안 확인)
	        // 서비스 내부에서 DB(COMPANY_INFO 등)의 허용 IP와 비교 후, 다르면 RuntimeException 발생
	        attendanceService.checkIpAddress(clientIp);
	        
	        // 3. 요청 데이터(사번) 추출
	        String empNo = request.get("empNo");
	        if (empNo == null || empNo.isEmpty()) {
	            return ResponseEntity.badRequest().body("사원 번호가 누락되었습니다.");
	        }
	        
	        // 4. 출근 처리 수행 (중복 출근 체크 등 비즈니스 로직 포함)
	        attendanceService.checkIn(empNo);
	        
	        // 5. 최신 주간 목록 조회 (React 화면 업데이트를 위한 데이터 반환)
	        // 이번 주 월요일 기준 목록 반환 (startDate를 null로 보내면 서비스에서 자동 계산)
	        List<Attendance> updateList = attendanceService.getWeeklyAttendance(empNo, null);
	        
	        // 성공 시 200 OK와 함께 리스트 반환
	        return ResponseEntity.ok(updateList);
	        
	    } catch (RuntimeException e) {
	        // IP 불일치 혹은 이미 출근한 경우 등 서비스에서 던진 예외 처리
	        // 403 Forbidden: 권한 없음(IP 오류) 혹은 상황에 맞는 에러 메시지 반환
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
	    } catch (Exception e) {
	        // 예상치 못한 기타 서버 에러 처리
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
	    }
	}
	    	
	
	// 퇴근 처리 컨트롤러
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
	
	// 주간 리스트 목록 컨트롤러
	@GetMapping("/weekly/{empNo}")
	public ResponseEntity<List<Attendance>> getWeeklyAttendance
										(@PathVariable("empNo") String empNo,
										@RequestParam(name = "startDate", required = false) String startDate) {
		
		List<Attendance> list = attendanceService.getWeeklyAttendance(empNo, startDate);
		
		return ResponseEntity.ok(list);
	}
}
