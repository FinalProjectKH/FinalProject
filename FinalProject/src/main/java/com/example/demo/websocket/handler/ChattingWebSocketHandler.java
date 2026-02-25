package com.example.demo.websocket.handler;

import java.io.IOException;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.example.demo.messenger.model.service.MessengerService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ChattingWebSocketHandler extends TextWebSocketHandler {
    
    private final MessengerService service;
    private final ObjectMapper objectMapper; 
    
    // empNo → 접속 세션들 관리
    private final Map<String, Set<WebSocketSession>> empSessions = new ConcurrentHashMap<>();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // 🔥 프론트에서 넘어온 URI 파라미터에서 empNo를 직접 추출! (세션 의존성 제거)
        String empNo = extractEmpNoFromUri(session.getUri());
        
        if (empNo != null) {
            empSessions
                .computeIfAbsent(empNo, k -> ConcurrentHashMap.newKeySet())
                .add(session);
            System.out.println("웹소켓 연결 성공! 접속 사번: " + empNo);
        } else {
            System.out.println("사번 파라미터가 없어서 웹소켓 연결이 거부되었습니다.");
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        empSessions.values().forEach(set -> set.remove(session));
        System.out.println("웹소켓 연결 종료됨");
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // JSON → DTO 변환
        WsMessage msg = objectMapper.readValue(message.getPayload(), WsMessage.class);

        // 🔥 보낸 사람 사번 추출
        String myEmpNo = extractEmpNoFromUri(session.getUri());

        if (myEmpNo == null) return; // 인증 정보 없으면 무시

        // 1. DB에 메시지 저장
        service.sendMessage(msg.roomId(), myEmpNo, msg.content());
        
        WsMessageResponse res = new WsMessageResponse(
                msg.roomId(),
                myEmpNo,                 // sender
                msg.content(),
                LocalDateTime.now().toString()
            );

        // 2. 방 참여자(나와 상대방)에게 웹소켓 Push
        pushToUser(myEmpNo, res);               // 나에게 쏘기
        pushToUser(msg.targetEmpNo(), res);     // 상대방에게 쏘기
    }

    private void pushToUser(String empNo, WsMessageResponse msg) throws IOException {
        Set<WebSocketSession> sessions = empSessions.get(empNo);
        if (sessions == null) return;

        String json = objectMapper.writeValueAsString(msg);

        for (WebSocketSession s : sessions) {
            if (s.isOpen()) s.sendMessage(new TextMessage(json));
        }
    }
    
    // 🔥 URI(예: ws://.../chattingSock?empNo=123)에서 empNo 값을 뽑아내는 도우미 메서드
    private String extractEmpNoFromUri(URI uri) {
        if (uri == null || uri.getQuery() == null) return null;
        String query = uri.getQuery();
        String[] params = query.split("&");
        for (String param : params) {
            String[] keyValue = param.split("=");
            if (keyValue.length == 2 && "empNo".equals(keyValue[0])) {
                return keyValue[1];
            }
        }
        return null;
    }
    
    // WebSocket용 메시지 레코드(DTO)
    public record WsMessage(Long roomId, String targetEmpNo, String content) {}
    
    public record WsMessageResponse(Long roomId, String senderEmpNo, String content, String sentAt) {}
}