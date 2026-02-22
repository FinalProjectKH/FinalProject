package com.example.demo.weather;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
public class WeatherTestController {

    private final WebClient webClient;
    
    private final ObjectMapper om = new ObjectMapper();
    
    public record WeatherNowResponse(double temp, int pty, int sky) {}
    
    private record BaseDt(String date, String time) {}
    
    public record WeatherDayResponse(
            String date,     // yyyyMMdd
            Integer tempMin, // TMN
            Integer tempMax, // TMX
            Integer pty,     // PTY (없으면 0)
            Integer sky      // SKY (없으면 4)
    ) {}

    public WeatherTestController(
            @Value("${weather.kma.base-url}") String baseUrl
    ) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Value("${weather.kma.service-key}")
    private String serviceKey;

    @GetMapping("/api/weather/test")
    public String test(@RequestParam("nx") int nx, @RequestParam("ny") int ny) {

        // KST 기준
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));

        // 매시 40분 이후에 최신이 안정적으로 조회되는 케이스가 많아서,
        // 00~39분이면 1시간 전 정시로 조회
        if (now.getMinute() < 40) {
            now = now.minusHours(1);
        }

        String baseDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String baseTime = now.format(DateTimeFormatter.ofPattern("HH")) + "00";

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/getUltraSrtNcst")
                        .queryParam("serviceKey", serviceKey)
                        .queryParam("numOfRows", 1000)
                        .queryParam("pageNo", 1)
                        .queryParam("dataType", "JSON")
                        .queryParam("base_date", baseDate)
                        .queryParam("base_time", baseTime)
                        .queryParam("nx", nx)
                        .queryParam("ny", ny)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
    
    @GetMapping("/api/weather/test-fcst")
    public String testFcst(@RequestParam("nx") int nx, @RequestParam("ny") int ny) {

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        if (now.getMinute() < 40) now = now.minusHours(1);

        String baseDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String baseTime = now.format(DateTimeFormatter.ofPattern("HH")) + "00";

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/getUltraSrtFcst")
                        .queryParam("serviceKey", serviceKey)
                        .queryParam("numOfRows", 1000)
                        .queryParam("pageNo", 1)
                        .queryParam("dataType", "JSON")
                        .queryParam("base_date", baseDate)
                        .queryParam("base_time", baseTime)
                        .queryParam("nx", nx)
                        .queryParam("ny", ny)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
    
    @GetMapping("/api/weather/now")
    public WeatherNowResponse now(@RequestParam("nx") int nx, @RequestParam("ny") int ny) throws Exception {

        // 1) 실황(현재) 호출: T1H, PTY
        String ncstJson = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/getUltraSrtNcst")
                        .queryParam("serviceKey", serviceKey)
                        .queryParam("numOfRows", 1000)
                        .queryParam("pageNo", 1)
                        .queryParam("dataType", "JSON")
                        .queryParam("base_date", baseDateForNcst())
                        .queryParam("base_time", baseTimeForNcst())
                        .queryParam("nx", nx)
                        .queryParam("ny", ny)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode ncstItems = om.readTree(ncstJson).at("/response/body/items/item");
        double temp = Double.NaN;
        int ptyNcst = 0;

        for (JsonNode it : ncstItems) {
            String cat = it.path("category").asText();
            if ("T1H".equals(cat)) temp = it.path("obsrValue").asDouble();
            if ("PTY".equals(cat)) ptyNcst = it.path("obsrValue").asInt();
        }
        temp = Math.round(temp * 10.0) / 10.0; // 소수 1자리 유지

        // 2) 예보 호출: 가장 가까운 시각의 SKY, PTY
        String fcstJson = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/getUltraSrtFcst")
                        .queryParam("serviceKey", serviceKey)
                        .queryParam("numOfRows", 1000)
                        .queryParam("pageNo", 1)
                        .queryParam("dataType", "JSON")
                        .queryParam("base_date", baseDateForFcst())
                        .queryParam("base_time", baseTimeForFcst())
                        .queryParam("nx", nx)
                        .queryParam("ny", ny)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode fcstItems = om.readTree(fcstJson).at("/response/body/items/item");

        // 가장 가까운 fcstDate+fcstTime 구하기(SKY 기준)
        String bestKey = null;
        for (JsonNode it : fcstItems) {
            if (!"SKY".equals(it.path("category").asText())) continue;
            String key = it.path("fcstDate").asText() + it.path("fcstTime").asText();
            if (bestKey == null || key.compareTo(bestKey) < 0) bestKey = key;
        }

        int sky = 4;     // 기본: 흐림
        int ptyFcst = 0; // 기본: 강수없음
        if (bestKey != null) {
            String bestDate = bestKey.substring(0, 8);
            String bestTime = bestKey.substring(8);

            for (JsonNode it : fcstItems) {
                if (!bestDate.equals(it.path("fcstDate").asText())) continue;
                if (!bestTime.equals(it.path("fcstTime").asText())) continue;

                String cat = it.path("category").asText();
                if ("SKY".equals(cat)) sky = it.path("fcstValue").asInt();
                if ("PTY".equals(cat)) ptyFcst = it.path("fcstValue").asInt();
            }
        }

        // 아이콘/표현은 보통 예보 PTY 우선이 안정적이라 예보 PTY를 최종 PTY로 사용
        return new WeatherNowResponse(temp, ptyFcst, sky);
    }
    
    private String baseDateForNcst() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        if (now.getMinute() < 40) now = now.minusHours(1);
        return now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    private String baseTimeForNcst() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        if (now.getMinute() < 40) now = now.minusHours(1);
        return now.format(DateTimeFormatter.ofPattern("HH")) + "00";
    }

    private String baseDateForFcst() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        // 00~44분이면 직전 시간 30분 발표를 사용
        if (now.getMinute() < 45) now = now.minusHours(1);
        return now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    private String baseTimeForFcst() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        if (now.getMinute() < 45) now = now.minusHours(1);
        return now.format(DateTimeFormatter.ofPattern("HH")) + "30";
    }
    

