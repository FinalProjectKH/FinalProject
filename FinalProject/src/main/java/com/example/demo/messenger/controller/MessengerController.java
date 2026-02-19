package com.example.demo.messenger.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.messenger.model.service.MessengerService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("dm")
@RequiredArgsConstructor
public class MessengerController {
	
	private final MessengerService service;
	
	public record DmRoomResponse(
			Long roomId,
		    String peerEmpNo,
		    String title) {}
	
	public record MessageResponse(
		    Long messageId,
		    String senderEmpNo,
		    String content,
		    LocalDateTime sentAt
		) {}
	
	public record SendMessageRequest(String content) {}


	@PostMapping
	public ResponseEntity<DmRoomResponse> createOrGetDm(
	        @RequestBody Map<String, String> request,
	        HttpSession session // 로그인 사용자
	) {
		LoginMemberDTO loginMember = (LoginMemberDTO) session.getAttribute("loginMember");
	    
	    String myEmpNo = loginMember.getEmpNo(); 
	    String peerEmpNo = request.get("peerEmpNo");//상대방 사번

	    Long roomId = service.createOrGetDmRoom(myEmpNo, peerEmpNo);

	    return  ResponseEntity.ok(new DmRoomResponse(roomId, null, null));
	}
	
	@GetMapping("rooms")
	public ResponseEntity<List<DmRoomResponse>> selectRooms (HttpSession session){
		
		LoginMemberDTO loginMember = (LoginMemberDTO) session.getAttribute("loginMember");
		String myEmpNo = loginMember.getEmpNo();
		
		List<DmRoomResponse> rooms = service.selectRooms(myEmpNo);
		
		return ResponseEntity.ok(rooms);
	}
	
	//메시지 목록 조회
	@GetMapping("{activeRoomId}/messages")
	public ResponseEntity<List<MessageResponse>> selectMesseges(@PathVariable("activeRoomId") Long activeRoomId, HttpSession session){
		LoginMemberDTO loginMember = (LoginMemberDTO) session.getAttribute("loginMember");
		String myEmpNo = loginMember.getEmpNo();
		
		List<MessageResponse> Messeges = service.selectMessages(activeRoomId, myEmpNo);
		return ResponseEntity.ok(Messeges);
	}
	
	//메시지 보내기
	@PostMapping("{activeRoomId}/messages")
	public ResponseEntity<Void> sendMessage(@PathVariable("activeRoomId") Long activeRoomId, @RequestBody SendMessageRequest request, HttpSession session){
		LoginMemberDTO loginMember = (LoginMemberDTO) session.getAttribute("loginMember");
		String myEmpNo = loginMember.getEmpNo();
		
		service.sendMessage(activeRoomId, myEmpNo, request.content());
		
		return ResponseEntity.ok().build();
	}
	
}
