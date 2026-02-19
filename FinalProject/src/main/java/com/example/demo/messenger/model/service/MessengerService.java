package com.example.demo.messenger.model.service;

import java.util.List;

import com.example.demo.messenger.controller.MessengerController.DmRoomResponse;
import com.example.demo.messenger.controller.MessengerController.MessageResponse;

public interface MessengerService {
	
	//대화방 생성(있으면 조회)
	Long createOrGetDmRoom(String myEmpNo, String peerEmpNo);
	
	//메신저 열릴 때, 대화방 조회
	List<DmRoomResponse> selectRooms(String myEmpNo);
	
	//메시지 목록 조회
	List<MessageResponse> selectMessages(Long activeRoomId, String myEmpNo);
	
	//메시지 보내기
	void sendMessage(Long activeRoomId, String myEmpNo, String content);
	
}
