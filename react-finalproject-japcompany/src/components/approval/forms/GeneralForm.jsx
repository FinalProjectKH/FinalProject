import React from 'react';

// 🔥 props에 loginMember, readOnly 추가
export default function GeneralForm({ data, onChange, approvalLines = [], loginMember, readOnly }) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
  });

  // 🔥 기안일 로직: 데이터에 날짜가 있으면(상세조회) 그 날짜, 없으면(작성) 오늘 날짜
  const writeDate = data.approvalDate || today;

  const maxApprovers = 3;
  const displayLines = [...approvalLines];
  while (displayLines.length < maxApprovers) {
    displayLines.push(null);
  }

  return (
    <div className="p-4 bg-white" style={{ fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif' }}>
      <table style={{ border: "0px", width: "800px", borderCollapse: "collapse", margin: "0 auto" }}>
        <colgroup>
          <col width="310" /><col width="490" />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={2} style={{ height: "70px", textAlign: "center", fontSize: "36px", fontWeight: "bold", padding: "10px" }}>
              기&nbsp;&nbsp;안&nbsp;&nbsp;용&nbsp;&nbsp;지
            </td>
          </tr>
          <tr>
            <td style={{ verticalAlign: "top", padding: 0 }}>
              <table style={{ border: "1px solid black", width: "100%", borderCollapse: "collapse" }}>
                <colgroup><col width="100" /><col /></colgroup>
                <tbody>
                  {/* 🔥 문서번호: 데이터 있으면 표시, 없으면 자동채번 */}
                  <tr><td style={styles.label}>문서번호</td><td style={styles.value}>{data.docNo || '자동채번'}</td></tr>
                  <tr><td style={styles.label}>기안부서</td><td style={styles.value}>{loginMember?.deptName}</td></tr>
                  {/* 🔥 기안일: writeDate 변수 사용 */}
                  <tr><td style={styles.label}>기 안 일</td><td style={styles.value}>{writeDate}</td></tr>
                  <tr><td style={styles.label}>기 안 자</td><td style={styles.value}>{loginMember?.empName}</td></tr>
                  <tr><td style={styles.label}>보존연한</td><td style={styles.value}>5년</td></tr>
                </tbody>
              </table>
            </td>
            
            {/* 결재선 */}
            <td style={{ verticalAlign: "bottom", paddingLeft: "10px", textAlign: "right" }}>
              <div style={{ display: "inline-flex", border: "1px solid black" }}>
                <div style={{ width: "20px", background: "#f3f3f3", borderRight: "1px solid black", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", padding: "5px" }}>결<br/><br/>재</div>
                
                <div style={{ display: "flex" }}>
                  {/* 기안자 (고정) */}
                  <div style={{ width: "80px", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                      <div style={styles.signHeader}>담당</div>
                      <div style={styles.signName}>{loginMember?.empName}</div>
                      <div style={styles.signStatus}>기안</div>
                  </div>

                  {/* 결재자들 */}
                  {displayLines.map((approver, index) => (
                    <div key={index} style={{ width: "80px", borderRight: index === maxApprovers - 1 ? "none" : "1px solid black", display: "flex", flexDirection: "column" }}>
                       <div style={styles.signHeader}>{approver ? approver.rank : ''}</div>
                       <div style={styles.signName}>{approver ? approver.name : ''}</div>
                       <div style={styles.signStatus}>
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

      {/* 하단 입력 폼 */}
      <table style={{ border: "2px solid black", width: "800px", borderCollapse: "collapse", marginTop: "15px", margin: "15px auto" }}>
        <colgroup><col width="120" /><col width="680" /></colgroup>
        <tbody>
          <tr>
            <td style={styles.label}>제 목</td>
            <td style={styles.inputCell}>
              <input 
                type="text" 
                name="approvalTitle" 
                value={data.approvalTitle || ''} 
                onChange={onChange} 
                disabled={readOnly} /* 🔥 상세조회 시 수정 불가 */
                style={{...styles.input, fontWeight:'bold'}} 
                placeholder="제목을 입력하세요" 
              />
            </td>
          </tr>
          <tr><td style={styles.label} colSpan={2}>상&nbsp;&nbsp;세&nbsp;&nbsp;내&nbsp;&nbsp;용</td></tr>
          <tr>
            <td colSpan={2} style={{ padding: "15px", border: "1px solid black", height: "600px", verticalAlign: "top" }}>
              <textarea 
                name="approvalContent" 
                value={data.approvalContent || ''} 
                onChange={onChange} 
                disabled={readOnly} /* 🔥 상세조회 시 수정 불가 */
                style={{ width: "100%", height: "100%", border: "none", outline: "none", resize: "none" }} 
                placeholder="내용을 입력하세요." 
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  label: { background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" },
  value: { padding: "5px", border: "1px solid black" },
  inputCell: { padding: "5px", border: "1px solid black" },
  input: { width: "100%", border: "none", outline: "none" },
  signHeader: { background: "#f3f3f3", borderBottom: "1px solid black", textAlign: "center", padding: "2px", fontSize: "12px", height: "20px" },
  signName: { height: "60px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px" },
  signStatus: { borderTop: "1px solid black", fontSize: "11px", textAlign: "center", background: "#f9f9f9", height: "18px" }
};