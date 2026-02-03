import React from 'react';

// props에 approvalLines 추가
export default function VacationForm({ data, onChange, approvalLines = [] }) {
  // 오늘 날짜 포맷
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
  });

  // 🔥 결재선 빈칸 채우기 로직 (최대 3명 결재로 가정)
  const maxApprovers = 3;
  const displayLines = [...approvalLines];
  while (displayLines.length < maxApprovers) {
    displayLines.push(null); // 빈 자리는 null로 채움
  }

  return (
    <div className="p-4 bg-white" style={{ fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif' }}>
      
      {/* ================= 1. 상단 테이블 (헤더 + 결재선) ================= */}
      <table 
        style={{ 
          border: "0px solid black", 
          width: "800px", 
          borderCollapse: "collapse",
          margin: "0 auto" 
        }}
      >
        <colgroup>
          <col width="350" />
          <col width="450" />
        </colgroup>
        <tbody>
          {/* 헤더 */}
          <tr>
            <td 
              colSpan={2}
              style={{
                height: "70px",
                textAlign: "center",
                fontSize: "36px",
                fontWeight: "bold",
                padding: "10px",
                verticalAlign: "middle"
              }}
            >
              휴&nbsp;&nbsp;가&nbsp;&nbsp;신&nbsp;&nbsp;청&nbsp;&nbsp;서
            </td>
          </tr>
          
          {/* 상단 정보 + 결재선 */}
          <tr>
            {/* 왼쪽: 문서 정보 */}
            <td style={{ verticalAlign: "top", padding: 0 }}>
              <table style={{ border: "1px solid black", width: "100%", borderCollapse: "collapse" }}>
                <colgroup>
                  <col width="100" />
                  <col />
                </colgroup>
                <tbody>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>기 안 일</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>{today}</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>신 청 자</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>김사원</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>부 서</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>개발팀</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>문서번호</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>자동채번</td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* 🔥 오른쪽: 결재선 (동적 렌더링 적용) */}
            <td style={{ verticalAlign: "bottom", paddingLeft: "10px", textAlign: "right" }}>
              <div style={{ display: "inline-flex", border: "1px solid black" }}>
                {/* 1. 세로 '결재' 텍스트 */}
                <div style={{ width: "20px", background: "#f3f3f3", borderRight: "1px solid black", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", padding: "5px" }}>
                   결<br/><br/>재
                </div>
                
                <div style={{ display: "flex" }}>
                  {/* 2. 기안자 칸 (고정) */}
                  <div style={{ width: "80px", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                     <div style={{ background: "#f3f3f3", borderBottom: "1px solid black", textAlign: "center", padding: "2px", fontSize: "12px" }}>담당</div>
                     <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px" }}>김사원</div>
                     <div style={{ borderTop: "1px solid black", fontSize: "11px", textAlign: "center", background: "#f9f9f9" }}>상신</div>
                  </div>

                  {/* 3. 결재자 칸들 (동적) */}
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
                         {approver ? '미결' : ''}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= 2. 상세 내용 테이블 (신청내용) ================= */}
      <table 
        style={{ 
          border: "2px solid black", 
          width: "800px", 
          borderCollapse: "collapse",
          marginTop: "20px",
          margin: "20px auto" 
        }}
      >
        <colgroup>
          <col width="120" />
          <col width="680" />
        </colgroup>
        <tbody>
          {/* 제목 */}
          <tr>
            <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>제 목</td>
            <td style={{ padding: "5px", border: "1px solid black" }}>
              <input 
                type="text" 
                name="title"
                value={data.title}
                onChange={onChange}
                style={{ width: "100%", border: "none", outline: "none", fontWeight: "bold" }} 
                placeholder="제목을 입력하세요 (예: 연차 신청)"
              />
            </td>
          </tr>

          {/* 휴가 종류 (Select) */}
          <tr>
            <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>휴가 종류</td>
            <td style={{ padding: "5px", border: "1px solid black" }}>
              <select 
                name="vacationType" 
                value={data.vacationType} 
                onChange={onChange}
                style={{ width: "100%", padding: "5px", border: "1px solid #ccc", borderRadius: "4px" }}
              >
                <option value="연차">연차</option>
                <option value="오전반차">오전 반차</option>
                <option value="오후반차">오후 반차</option>
                <option value="병가">병가</option>
                <option value="경조사">경조사</option>
                <option value="기타">기타</option>
              </select>
            </td>
          </tr>

          {/* 기간 (Date Input) */}
          <tr>
            <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>기 간</td>
            <td style={{ padding: "5px", border: "1px solid black" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input 
                  type="date" 
                  name="startDate"
                  value={data.startDate}
                  onChange={onChange}
                  style={{ padding: "3px", border: "1px solid #ccc" }}
                />
                <span>~</span>
                <input 
                  type="date" 
                  name="endDate"
                  value={data.endDate}
                  onChange={onChange}
                  style={{ padding: "3px", border: "1px solid #ccc" }}
                />
              </div>
            </td>
          </tr>

          {/* 사유 (Textarea) */}
          <tr>
            <td 
              style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}
            >
              신청 사유
            </td>
            <td style={{ padding: "10px", border: "1px solid black", height: "300px", verticalAlign: "top" }}>
              <textarea 
                name="content"
                value={data.content}
                onChange={onChange}
                style={{ width: "100%", height: "100%", border: "none", outline: "none", resize: "none" }}
                placeholder="휴가 사유를 입력하세요."
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= 3. 하단 안내 문구 (그대로 유지) ================= */}
      <table style={{ width: "800px", margin: "10px auto", border: "1px solid black", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "15px", fontSize: "12px", color: "#555" }}>
              <strong>※ 해당 증빙을 첨부하세요.</strong><br/><br/>
              - 종류 : 연차, 반차, 보건, 경조, 교육, 훈련, 외출, 조퇴, 기타<br/>
              - 시간 : 연차/보건/경조 =&gt; "전일"<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;반차 =&gt; "오전", "오후"<br/>
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