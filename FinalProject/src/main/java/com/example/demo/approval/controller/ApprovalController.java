package com.example.demo.approval.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.approval.model.dto.ApprovalDto;
import com.example.demo.approval.model.service.ApprovalService;
import com.example.demo.employee.model.dto.LoginMemberDTO;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "https://localhost:5173")
@RequestMapping("/api/approval")
@Slf4j
public class ApprovalController {
	
	private final ApprovalService service;
	
	/** 결재 상신 (신규/수정)
	 * @param dto
	 * @param files
	 * @return
	 * @throws Exception
	 */
	@PostMapping(value = "/insert", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
	public ResponseEntity<String> insertApproval(
	      @RequestPart("data") ApprovalDto dto, 
	      @RequestPart(value = "files", required = false) List<MultipartFile> files
	) throws Exception {
		
        // 로그 찍어보면 수정인지 신규인지 알 수 있음 (docNo 유무)
		log.info("결재 요청 데이터: {}", dto);
		
		if(dto.getEmpNo() == null || dto.getApprovalTitle() == null)
			return ResponseEntity.badRequest().body("필수 정보(사번, 제목)가 누락되었습니다.");

		try {
            // 🔥 서비스가 알아서 판단 (번호 있으면 수정, 없으면 신규)
            int result = service.insertApproval(dto, files);

            if (result > 0) {
                return ResponseEntity.ok("성공적으로 처리되었습니다.");
            } else {
                return ResponseEntity.status(500).body("처리 실패 (DB 오류)");
            }

        } catch (Exception e) {
            log.error("결재 처리 중 에러 발생", e);
            return ResponseEntity.status(500).body("서버 에러 발생: " + e.getMessage());
        }
	}
	
	// 1. 결재 대기 문서 (내 차례인 문서)
    @GetMapping("/wait")
    public ResponseEntity<?> getWaitList(@RequestParam("empNo") int empNo) {
        try {
            List<ApprovalDto> list = service.selectWaitList(empNo);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("결재 대기 목록 조회 실패", e);
            return ResponseEntity.status(500).body("목록 조회 실패");
        }
    }

    // 2. 결재 예정 문서 (내 차례는 아직 안 옴)
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingList(@RequestParam("empNo") int empNo) {
        try {
            List<ApprovalDto> list = service.selectUpcomingList(empNo);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("결재 예정 목록 조회 실패", e);
            return ResponseEntity.status(500).body("목록 조회 실패");
        }
    }

    // 3. 기안 문서함 (내가 작성한 문서 - 완료된 것만)
    @GetMapping("/draft")
    public ResponseEntity<?> getMyDraftList(@RequestParam("empNo") int empNo) {
        try {
            List<ApprovalDto> list = service.selectMyDraftList(empNo);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("기안 문서함 조회 실패", e);
            return ResponseEntity.status(500).body("목록 조회 실패");
        }
    }

    // 4. 임시 저장함 (작성 중인 문서)
    @GetMapping("/temp")
    public ResponseEntity<?> getTempList(@RequestParam("empNo") int empNo) {
        try {
            List<ApprovalDto> list = service.selectTempList(empNo);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("임시 저장함 조회 실패", e);
            return ResponseEntity.status(500).body("목록 조회 실패");
        }
    }

    // 5. 결재 문서함 (내가 승인/반려 처리한 문서)
    @GetMapping("/approved")
    public ResponseEntity<?> getMyApprovedList(@RequestParam("empNo") int empNo) {
        try {
            List<ApprovalDto> list = service.selectMyApprovedList(empNo);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("결재 문서함 조회 실패", e);
            return ResponseEntity.status(500).body("목록 조회 실패");
        }
    }
    
    /** * 상세조회 (수정 시 데이터 로드용) - 권한 체크 없이 단순 데이터 조회
     * 🔥 [수정됨] @PathVariable 사용 및 String 타입 명시 (400, 404 에러 해결)
     */
    @GetMapping("/detail/{docNo}")
    public ResponseEntity<ApprovalDto> getApprovalDetail(@PathVariable("docNo") String docNo) {
        
        // 단순 조회 (수정 폼 채우기용)
        ApprovalDto dto = service.selectApprovalDetail(docNo);
        
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }
    
    /** * 상세조회 (열람용) + 권한 체크 포함
     * @param docNo
     * @param empNo (요청자 사번)
     */
    @GetMapping("/view/{docNo}") // URL 구분 (수정용 detail vs 열람용 view)
    public ResponseEntity<?> getApprovalView(
            @PathVariable("docNo") String docNo, 
            @RequestParam(value = "empNo", required = true) String empNo) { 
    	
    	try {
            // Service에 docNo와 empNo를 같이 넘겨서 권한 체크
            Map<String, Object> result = service.selectApprovalDetailWithAuth(docNo, empNo);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("상세 조회 중 오류 발생");
        }
    }
    
    
    /** 승인 / 반려처리 */
    @PostMapping("/process")
    public ResponseEntity<?> processApproval(@RequestBody Map<String, Object> params){
    	try {
    		int result = service.processApproval(params);
    		
    		if(result > 0) {
    			return ResponseEntity.ok("처리가 완료되었습니다 !");
    		} else {
    			return ResponseEntity.status(500).body("처리 실패... ㅠㅠ");
    		}
			
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body("에러 : " + e.getMessage());
		}
    }
    
    
    /** 결재 취소 (회수) */
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelApproval(@RequestBody Map<String, String> params){
    	try {
    		String docNo = params.get("docNo");
    		String empNo = params.get("empNo");
    		
    		int result = service.cancelApproval(docNo, empNo);
    		
    		if (result > 0) return ResponseEntity.ok("회수되었습니다.");
            else return ResponseEntity.status(500).body("이미 결재가 진행되어 취소할 수 없습니다.");
    		
		} catch (Exception e) {
			return ResponseEntity.status(500).body("에러 : " + e.getMessage());
		}
    }
    
    /** * 🔥 [추가됨] 문서 삭제 (임시저장 삭제 등)
     * @PathVariable 사용 및 String 타입 명시 (404 에러 해결)
     */
    @DeleteMapping("/delete/{docNo}")
    public ResponseEntity<String> deleteApproval(@PathVariable("docNo") String docNo) {
        try {
            service.deleteApproval(docNo);
            return ResponseEntity.ok("삭제되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("삭제 실패: " + e.getMessage());
        }
    }

    /** 전자결재 홈 (대시보드) */
    @GetMapping("/home")
    public ResponseEntity<?> getHomeData(@RequestParam("empNo") String empNo) {
        try {
            System.out.println("▶ Controller 도착: empNo = " + empNo);
            
            Map<String, Object> homeData = service.getHomeData(empNo);
            
            System.out.println("▶ Service 데이터 수신 완료: " + homeData);
            
            return ResponseEntity.ok(homeData);

        } catch (Exception e) {
            System.err.println("ApprovalController 에러 발생");
            e.printStackTrace(); 
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 내부 오류");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    // 휴가 사용 일수 계산기
    @GetMapping("/calculate-days")
    public ResponseEntity<Double> calculateVacationDays(
            @RequestParam("start") String start,
            @RequestParam("end") String end,
            @RequestParam("type") String type
    ) {
        try {
            double days = service.calculateVacationDays(start, end, type);
            return ResponseEntity.ok(days);
        } catch (Exception e) {
            return ResponseEntity.ok(0.0); // 에러나면 0일로 처리
        }
    }
    
    @GetMapping("/sidebar") // 주소를 /sidebar로 통일
    public ResponseEntity<Map<String, Object>> getSidebarCounts(HttpSession session) {
        
        // 1. 세션에서 로그인한 사원 정보 꺼내기
        LoginMemberDTO loginMember = (LoginMemberDTO) session.getAttribute("loginMember");

        // 2. 로그인 안 했으면 0으로 리턴하거나 401 에러
        if (loginMember == null) {
            return ResponseEntity.ok(new HashMap<>()); // 또는 401
        }

        try {
            // 3. 서비스 호출
            Map<String, Object> counts = service.getSidebarCounts(loginMember.getEmpNo());
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(new HashMap<>());
        }
    }

}