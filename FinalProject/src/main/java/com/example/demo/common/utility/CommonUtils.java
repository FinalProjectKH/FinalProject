package com.example.demo.common.utility;

import java.text.SimpleDateFormat;
import java.util.Date;

import jakarta.servlet.http.HttpServletRequest;

public class CommonUtils {
	
	public static int seqNum = 1;
	
	
	public static String getClientIp(HttpServletRequest request) {
		String ip = request.getHeader("X-Forwarded-For");
		if(ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("Proxy-Client-IP");
		}
		
		if(ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("WL-Proxy-Client-IP");
		}
		
		if(ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getRemoteAddr();
		}
		return ip;
	}
	

	public static String fileRename(String originalName) {
		
		// 시간을 원하는 형태의 문자열로 간단히 변경
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
		
		// 현재 시간 저장
		String date = sdf.format(new Date());
		
		// 00001 포맷
		String number = String.format("%05d", seqNum);

		// 1증가
		seqNum++;

		// 99999 넘어갈 시 1로 초기화
		if(seqNum == 100000) seqNum = 1;
		
		// 확장자 구하기
		String ext = originalName.substring(originalName.lastIndexOf("."));
		
		return date + "_" + number + ext;
	}

}
