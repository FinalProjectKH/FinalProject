package com.example.demo.websocket.handler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.example.demo.employee.model.dto.LoginMemberDTO;
import com.example.demo.messenger.model.service.MessengerService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ChattingWebSocketHandler extends TextWebSocketHandler{
	
	private final MessengerService service;
	private final ObjectMapper objectMapper; 
	
	// empNo → 접속 세션들
    private final Map<String, Set<WebSocketSession>> empSessions = new ConcurrentHashMap<>();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {

        HttpSession httpSession = (HttpSession) session.getAttributes().get("session");
        LoginMemberDTO loginMember =
                (LoginMemberDTO) httpSession.getAttribute("loginMember");

        String empNo = loginMember.getEmpNo();

        empSessions
            .computeIfAbsent(empNo, k -> ConcurrentHashMap.newKeySet())
            .add(session);
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        empSessions.values().forEach(set -> set.remove(session));
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message)
            throws Exception {

        // JSON → DTO
        WsMessage msg = objectMapper.readValue(message.getPayload(), WsMessage.class);

        HttpSession httpSession = (HttpSession) session.getAttributes().get("session");
        LoginMemberDTO loginMember =
                (LoginMemberDTO) httpSession.getAttribute("loginMember");

        String myEmpNo = loginMember.getEmpNo();

        // 1️ DB 저장
        service.sendMessage(msg.roomId(), myEmpNo, msg.content());
        
        WsMessageResponse res = new WsMessageResponse(
        		msg.roomId(),
                myEmpNo,                 // sender
                msg.content(),
                LocalDateTime.now().toString()      // sentAt (DB시간과 100% 일치 원하면 아래 2번 참고)
            );

        // 2️ 방 참여자에게 push
        pushToUser(myEmpNo, res);               // 나
        pushToUser(msg.targetEmpNo(), res);     // 상대
    }

    private void pushToUser(String empNo, WsMessageResponse msg) throws IOException {

        Set<WebSocketSession> sessions = empSessions.get(empNo);
        if (sessions == null) return;

        String json = objectMapper.writeValueAsString(msg);

        for (WebSocketSession s : sessions) {
            if (s.isOpen()) s.sendMessage(new TextMessage(json));
        }
    }
    
    // WebSocket용 메시지 DTO
    public record WsMessage(
            Long roomId,
            String targetEmpNo,
            String content
    ) {}
    
    public record WsMessageResponse(
            Long roomId,
            String senderEmpNo,
            String content,
            String sentAt
    ) {}
}
    

