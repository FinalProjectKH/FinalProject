package com.example.demo.calendar.model.service;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.calendar.model.dto.HolidayDto;
import com.example.demo.calendar.model.entity.CalendarCategoryEntity;
import com.example.demo.calendar.model.entity.CalendarEntity;
import com.example.demo.calendar.model.repository.CalendarCategoryRepository;
import com.example.demo.calendar.model.repository.CalendarRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HolidayServiceImpl implements HolidayService{
	
	private final CalendarRepository calendarRepository;
	private final CalendarCategoryRepository categoryRepository;
	
	private final String API_KEY = 
			"98c248125c0299694348805c4ac504ff8ca81e9c46aa5d3c79c8f6a425b84ab9"; // API 인증키
	
	
	
	@Transactional
    public void fetchAndSaveHolidays(int year) {
        // 1. "공휴일" 카테고리 확보 (없으면 자동 생성)
        CalendarCategoryEntity holidayCategory = categoryRepository.findByName("공휴일");
        if (holidayCategory == null) {
            holidayCategory = CalendarCategoryEntity.builder()
                    .name("공휴일").color("#FF0000").type("3") // 전사 일정(3)
                    .ownerEmpNo("admin").deptCode("HR")
                    .build();
            categoryRepository.save(holidayCategory);
        }

        // 2. 1월~12월 반복해서 API 호출
        RestTemplate restTemplate = new RestTemplate();
        for (int month = 1; month <= 12; month++) {
            try {
                // URI 생성 (String으로 바로 넣으면 인코딩 문제 생길 수 있어서 URI 객체 사용 권장)
                String urlStr = String.format(
                        "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo" +
                                "?solYear=%d&solMonth=%02d&ServiceKey=%s&_type=json&numOfRows=100",
                        year, month, API_KEY);
                URI uri = new URI(urlStr);

                // API 호출 (전화 걸기)
                HolidayDto response = restTemplate.getForObject(uri, HolidayDto.class);

                // 데이터 저장
                if (response != null && response.getResponse().getBody().getItems() != null) {
                    List<HolidayDto.Item> items = response.getResponse().getBody().getItems().getItem();
                    if (items != null) {
                        for (HolidayDto.Item item : items) {
                            saveHoliday(item, holidayCategory);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println(month + "월 데이터 가져오기 실패: " + e.getMessage());
            }
        }
    }

    private void saveHoliday(HolidayDto.Item item, CalendarCategoryEntity category) {
        if (!"Y".equals(item.getIsHoliday())) return; 

        // 20260505 -> LocalDate 변환
        LocalDate date = LocalDate.parse(String.valueOf(item.getLocdate()), DateTimeFormatter.BASIC_ISO_DATE);
        
        // 중복 방지 체크
        boolean exists = calendarRepository.existsByCalTitleAndStartDate(
                item.getDateName(), date.atStartOfDay());

        if (!exists) {
            CalendarEntity entity = CalendarEntity.builder()
                    .calTitle(item.getDateName()) // 예: 광복절
                    .calContent("공휴일")
                    .startDate(date.atStartOfDay())
                    .endDate(date.atTime(23, 59, 59))
                    .alldayYn("Y")
                    .openYn("Y")
                    .calCategory(category)
                    .typeId(category.getType())
                    .empNo("system") 
                    .build();
            
            calendarRepository.save(entity);
            System.out.println("✅ 저장 완료: " + item.getDateName());
        }
    }
}