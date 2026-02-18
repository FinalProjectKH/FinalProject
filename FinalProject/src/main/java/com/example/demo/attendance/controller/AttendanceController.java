package com.example.demo.attendance.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.attendance.model.dto.AttendanceDTO;
import com.example.demo.attendance.model.dto.AttendanceDept;
import com.example.demo.attendance.model.entity.Attendance;
import com.example.demo.attendance.model.entity.LeaveHistory;
import com.example.demo.attendance.model.service.AttendanceService;
import com.example.demo.common.config.auth.PrincipalDetails;
import com.example.demo.common.utility.CommonUtils;
import com.example.demo.employee.model.dto.LoginMemberDTO;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class AttendanceController {
	
	private final AttendanceService attendanceService;
	
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
	        List<AttendanceDTO> updateList = attendanceService.getWeeklyAttendance(empNo, null);
	        
	        // 성공 시 200 OK와 함께 리스트 반환
	        return ResponseEntity.ok(updateList);
	        
	    } catch (RuntimeException e) {
	        // 메시지에 "네트워크"라는 말이 포함되어 있으면 403, 아니면 400을 전달
	        if (e.getMessage().contains("네트워크")) {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
	        }
	        return ResponseEntity.badRequest().body(e.getMessage()); // 400 에러
	        
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
	public ResponseEntity<List<AttendanceDTO>> getWeeklyAttendance
										(@PathVariable("empNo") String empNo,
										@RequestParam(name = "startDate", required = false) String startDate) {
		
		List<AttendanceDTO> list = attendanceService.getWeeklyAttendance(empNo, startDate);
		
		return ResponseEntity.ok(list);
	}
	
	// 부서 근태 관리 권한 체크
	@GetMapping("/department/{deptCode}")
	public ResponseEntity<?> getDeptAttendance(
	        @PathVariable("deptCode") String deptCode,
	        @RequestParam("date") String date,
	        @AuthenticationPrincipal PrincipalDetails principal) {

	    // 1. 세션 체크: 사용자가 누군지 식별 가능한지 확인
	    if (principal == null || principal.getEmployee() == null) {
	        log.warn("[근태관리] 미인증 사용자의 접근 시도 - 부서: {}", deptCode);
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("세션이 만료되었습니다. 다시 로그인해주세요.");
	    }

	    // 💡 [추가] 상세 권한 로그: 여기서 '2'가 제대로 찍히는지 확인하는 게 핵심!
	    Integer currentLevel = principal.getEmployee().getAuthorityLevel();
	    String currentEmp = principal.getEmployee().getEmpName();
	    
	    log.info("[권한 검사] 요청자: {}({}), 보유레벨: {}, 필요레벨: 2", 
	             currentEmp, principal.getUsername(), currentLevel);

	    // 2. 권한 체크: 팀장(2) 이상만 허용
	    // 💡 Integer 비교 시 발생할 수 있는 오류를 방지하기 위해 null 체크와 정확한 비교 수행
	    if (currentLevel == null || currentLevel < 2) {
	        log.error("[권한 부족] 사용자 {}의 레벨({})이 낮아 접근이 거부됨", currentEmp, currentLevel);
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("부서 근태 조회 권한이 없습니다.");
	    }

	    try {
	        log.info("[근태관리] 조회 승인 - 부서: {}, 일자: {}, 요청자: {}", 
	                 deptCode, date, currentEmp);
	        
	        List<AttendanceDept> list = attendanceService.getDeptAttendanceList(deptCode, date);
	        
	        // 💡 [추가] 데이터 존재 여부 로그
	        log.info("[조회 결과] 데이터 건수: {}건", list != null ? list.size() : 0);
	        
	        return ResponseEntity.ok(list);
	        
	    } catch (Exception e) {
	        log.error("[근태관리] 서버 내부 오류 발생 - 사유: {}", e.getMessage(), e);
	        return ResponseEntity.internalServerError().body("데이터 조회 중 시스템 오류가 발생했습니다.");
	    }
	}
	
	// 나의 남은 휴가 확인 ( 개인 )
	@GetMapping("/leave-info")
    public ResponseEntity<?> getLeaveInfo(HttpSession session) {
        LoginMemberDTO loginMember = (LoginMemberDTO) session.getAttribute("loginMember");
        if (loginMember == null) return ResponseEntity.status(401).build();

        double remainingLeave = attendanceService.getRemainingLeave(loginMember.getEmpNo());
        
        Map<String, Object> result = new HashMap<>();
        result.put("remainingLeave", remainingLeave);
        return ResponseEntity.ok(result);
    }
	
	// 우리 부서 오늘 휴가자 수 ( 통계 )
	@GetMapping("/dept-leave-count")
	public ResponseEntity<Integer> getDeptLeaveCount(@RequestParam String deptCode) {
	    return ResponseEntity.ok(attendanceService.getTodayLeaveCount(deptCode));
	}
	
	// 부서원 휴가 내역 관리 ( 관리 )
	@GetMapping("/dept-leaves")
	public ResponseEntity<?> getDeptLeaves(HttpSession session) {
	    LoginMemberDTO loginMember = (LoginMemberDTO) session.getAttribute("loginMember");
	    
	    // 💡 여기서도 방어 코드! 로그인 안 했으면 입구 컷
	    if (loginMember == null) return ResponseEntity.status(401).build();

	    // 박지성 과장의 부서 코드와 권한 레벨을 넘겨서 부서원들 기록 조회
	    List<LeaveHistory> list = attendanceService.getDeptLeaveHistory(
	        loginMember.getDeptCode(), 
	        loginMember.getAuthorityLevel()
	    );
	    
	    return ResponseEntity.ok(list);
	}
}
