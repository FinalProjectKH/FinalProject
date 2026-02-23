package com.example.demo.config;

import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CORS 설정 적용 (리액트에서 오는 쿠키 허용)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. CSRF 비활성화 (개발 단계)
            .csrf(csrf -> csrf.disable())
            
            // 3. 권한 설정
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/attendance/**").permitAll() // 💡 근태 API 등
                .anyRequest().permitAll() // 나머지는 일단 허용
            )
            
            // 4. 세션 관리 (로그인 정보 유지)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            
            // 5. 폼 로그인, 기본 인증 비활성화 (리액트 연동 시)
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }

    // 💡 핵심: 리액트에서 오는 신분증(쿠키)을 허용하는 상세 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Vercel 주소와 로컬 주소 모두 허용!
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:5173", 
            "https://final-project-three-sage.vercel.app"
        )); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // 💡 이게 있어야 PrincipalDetails가 안 비어!

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}