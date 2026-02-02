package com.example.demo.calendar.model.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
public class HolidayDto {
	private Response response; // 가장 바깥 껍데기

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true) // 모르는 필드는 무시 (에러 방지)
    public static class Response {
        private Body body;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Body {
        private Items items;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Items {
        // 공휴일이 하나일 땐 객체, 여러 개일 땐 리스트로 오는데
        // Jackson이 알아서 처리하게 List로 받습니다.
    	@JsonFormat(with = JsonFormat.Feature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
        private List<Item> item; 
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Item {
        private String dateName;   // 공휴일 이름
        private Integer locdate;   // 날짜
        private String isHoliday;  // "Y"
    }
}
