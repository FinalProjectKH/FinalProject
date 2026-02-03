import React from 'react';

export default function GeneralForm({ data, onChange }) {
  // 오늘 날짜 포맷
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
  });

  return (
    <div className="p-4 bg-white" style={{ fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif' }}>
      
      {/* ================= 1. 상단 테이블 (기안용지 헤더 + 결재선) ================= */}
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
          {/* 헤더: 기안용지 */}
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
              기&nbsp;&nbsp;안&nbsp;&nbsp;용&nbsp;&nbsp;지
            </td>
          </tr>
          
          {/* 본문: 왼쪽(문서정보) / 오른쪽(결재선) */}
          <tr>
            {/* 왼쪽: 문서 정보 테이블 */}
            <td style={{ verticalAlign: "top", padding: 0 }}>
              <table style={{ border: "1px solid black", width: "100%", borderCollapse: "collapse" }}>
                <colgroup>
                  <col width="100" />
                  <col />
                </colgroup>
                <tbody>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>문서번호</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>자동채번</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>기안부서</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>개발팀</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>기 안 일</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>{today}</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>기 안 자</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>김사원</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>보존연한</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>5년</td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* 오른쪽: 결재선 (여기에 우리가 만든 결재선 UI를 넣습니다!) */}
            <td style={{ verticalAlign: "bottom", paddingLeft: "10px", textAlign: "right" }}>
              <div style={{ display: "inline-flex", border: "1px solid black" }}>
                {/* 세로 텍스트: 결재 */}
                <div style={{ width: "20px", background: "#f3f3f3", borderRight: "1px solid black", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", padding: "5px" }}>
                   결<br/><br/>재
                </div>
                
                {/* 결재칸들 */}
                <div style={{ display: "flex" }}>
                  {/* 담당 */}
                  <div style={{ width: "80px", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                     <div style={{ background: "#f3f3f3", borderBottom: "1px solid black", textAlign: "center", padding: "2px" }}>담당</div>
                     <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>김사원</div>
                     <div style={{ borderTop: "1px solid black", fontSize: "11px", textAlign: "center", background: "#f9f9f9" }}>상신</div>
                  </div>
                  {/* 팀장 */}
                  <div style={{ width: "80px", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                     <div style={{ background: "#f3f3f3", borderBottom: "1px solid black", textAlign: "center", padding: "2px" }}>팀장</div>
                     <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}></div>
                     <div style={{ borderTop: "1px solid black", fontSize: "11px", textAlign: "center", background: "#f9f9f9" }}></div>
                  </div>
                  {/* 부장 */}
                  <div style={{ width: "80px", display: "flex", flexDirection: "column" }}>
                     <div style={{ background: "#f3f3f3", borderBottom: "1px solid black", textAlign: "center", padding: "2px" }}>부장</div>
                     <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}></div>
                     <div style={{ borderTop: "1px solid black", fontSize: "11px", textAlign: "center", background: "#f9f9f9" }}></div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= 2. 하단 테이블 (참조, 제목, 내용) ================= */}
      <table 
        style={{ 
          border: "2px solid black", 
          width: "800px", 
          borderCollapse: "collapse",
          marginTop: "15px",
          margin: "15px auto" 
        }}
      >
        <colgroup>
          <col width="120" />
          <col width="680" />
        </colgroup>
        <tbody>
          <tr>
            <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>
              참&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;조
            </td>
            <td style={{ padding: "5px", border: "1px solid black" }}>
              <input 
                type="text" 
                style={{ width: "100%", border: "none", outline: "none" }} 
                placeholder="참조자를 입력하세요"
              />
            </td>
          </tr>
          <tr>
            <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>
              제&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;목
            </td>
            <td style={{ padding: "5px", border: "1px solid black" }}>
              {/* 🔥 React 입력 연결 */}
              <input 
                type="text" 
                name="title"
                value={data.title}
                onChange={onChange}
                style={{ width: "100%", border: "none", outline: "none", fontWeight: "bold" }} 
                placeholder="제목을 입력하세요"
              />
            </td>
          </tr>
          <tr>
            <td 
              style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}
              colSpan={2}
            >
              상&nbsp;&nbsp;세&nbsp;&nbsp;내&nbsp;&nbsp;용
            </td>
          </tr>
          <tr>
            <td 
              colSpan={2}
              style={{ padding: "15px", border: "1px solid black", height: "400px", verticalAlign: "top" }}
            >
              {/* 🔥 React Textarea 연결 */}
              <textarea 
                name="content"
                value={data.content}
                onChange={onChange}
                style={{ width: "100%", height: "100%", border: "none", outline: "none", resize: "none", fontSize: "14px", lineHeight: "1.6" }}
                placeholder="내용을 입력하세요."
              />
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  );
}