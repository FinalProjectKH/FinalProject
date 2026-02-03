// 캘린더 카테고리 타입
export interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  bgColor?: string;
  dragBgColor?: string;
  borderColor?: string;
  category: string; // '1': 내캘린더, '2': 팀, '3': 전사
}

// 모달 상태 타입
export interface ModalState {
  id: string;         // 🔥 [핵심] 수정 모드 구분을 위한 ID 추가
  calendarId: string; // 카테고리 ID
  type: string;       // 대분류 (내/팀/전사)
  title: string;
  body: string;       // 메모/내용
  location: string;   // 장소
  start: Date;
  end: Date;
  isAllday: boolean;
  isPrivate: boolean;
}