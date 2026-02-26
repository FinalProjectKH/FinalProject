import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// 🔥 props에 loginMember, readOnly 추가
export default function VacationForm({ data, onChange, approvalLines = [], loginMember, readOnly }) {
  
  // 1. 상태 관리 (계산된 차감 일수 저장용)
  const [calculatedDays, setCalculatedDays] = useState(0.0);

  // 🔥 VITE 환경 변수 가져오기
  const API_URL = import.meta.env.VITE_BASE_URL;

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
  });

  // 기안일 로직
  const writeDate = data.approvalDate || today;

  // 결재선 빈칸 채우기 로직
  const maxApprovers = 3;
  const displayLines = [...approvalLines];
  while (displayLines.length < maxApprovers) {
    displayLines.push(null); 
  }

  // =================================================================
  // 2. 🔥 [핵심 로직] 백엔드 계산기 API 호출
  // =================================================================
  const fetchCalculatedDays = useCallback(async () => {
    // 필수값이 없으면 계산 안 함
    if (!data.startDate || !data.endDate || !data.vacationType) {
      setCalculatedDays(0);
      return;
    }

    try {
      // 🔥 백엔드 주소 추가 및 axios용 쿠키 설정(withCredentials) 추가!
      const response = await axios.get(`${API_URL}/api/approval/calculate-days`, {
        params: {
          start: data.startDate,
          end: data.endDate,
          type: data.vacationType
        },
        withCredentials: true 
      });
      setCalculatedDays(response.data); // 결과값 저장
      
    } catch (error) {
      console.error("일수 계산 실패:", error);
      setCalculatedDays(0);
    }
  }, [data.startDate, data.endDate, data.vacationType, API_URL]);

  // =================================================================
  // 3. 🔥 [핵심 로직] 데이터 변경 감지 & 반차 자동 제어
  // =================================================================
  useEffect(() => {
    // 1) 계산 API 호출 (0.3초 딜레이)
    const timer = setTimeout(() => {
        fetchCalculatedDays();
    }, 300);

    return () => clearTimeout(timer);
  }, [data.startDate, data.endDate, data.vacationType, fetchCalculatedDays]);

  // =================================================================
  // 4. 핸들러 래퍼 (반차 로직 처리를 위해 감쌈)
  // =================================================================
  
  // 휴가 종류 변경 시
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    onChange(e); // 부모 상태 업데이트

    // 반차 계열이면 종료일을 시작일과 강제로 맞춤
    if (newType.includes('반차') && data.startDate) {
        // 강제로 endDate 변경 이벤트 발생시킴
        onChange({ target: { name: 'endDate', value: data.startDate } });
    }
  };

  // 시작일 변경 시
  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    onChange(e); // 부모 상태 업데이트

    // 반차 계열이면 종료일도 같이 변경
    if (data.vacationType && data.vacationType.includes('반차')) {
        onChange({ target: { name: 'endDate', value: newStart } });
    }
  };


  return (
    <div className="p-4 bg-white" style={{ fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif' }}>
      
      {/* 상단 테이블 */}
      <table style={{ border: "0px solid black", width: "800px", borderCollapse: "collapse", margin: "0 auto" }}>
        <colgroup>
          <col width="350" />
          <col width="450" />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={2} style={{ height: "70px", textAlign: "center", fontSize: "36px", fontWeight: "bold", padding: "10px", verticalAlign: "middle" }}>
              휴&nbsp;&nbsp;가&nbsp;&nbsp;신&nbsp;&nbsp;청&nbsp;&nbsp;서
            </td>
          </tr>
          
          <tr>
            <td style={{ verticalAlign: "top", padding: 0 }}>
              <table style={{ border: "1px solid black", width: "100%", borderCollapse: "collapse" }}>
                <colgroup>
                  <col width="100" />
                  <col />
                </colgroup>
                <tbody>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>기 안 일</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>{writeDate}</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>신 청 자</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>{loginMember?.empName}</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>부 서</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>{loginMember?.deptName}</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>문서번호</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>{data.docNo || '자동채번'}</td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* 결재선 */}
            <td style={{ verticalAlign: "bottom", paddingLeft: "10px", textAlign: "right" }}>
              <div style={{ display: "inline-flex", border: "1px solid black" }}>
                <div style={{ width: "20px", background: "#f3f3f3", borderRight: "1px solid black", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", padding: "5px" }}>
                   결<br/><br/>재
                </div>
                
                <div style={{ display: "flex" }}>
                  <div style={{ width: "80px", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                      <div style={{ background: "#f3f3f3", borderBottom: "1px solid black", textAlign: "center", padding: "2px", fontSize: "12px" }}>담당</div>
                      <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px" }}>{loginMember?.empName}</div>
                      <div style={{ borderTop: "1px solid black", fontSize: "11px", textAlign: "center", background: "#f9f9f9" }}>기안</div>
                  </div>

                  {displayLines.map((approver, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        width: "80px", 
                        borderRight: index === maxApprovers - 1 ? "none" : "1px solid black", 
                        display: "flex", 
                        flexDirection: "column" 
                      }}
                    >
                        <div style={{ background: "#f3f3f3", borderBottom: "1px solid black", textAlign: "center", padding: "2px", fontSize: "12px", height: "23px" }}>
                          {approver ? approver.rank : ''}
                        </div>
                        <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px" }}>
                          {approver ? approver.name : ''}
                        </div>
                        <div style={{ borderTop: "1px solid black", fontSize: "11px", textAlign: "center", background: "#f9f9f9", height: "17px" }}>
                           {approver && approver.appLineStatus === 'W' && '미결'}
                           {approver && approver.appLineStatus === 'C' && <span style={{color:'blue'}}>승인</span>}
                           {approver && approver.appLineStatus === 'R' && <span style={{color:'red'}}>반려</span>}
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 상세 내용 */}
      <table style={{ border: "2px solid black", width: "800px", borderCollapse: "collapse", marginTop: "20px", margin: "20px auto" }}>
        <colgroup>
          <col width="120" />
          <col width="680" />
        </colgroup>
        <tbody>
          <tr>
            <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>제 목</td>
            <td style={{ padding: "5px", border: "1px solid black" }}>
              <input 
                  type="text" 
                  name="approvalTitle" 
                  value={data.approvalTitle || ''} 
                  onChange={onChange} 
                  disabled={readOnly} 
                  style={{ width: "100%", border: "none", outline: "none", fontWeight: "bold" }} 
                  placeholder="제목을 입력하세요 (예: 연차 신청)" 
              />
            </td>
          </tr>

          <tr>
            <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>휴가 종류</td>
            <td style={{ padding: "5px", border: "1px solid black" }}>
              <select 
                  name="vacationType" 
                  value={data.vacationType || '연차'} 
                  onChange={handleTypeChange} 
                  disabled={readOnly} 
                  style={{ width: "100%", padding: "5px", border: "1px solid #ccc", borderRadius: "4px" }}
              >
                <option value="연차">연차</option>
                <option value="오전반차">오전반차</option>
                <option value="오후반차">오후반차</option>
                <option value="병가">병가</option>
                <option value="경조사">경조사</option>
                <option value="기타">기타</option>
              </select>
            </td>
          </tr>

          <tr>
            <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>기 간</td>
            <td style={{ padding: "5px", border: "1px solid black" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* 시작일 */}
                <input 
                    type="date" 
                    name="startDate" 
                    value={data.startDate || ''} 
                    onChange={handleStartDateChange} 
                    disabled={readOnly} 
                    style={{ padding: "3px", border: "1px solid #ccc" }} 
                />
                <span>~</span>
                {/* 종료일 */}
                <input 
                    type="date" 
                    name="endDate" 
                    value={data.endDate || ''} 
                    onChange={onChange} 
                    disabled={readOnly || (data.vacationType && data.vacationType.includes('반차'))}
                    style={{ 
                        padding: "3px", 
                        border: "1px solid #ccc",
                        backgroundColor: (data.vacationType && data.vacationType.includes('반차')) ? '#f3f3f3' : 'white'
                    }} 
                />
                
                {/* 🔥 계산된 일수 표시 */}
                {calculatedDays > 0 && (
                  <span style={{ marginLeft: "10px", fontSize: "14px", color: "blue", fontWeight: "bold" }}>
                    (총 {calculatedDays}일)
                  </span>
                )}
              </div>
            </td>
          </tr>

          <tr>
            <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>신청 사유</td>
            <td style={{ padding: "10px", border: "1px solid black", height: "300px", verticalAlign: "top" }}>
              <textarea 
                  name="approvalContent" 
                  value={data.approvalContent || ''} 
                  onChange={onChange} 
                  disabled={readOnly} 
                  style={{ width: "100%", height: "100%", border: "none", outline: "none", resize: "none" }} 
                  placeholder="휴가 사유를 입력하세요." 
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* 하단 안내 문구 */}
      <table style={{ width: "800px", margin: "10px auto", border: "1px solid black", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "15px", fontSize: "12px", color: "#555" }}>
              <strong>※ 해당 증빙을 첨부하세요.</strong><br/><br/>
              - 종류 : 연차, 오전반차, 오후반차, 병가, 경조사, 기타<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;교육/훈련/외출/조퇴 =&gt; 구체적 시간 기재
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ width: "800px", margin: "20px auto", textAlign: "center", fontSize: "16px", fontWeight: "bold" }}>
        위와 같이 신청하오니 재가하여 주시기 바랍니다.
      </div>

    </div>
  );
}