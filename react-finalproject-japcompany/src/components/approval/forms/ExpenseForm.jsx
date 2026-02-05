import React, { useState, useEffect } from 'react';

// props에 approvalLines 추가
export default function ExpenseForm({ data, onChange, approvalLines = [] }) {
  // 오늘 날짜
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
  });

  // 🔥 결재선 빈칸 채우기 로직
  const maxApprovers = 3;
  const displayLines = [...approvalLines];
  while (displayLines.length < maxApprovers) {
    displayLines.push(null);
  }

  // =========================================================================
  // 1. 동적 행 관리 (스크립트 로직 대체)
  // =========================================================================
  
  // 초기 행 데이터 (기본 1줄)
  const initialRow = { date: '', category: '물품구입비', usage: '', amount: 0, note: '', id: Date.now() };
  
  // 행 상태 관리
  const [rows, setRows] = useState([ { ...initialRow, id: Date.now() } ]);

  // 합계 계산 (rows가 바뀔 때마다 자동 계산)
  const totalAmount = rows.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);

  // 부모 데이터(formData)와 합계 금액 동기화
  useEffect(() => {
    // 부모 컴포넌트의 amount 필드에 합계값을 넣어줌
    onChange({ target: { name: 'amount', value: totalAmount } });
  }, [totalAmount]);

  // 행 추가
  const addRow = () => {
    setRows([...rows, { ...initialRow, id: Date.now() }]);
  };

  // 행 삭제 (마지막 행 삭제)
  const removeRow = () => {
    if (rows.length > 1) {
      setRows(rows.slice(0, -1));
    }
  };

  // 개별 행 데이터 변경 핸들러
  const handleRowChange = (id, field, value) => {
    const newRows = rows.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setRows(newRows);
  };

  // 금액 포맷팅 (콤마)
  const formatCurrency = (val) => {
    if (!val) return '';
    return new Intl.NumberFormat('ko-KR').format(val);
  };

  // =========================================================================
  // 2. UI 렌더링
  // =========================================================================
  return (
    <div className="p-4 bg-white" style={{ fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif' }}>
      
      {/* 1. 상단 타이틀 및 결재선 테이블 */}
      <table style={{ border: "0px solid black", width: "800px", borderCollapse: "collapse", margin: "0 auto" }}>
        <colgroup>
          <col width="310" />
          <col width="490" />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={2} style={{ height: "70px", textAlign: "center", fontSize: "36px", fontWeight: "bold", padding: "10px" }}>
              법인카드 지출결의서
            </td>
          </tr>
          <tr>
            {/* 왼쪽: 기본 정보 */}
            <td style={{ verticalAlign: "top", padding: 0 }}>
              <table style={{ border: "1px solid black", width: "100%", borderCollapse: "collapse" }}>
                <colgroup><col width="100" /><col /></colgroup>
                <tbody>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>기안자</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>김사원</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>소 속</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>개발팀</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>기안일</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>{today}</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>문서번호</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>자동채번</td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* 🔥 오른쪽: 결재선 (동적 렌더링 적용) */}
            <td style={{ textAlign: "right", verticalAlign: "bottom", paddingLeft: "10px" }}>
               <div style={{ display: "inline-flex", border: "1px solid black" }}>
                {/* 세로 '결재' */}
                <div style={{ width: "20px", background: "#f3f3f3", borderRight: "1px solid black", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", padding: "5px" }}>결<br/>재</div>
                
                <div style={{ display: "flex" }}>
                  {/* 기안자 (고정) */}
                  <div style={{ width: "80px", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                     <div style={styles.signHeader}>담당</div>
                     <div style={styles.signName}>김사원</div>
                     <div style={styles.signStatus}>기안</div>
                  </div>

                  {/* 결재자들 (동적) */}
                  {displayLines.map((approver, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        width: "80px", 
                        // 마지막 칸은 오른쪽 테두리 제거
                        borderRight: index === maxApprovers - 1 ? "none" : "1px solid black", 
                        display: "flex", 
                        flexDirection: "column" 
                      }}
                    >
                       <div style={styles.signHeader}>
                         {approver ? approver.rank : ''}
                       </div>
                       <div style={styles.signName}>
                         {approver ? approver.name : ''}
                       </div>
                       <div style={styles.signStatus}>
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

      {/* 2. 상세 입력 테이블 */}
      <table style={{ border: "2px solid black", width: "800px", borderCollapse: "collapse", marginTop: "20px", margin: "20px auto" }}>
        <colgroup>
          <col width="100" />
          <col />
          <col width="100" />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td style={styles.headerLabel}>제 목</td>
            <td colSpan={3} style={styles.inputCell}>
              <input type="text" name="title" value={data.title} onChange={onChange} style={styles.input} placeholder="제목을 입력하세요" />
            </td>
          </tr>
          <tr>
            <td style={styles.headerLabel}>작성일자</td>
            <td style={styles.inputCell}>
               <input type="date" name="expenseDate" value={data.expenseDate} onChange={onChange} style={styles.input} />
            </td>
            <td style={styles.headerLabel}>소 속</td>
            <td style={styles.inputCell}>개발팀</td>
          </tr>
          <tr>
            <td style={styles.headerLabel}>작 성 자</td>
            <td style={styles.inputCell}>김사원</td>
            <td style={styles.headerLabel}>금 액</td>
            <td style={{ ...styles.inputCell, textAlign: "right", fontWeight: "bold" }}>
               {/* 자동 계산된 합계 표시 */}
               {formatCurrency(totalAmount)} 원
            </td>
          </tr>
          <tr>
            <td style={{ ...styles.headerLabel, height: "60px" }}>지출사유</td>
            <td colSpan={3} style={styles.inputCell}>
              <textarea name="content" value={data.content} onChange={onChange} style={{ ...styles.input, height: "100%", resize: "none" }} placeholder="지출 사유를 입력하세요." />
            </td>
          </tr>
        </tbody>
      </table>

      {/* 3. 동적 지출 내역 테이블 */}
      <div style={{ width: "800px", margin: "0 auto" }}>
        {/* 버튼 영역 */}
        <div style={{ textAlign: "right", marginBottom: "5px" }}>
          <button onClick={addRow} style={styles.button}>+ 행 추가</button>
          <button onClick={removeRow} style={{ ...styles.button, marginLeft: "5px", backgroundColor: "#666" }}>- 삭제</button>
        </div>

        {/* 내역 테이블 */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black" }}>
          <colgroup>
            <col width="130" /><col width="120" /><col width="250" /><col width="130" /><col width="170" />
          </colgroup>
          <thead>
            <tr>
              <td style={styles.th}>일 자</td>
              <td style={styles.th}>분 류</td>
              <td style={styles.th}>사용 내역</td>
              <td style={styles.th}>금 액</td>
              <td style={styles.th}>비 고</td>
            </tr>
          </thead>
          <tbody>
            {/* 🔥 rows 배열을 순회하며 렌더링 */}
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={styles.td}>
                  <input type="date" value={row.date} onChange={(e) => handleRowChange(row.id, 'date', e.target.value)} style={styles.input} />
                </td>
                <td style={styles.td}>
                  <select value={row.category} onChange={(e) => handleRowChange(row.id, 'category', e.target.value)} style={styles.input}>
                    <option>물품구입비</option><option>식대</option><option>회식비</option><option>교통비</option><option>기타</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <input type="text" value={row.usage} onChange={(e) => handleRowChange(row.id, 'usage', e.target.value)} style={styles.input} />
                </td>
                <td style={styles.td}>
                  <input 
                    type="number" 
                    value={row.amount} 
                    onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)} 
                    style={{ ...styles.input, textAlign: "right" }} 
                    placeholder="0"
                  />
                </td>
                <td style={styles.td}>
                  <input type="text" value={row.note} onChange={(e) => handleRowChange(row.id, 'note', e.target.value)} style={styles.input} />
                </td>
              </tr>
            ))}
            
            {/* 합계 행 */}
            <tr>
              <td colSpan={3} style={{ ...styles.th, textAlign: "center" }}>합 계</td>
              <td style={{ ...styles.td, textAlign: "right", fontWeight: "bold", background: "#f9f9f9" }}>
                {formatCurrency(totalAmount)}
              </td>
              <td style={{ ...styles.td, background: "#f9f9f9" }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ width: "800px", margin: "10px auto", fontSize: "12px", fontWeight: "bold" }}>
        * 영수증 별도 제출
      </p>

    </div>
  );
}

