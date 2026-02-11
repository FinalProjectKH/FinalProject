package com.example.demo.common.utility;

import java.security.SecureRandom;

public class TempPwUtil {

	private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
	private static final String NUMBER = "123456789"; // 0 제외(혼동 방지)
	private static final String CHARSET = UPPER + LOWER + NUMBER;

	private static final SecureRandom RANDOM = new SecureRandom();

	private TempPwUtil() {} // new 방지

	public static String makeTempPw(int length) {
		StringBuilder sb = new StringBuilder(length);

		for (int i = 0; i < length; i++) {
			int idx = RANDOM.nextInt(CHARSET.length());
			sb.append(CHARSET.charAt(idx));
		}
		return sb.toString();

	}

}