@GetMapping("/api/weather/3days")
public List<WeatherDayResponse> days3(@RequestParam("nx") int nx, @RequestParam("ny") int ny) throws Exception {

    // ✅ 단기예보는 base_time이 0200/0500/0800/1100/1400/1700/2000/2300
    // 지금 시각 기준으로 "가장 최근 발표시각"으로 맞춰야 안정적으로 나옵니다.
    LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
    BaseDt base = pickVilageBaseDt(now);
    String baseDate = base.date();
    String baseTime = base.time();

    String json = webClient.get()
            .uri(uriBuilder -> uriBuilder
                    .path("/getVilageFcst")
                    .queryParam("serviceKey", serviceKey)
                    .queryParam("numOfRows", 1000)
                    .queryParam("pageNo", 1)
                    .queryParam("dataType", "JSON")
                    .queryParam("base_date", baseDate)
                    .queryParam("base_time", baseTime)
                    .queryParam("nx", nx)
                    .queryParam("ny", ny)
                    .build())
            .retrieve()
            .bodyToMono(String.class)
            .block();

    JsonNode items = om.readTree(json).at("/response/body/items/item");

    // 날짜별로 TMN/TMX/SKY/PTY 모으기
    Map<String, Map<String, List<String>>> byDate = new HashMap<>();
    for (JsonNode it : items) {
        String fcstDate = it.path("fcstDate").asText(); // yyyyMMdd
        String cat = it.path("category").asText();      // TMN/TMX/SKY/PTY...
        String val = it.path("fcstValue").asText();

        byDate.computeIfAbsent(fcstDate, k -> new HashMap<>())
              .computeIfAbsent(cat, k -> new ArrayList<>())
              .add(val);
    }

    // 오늘/내일/모레 3개만
    List<String> targetDates = List.of(
            baseDate,
            now.plusDays(1).format(DateTimeFormatter.ofPattern("yyyyMMdd")),
            now.plusDays(2).format(DateTimeFormatter.ofPattern("yyyyMMdd"))
    );

    List<WeatherDayResponse> out = new ArrayList<>();
    for (String d : targetDates) {
        Map<String, List<String>> m = byDate.getOrDefault(d, Map.of());

        Integer tmin = firstInt(m.get("TMN"));
        Integer tmax = firstInt(m.get("TMX"));

        // SKY/PTY는 시간대별로 여러 개가 오니, "대표값"을 하나 뽑아야 함
        Integer sky = modeInt(m.get("SKY"), 4); // 최빈값, 없으면 4(흐림)
        Integer pty = modeInt(m.get("PTY"), 0); // 최빈값, 없으면 0(없음)

        out.add(new WeatherDayResponse(d, tmin, tmax, pty, sky));
    }
    return out;
}

// ===== helpers =====
private String pickVilageBaseTime(LocalDateTime now) {
    // 발표 시각 목록
    int[] hours = {2, 5, 8, 11, 14, 17, 20, 23};
    int cur = now.getHour();
    int pick = 2;

    for (int h : hours) {
        if (cur >= h) pick = h;
    }

    // 새벽 0~1시는 전날 23시 발표를 쓰는게 맞는 경우가 많음
    if (cur < 2) {
        return "2300"; // base_date는 그대로 두면 안되고 전날로 빼야 하지만, 단순화 버전에서는 일단 패스
    }
    return String.format("%02d00", pick);
}

private Integer firstInt(List<String> list) {
    if (list == null || list.isEmpty()) return null;
    try { return (int) Math.round(Double.parseDouble(list.get(0))); }
    catch (Exception e) { return null; }
}

private Integer modeInt(List<String> list, int defaultVal) {
    if (list == null || list.isEmpty()) return defaultVal;
    Map<Integer, Long> cnt = new HashMap<>();
    for (String s : list) {
        try {
            int v = (int) Math.round(Double.parseDouble(s));
            cnt.put(v, cnt.getOrDefault(v, 0L) + 1);
        } catch (Exception ignored) {}
    }
    return cnt.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(defaultVal);
}

private BaseDt pickVilageBaseDt(LocalDateTime now) {
    int[] hours = {2, 5, 8, 11, 14, 17, 20, 23};

    int cur = now.getHour();

    // 0~1시는 전날 23시 발표 사용
    if (cur < 2) {
        LocalDateTime prev = now.minusDays(1);
        return new BaseDt(prev.format(DateTimeFormatter.ofPattern("yyyyMMdd")), "2300");
    }

    int pick = 2;
    for (int h : hours) {
        if (cur >= h) pick = h;
    }

    return new BaseDt(now.format(DateTimeFormatter.ofPattern("yyyyMMdd")), String.format("%02d00", pick));
}
}
