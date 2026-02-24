package com.example.demo.messenger.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.messenger.controller.MessengerController.DmRoomResponse;
import com.example.demo.messenger.controller.MessengerController.MessageResponse;
import com.example.demo.messenger.controller.MessengerController.RecentMessageResponse;
import com.example.demo.messenger.model.mapper.MessengerMapper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
public class MessengerServiceImpl implements MessengerService{
	
	private final MessengerMapper mapper;

	@Override
	public Long createOrGetDmRoom(String myEmpNo, String peerEmpNo) {
		
		if (myEmpNo == null || peerEmpNo == null) throw new IllegalArgumentException("사번이 없습니다.");
	    if (myEmpNo.equals(peerEmpNo)) throw new IllegalArgumentException("본인과의 DM은 불가");

	    // (a,b) 정렬 저장 규칙
	    String a = (myEmpNo.compareTo(peerEmpNo) <= 0) ? myEmpNo : peerEmpNo;
	    String b = (myEmpNo.compareTo(peerEmpNo) <= 0) ? peerEmpNo : myEmpNo;

	    // 1) 기존 DM 방 조회
	    Long roomId = mapper.selectDmRoomId(a, b);
	    if (roomId != null) return roomId;

	    // 2) 없으면 생성 (중복 생성 레이스 대비: UNIQUE 충돌 나도 OK)
	    try {
	      // room 생성
	      mapper.insertChatRoom();                 // ROOM_ID는 시퀀스로 생성
	      Long newRoomId = mapper.selectLastRoomId(); // 방금 생성된 ROOM_ID 가져오기 (아래 SQL 참고)

	      // 멤버 2명 추가
	      mapper.insertRoomMember(newRoomId, myEmpNo);
	      mapper.insertRoomMember(newRoomId, peerEmpNo);

	      // DM 키 등록(UNIQUE: (a,b))
	      mapper.insertDmRoomKey(a, b, newRoomId);

	      return newRoomId;

	    } catch (Exception e) {
	      // 누가 동시에 먼저 만들었을 수 있음 → 다시 조회해서 반환
	      Long retry = mapper.selectDmRoomId(a, b);
	      if (retry != null) return retry;
	      throw e;
		
	}

}

	@Override
	public List<DmRoomResponse> selectRooms(String myEmpNo) {
		List<DmRoomResponse> rooms = mapper.selectRooms(myEmpNo); 
		return rooms;
	}
	
	//메시지 목록 조회
	@Override
	public List<MessageResponse> selectMessages(Long activeRoomId, String myEmpNo) {
		List<MessageResponse> messeges = mapper.selectMessages(activeRoomId, myEmpNo);
		return messeges;
	}
	
	//메시지 보내기
	@Override
	public void sendMessage(Long activeRoomId, String myEmpNo, String content) {
		
	    if (content == null || content.trim().isEmpty()) {
	        throw new IllegalArgumentException("메시지 내용이 없습니다.");
	    }
		
	    Integer roomEmp = mapper.isRoomMember(activeRoomId, myEmpNo);
		if(roomEmp == null || roomEmp != 1) {
			throw new RuntimeException("해당 대화방에 접근 권한이 없습니다.");	
		}
		mapper.insertMessage(activeRoomId, myEmpNo, content);
	}
	
	//메인 화면(최근 메시지)
	@Override
	public RecentMessageResponse preview(String myEmpNo) {
		
		RecentMessageResponse message = mapper.preview(myEmpNo);
		
	    if (message == null) {
	        return null; // 또는 Optional 처리도 가능
	    }
		
		return message;
	}
	
	//사이드바 메신저 벳지 조회(안잃은 메시지)
	@Override
	public int unreadCount(String empNo) {
		int count = mapper.unreadCount(empNo);
		return count;
	}
	
	//
	@Override
	public void markRead(Long roomId, String empNo) {
		mapper.markRead(roomId, empNo);
	}

}
