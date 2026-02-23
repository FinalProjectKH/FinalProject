package com.example.demo.common.config; // 패키지명 본인 프로젝트에 맞게 수정!

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 주소에 대해
//        		.allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // 쿠키를 실어 나르는 통신(allowCredentials: true)에서는 신뢰할 수 있는 
                // 특정 주소(allowedOrigins)만 허용해야 한다는 규칙이 있어서 
                // 그래서 * 패턴은 지워야 함.
                .allowCredentials(true)
                .allowedHeaders("*") // 모든 헤더 허용
                .allowedOrigins("http://localhost:5173")
                .maxAge(3600);
    }
}