// 스타일 객체 (CSS를 인라인으로 깔끔하게 관리)
const styles = {
  labelCell: { background: "#e2e2e2", padding: "5px", border: "1px solid black", textAlign: "center", fontWeight: "bold", fontSize: "12px" },
  valueCell: { padding: "5px", border: "1px solid black", fontSize: "12px" },
  headerLabel: { background: "#e2e2e2", padding: "5px", border: "1px solid black", textAlign: "center", fontWeight: "bold", fontSize: "12px" },
  inputCell: { padding: "5px", border: "1px solid black" },
  input: { width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "12px" },
  th: { background: "#ddd", border: "1px solid black", padding: "5px", textAlign: "center", fontWeight: "bold", fontSize: "12px" },
  td: { border: "1px solid black", padding: "5px", fontSize: "12px" },
  button: { padding: "3px 8px", background: "#333", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "11px" },
  
  // 🔥 결재선 전용 스타일 (추가됨)
  signHeader: { background: "#f3f3f3", borderBottom: "1px solid black", textAlign: "center", padding: "2px", fontSize: "12px", height: "23px" },
  signName: { height: "60px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px" },
  signStatus: { borderTop: "1px solid black", fontSize: "11px", textAlign: "center", background: "#f9f9f9", height: "17px" }
};