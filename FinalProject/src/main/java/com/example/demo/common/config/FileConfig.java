package com.example.demo.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.MultipartConfigElement;

@Configuration
@PropertySource("classpath:/config.properties")
public class FileConfig implements WebMvcConfigurer{
	
	// 파일 업로드 임계값
	@Value("${spring.servlet.multipart.file-size-threshold}")
	private long fileSizeThreshold;
	
	// 임계값 초과시 파일의 임시 저장경로
	@Value("${spring.servlet.multipart.location}")
	private String location;
	
	// 요청당 파일 최대 크기
	@Value("${spring.servlet.multipart.max-request-size}")
	private long maxRequestSize;
	
	// 개별 파일당 최대 크기
	@Value("${spring.servlet.multipart.max-file-size}")
	private long maxFileSize;
	
	/** 
	 * MultipartResolver 설정
	 */
	@Bean
	public MultipartConfigElement configElement() {
		
		MultipartConfigFactory factory = new MultipartConfigFactory();
		
		// 파일 업로드 임계값
		factory.setFileSizeThreshold(DataSize.ofBytes(fileSizeThreshold));

		// 임시 저장 폴더 경로
		factory.setLocation(location);

		// HTTP 요청당 파일 최대 크기
		factory.setMaxRequestSize(DataSize.ofBytes(maxRequestSize));

		// 개별 파일당 최대 크기
		factory.setMaxFileSize(DataSize.ofBytes(maxFileSize));
		
		return factory.createMultipartConfig();
		
	}
	
	@Bean
	public MultipartResolver multipartResolver() {

		StandardServletMultipartResolver multipartResolver = new StandardServletMultipartResolver();

		return multipartResolver;

	}
	
	@Value("${my.profile.web-path}")
	private String profileWebPath;

	@Value("${my.profile.folder-path}")
	private String profileFolderPath;
	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {

		registry.addResourceHandler(profileWebPath  + "/**")
		.addResourceLocations("file:///" + profileFolderPath + "/");

	}

}
