package com.example.demo.messenger.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.messenger.controller.MessengerController.DmRoomResponse;
import com.example.demo.messenger.controller.MessengerController.MessageResponse;
import com.example.demo.messenger.controller.MessengerController.RecentMessageResponse;

@Mapper
public interface MessengerMapper {
	
	 Long selectDmRoomId(@Param("a") String a, @Param("b") String b);

	  int insertChatRoom();            // ROOM_ID는 시퀀스로
	  Long selectLastRoomId();         // 방금 만든 ROOM_ID 가져오기

	  int insertRoomMember(@Param("roomId") Long roomId, @Param("empNo") String empNo);

	  int insertDmRoomKey(@Param("a") String a, @Param("b") String b, @Param("roomId") Long roomId);

	  List<DmRoomResponse> selectRooms(String myEmpNo);

	  List<MessageResponse> selectMessages( @Param("activeRoomId")Long activeRoomId,@Param("empNo") String myEmpNo);
	  
	  Integer isRoomMember(@Param("activeRoomId") Long activeRoomId, @Param("empNo") String empNo);

	  void insertMessage(@Param("activeRoomId") Long activeRoomId, @Param("empNo") String myEmpNo, @Param("content") String content);

	  RecentMessageResponse preview(String myEmpNo);

	  int unreadCount(String empNo);

	  void markRead(@Param("roomId") Long roomId, @Param("empNo") String empNo);

}
