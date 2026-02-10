package com.example.demo.config; // 패키지명은 본인 프로젝트에 맞게 수정

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 🔥 핵심: 브라우저에서 "/uploads/**" 로 요청이 오면
        // 내 프로젝트 폴더 안의 "src/main/resources/static/uploads/" 폴더를 연결해라!
        
        // 내 프로젝트의 절대 경로(user.dir) 가져오기
        String projectPath = System.getProperty("user.dir");
        
        // "file:///" 접두어를 붙여서 로컬 파일 시스템 경로임을 명시
        String uploadPath = "file:///" + projectPath + "/src/main/resources/static/uploads/";

        registry.addResourceHandler("/uploads/**") // 1. URL 주소 패턴
                .addResourceLocations(uploadPath); // 2. 실제 파일 위치
    }
}