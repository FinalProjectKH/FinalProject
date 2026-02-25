package com.example.demo.websocket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.example.demo.websocket.handler.ChattingWebSocketHandler;
import com.example.demo.websocket.interceptor.SessionHandshakeInterceptor;

import lombok.RequiredArgsConstructor;

@Configuration 		// 서버 실행 시 작성된 메서드를 모두 수행
@EnableWebSocket 	// 웹소켓 활성화 설정
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer{
	
	private final SessionHandshakeInterceptor handshakeInterceptor;
	
	private final ChattingWebSocketHandler chattingWebsocketHandler;
	
	// 웹소켓 핸들러를 등록하는 메서드
	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		
		registry
		.addHandler(chattingWebsocketHandler, "/chattingSock")
		.addInterceptors(handshakeInterceptor)
		.setAllowedOriginPatterns("*");
	}

}
