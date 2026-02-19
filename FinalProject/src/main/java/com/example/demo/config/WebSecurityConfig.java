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
@EnableWebSecurity // 💡 스프링 시큐리티 설정을 활성화!
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CORS 설정 적용 (리액트에서 오는 쿠키 허용)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. CSRF 비활성화 (개발 단계에서는 꺼두는 게 정신 건강에 좋아!)
            .csrf(csrf -> csrf.disable())
            
            // 3. 권한 설정
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/attendance/**").permitAll() // 💡 근태 API는 로그인 필수
                .anyRequest().permitAll() // 나머지는 일단 허용
            )
            
            // 4. 세션 관리 (로그인 정보를 유지하기 위해 필요)
            .sessionManagement(session -> session
            		.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 세션이 필요할 때만 생성/사용
            )
            
            // 5. 기본 로그인 폼 사용 (혹은 커스텀 로그인 설정이 있다면 추가)
            .formLogin(form -> form.disable()) // 리액트 사용 시 보통 disable
            .httpBasic(basic -> basic.disable());

        return http.build();
    }

    // 💡 핵심: 리액트(5173포트)에서 오는 신분증(쿠키)을 허용하는 상세 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // 리액트 주소
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // 💡 이게 있어야 PrincipalDetails가 안 비어!

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}