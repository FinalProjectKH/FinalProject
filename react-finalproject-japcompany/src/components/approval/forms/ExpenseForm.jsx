import React, { useState, useEffect } from 'react';

// 🔥 props에 loginMember, readOnly 추가
export default function ExpenseForm({ data, onChange, approvalLines = [], loginMember, readOnly }) {
  
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
  });

  // 🔥 기안일 로직 추가
  const writeDate = data.approvalDate || today;

  const maxApprovers = 3;
  const displayLines = [...approvalLines];
  while (displayLines.length < maxApprovers) {
    displayLines.push(null);
  }

  // 지출 내역 초기값 (상세조회 시 data.expenseDetailList가 있으면 그것 사용)
  const initialRow = { date: '', category: '물품구입비', usage: '', amount: 0, note: '', id: Date.now() };
  
  // 🔥 기존 데이터(data.expenseDetailList)가 있으면 그걸로 rows 초기화
  const [rows, setRows] = useState(() => {
     if (data.expenseDetailList && data.expenseDetailList.length > 0) {
        return data.expenseDetailList.map((item, idx) => ({
            id: Date.now() + idx,
            date: item.expenseDate ? item.expenseDate.substring(0, 10) : '', // YYYY-MM-DD 추출
            category: item.category,
            usage: item.usageDetail,
            amount: item.amount,
            note: item.note
        }));
     }
     return [ { ...initialRow, id: Date.now() } ];
  });

  const totalAmount = rows.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);

  useEffect(() => {
    // 🔥 readOnly일 때는 변경 이벤트 발생시키지 않음 (무한루프 방지 등)
    if (readOnly) return;

    onChange({ target: { name: 'totalAmount', value: totalAmount } });
    const formattedDetails = rows.map(row => ({
        expenseDate: row.date ? `${row.date}T00:00:00` : null,      
        category: row.category,     
        usageDetail: row.usage || '',     
        amount: Number(row.amount) || 0,        
        note: row.note || ''
    }));
    onChange({ target: { name: 'expenseDetailList', value: formattedDetails } });
  }, [rows, totalAmount]);

  const addRow = () => setRows([...rows, { ...initialRow, id: Date.now() }]);
  const removeRow = () => { if (rows.length > 1) setRows(rows.slice(0, -1)); };
  
  const handleRowChange = (id, field, value) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const formatCurrency = (val) => val ? new Intl.NumberFormat('ko-KR').format(val) : '';

  return (
    <div className="p-4 bg-white" style={{ fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif' }}>
      
      {/* 상단 타이틀 및 결재선 */}
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
            <td style={{ verticalAlign: "top", padding: 0 }}>
              <table style={{ border: "1px solid black", width: "100%", borderCollapse: "collapse" }}>
                <colgroup><col width="100" /><col /></colgroup>
                <tbody>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>기안자</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>{loginMember?.empName}</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>소 속</td>
                    <td style={{ padding: "5px", border: "1px solid black" }}>{loginMember?.deptName}</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>기안일</td>
                    {/* 🔥 기안일 수정 */}
                    <td style={{ padding: "5px", border: "1px solid black" }}>{writeDate}</td>
                  </tr>
                  <tr>
                    <td style={{ background: "#ddd", padding: "5px", border: "1px solid black", fontWeight: "bold", textAlign: "center" }}>문서번호</td>
                    {/* 🔥 문서번호 수정 */}
                    <td style={{ padding: "5px", border: "1px solid black" }}>{data.docNo || '자동채번'}</td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* 결재선 */}
            <td style={{ textAlign: "right", verticalAlign: "bottom", paddingLeft: "10px" }}>
               <div style={{ display: "inline-flex", border: "1px solid black" }}>
                <div style={{ width: "20px", background: "#f3f3f3", borderRight: "1px solid black", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", padding: "5px" }}>결<br/>재</div>
                
                <div style={{ display: "flex" }}>
                  <div style={{ width: "80px", borderRight: "1px solid black", display: "flex", flexDirection: "column" }}>
                      <div style={styles.signHeader}>담당</div>
                      <div style={styles.signName}>{loginMember?.empName}</div>
                      <div style={styles.signStatus}>기안</div>
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

      {/* 상세 입력 테이블 */}
      <table style={{ border: "2px solid black", width: "800px", borderCollapse: "collapse", marginTop: "20px", margin: "20px auto" }}>
        <colgroup><col width="100" /><col /><col width="100" /><col /></colgroup>
        <tbody>
          <tr>
            <td style={styles.headerLabel}>제 목</td>
            <td colSpan={3} style={styles.inputCell}>
              <input 
                  type="text" 
                  name="approvalTitle" 
                  value={data.approvalTitle || ''} 
                  onChange={onChange} 
                  disabled={readOnly} // 🔥 readOnly 적용
                  style={styles.input} 
                  placeholder="제목을 입력하세요" 
               />
            </td>
          </tr>
          <tr>
            <td style={styles.headerLabel}>소 속</td>
            <td style={styles.inputCell}>{loginMember?.deptName}</td>
            
            <td style={styles.headerLabel}>작 성 자</td>
            <td style={styles.inputCell}>{loginMember?.empName}</td>
          </tr>
          <tr>
            <td style={styles.headerLabel}>금 액</td>
            <td colSpan={3} style={{ ...styles.inputCell, textAlign: "right", fontWeight: "bold" }}>{formatCurrency(totalAmount)} 원</td>
          </tr>
          <tr>
            <td style={{ ...styles.headerLabel, height: "60px" }}>지출사유</td>
            <td colSpan={3} style={styles.inputCell}>
              <textarea 
                  name="approvalContent" 
                  value={data.approvalContent || ''} 
                  onChange={onChange} 
                  disabled={readOnly} // 🔥 readOnly 적용
                  style={{ ...styles.input, height: "100%", resize: "none" }} 
                  placeholder="지출 사유를 입력하세요." 
               />
            </td>
          </tr>
        </tbody>
      </table>

      {/* 동적 지출 내역 테이블 */}
      <div style={{ width: "800px", margin: "0 auto" }}>
        {/* 🔥 readOnly 아닐 때만 버튼 표시 */}
        {!readOnly && (
            <div style={{ textAlign: "right", marginBottom: "5px" }}>
              <button onClick={addRow} style={styles.button}>+ 행 추가</button>
              <button onClick={removeRow} style={{ ...styles.button, marginLeft: "5px", backgroundColor: "#666" }}>- 삭제</button>
            </div>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black" }}>
          <colgroup><col width="130" /><col width="120" /><col width="250" /><col width="130" /><col width="170" /></colgroup>
          <thead>
            <tr>
              <td style={styles.th}>일 자</td><td style={styles.th}>분 류</td><td style={styles.th}>사용 내역</td><td style={styles.th}>금 액</td><td style={styles.th}>비 고</td>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={styles.td}><input type="date" value={row.date} onChange={(e) => handleRowChange(row.id, 'date', e.target.value)} disabled={readOnly} style={styles.input} /></td>
                <td style={styles.td}>
                  <select value={row.category} onChange={(e) => handleRowChange(row.id, 'category', e.target.value)} disabled={readOnly} style={styles.input}>
                    <option>물품구입비</option><option>식대</option><option>회식비</option><option>교통비</option><option>기타</option>
                  </select>
                </td>
                <td style={styles.td}><input type="text" value={row.usage} onChange={(e) => handleRowChange(row.id, 'usage', e.target.value)} disabled={readOnly} style={styles.input} /></td>
                <td style={styles.td}><input type="number" value={row.amount} onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)} disabled={readOnly} style={{ ...styles.input, textAlign: "right" }} placeholder="0" /></td>
                <td style={styles.td}><input type="text" value={row.note} onChange={(e) => handleRowChange(row.id, 'note', e.target.value)} disabled={readOnly} style={styles.input} /></td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} style={{ ...styles.th, textAlign: "center" }}>합 계</td>
              <td style={{ ...styles.td, textAlign: "right", fontWeight: "bold", background: "#f9f9f9" }}>{formatCurrency(totalAmount)}</td>
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

const styles = {
  headerLabel: { background: "#e2e2e2", padding: "5px", border: "1px solid black", textAlign: "center", fontWeight: "bold", fontSize: "12px" },
  inputCell: { padding: "5px", border: "1px solid black" },
  input: { width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "12px" },
  th: { background: "#ddd", border: "1px solid black", padding: "5px", textAlign: "center", fontWeight: "bold", fontSize: "12px" },
  td: { border: "1px solid black", padding: "5px", fontSize: "12px" },
  button: { padding: "3px 8px", background: "#333", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "11px" },
  signHeader: { background: "#f3f3f3", borderBottom: "1px solid black", textAlign: "center", padding: "2px", fontSize: "12px", height: "23px" },
  signName: { height: "60px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px" },
  signStatus: { borderTop: "1px solid black", fontSize: "11px", textAlign: "center", background: "#f9f9f9", height: "17px" }
};