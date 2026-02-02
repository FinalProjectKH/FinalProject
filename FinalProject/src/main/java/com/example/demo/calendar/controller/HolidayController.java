package com.example.demo.calendar.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.calendar.model.service.HolidayService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/calendar/holidays")
@CrossOrigin(origins = "http://localhost:5173")
public class HolidayController {
	
	private final HolidayService service;
	
	
	@PostMapping("/sync")
	public String syncHolidays(@RequestParam("year") int year) {
		
		service.fetchAndSaveHolidays(year);
		
		return year + "년 공휴일 업데이트 완료";
		
	}
	
	

}
