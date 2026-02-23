package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 🔥 핵심: 브라우저에서 "/uploads/**" 로 요청이 오면
        // 내 프로젝트 폴더 안의 "src/main/resources/static/uploads/" 폴더를 연결!
        
        String projectPath = System.getProperty("user.dir");
        String uploadPath = "file:///" + projectPath + "/src/main/resources/static/uploads/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}