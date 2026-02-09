// src/components/modal/admin/HrEmployeeModal.jsx
// ✅ 추가: 검색 결과 리스트(스크롤/하이라이트/퇴사자 포함 토글) UI까지 완성본
// - 상단: 검색창 + (퇴사자 포함 토글) + 검색 버튼
// - 결과: 좌측 리스트(스크롤, 선택 하이라이트, 퇴사 배지, 키워드 하이라이트)
// - 우측: 증명사진 + 전체 조회(읽기 전용)
// - 하단: 사원 추가(이름/아이디/부서명/직급명) + 관리자 비번 확인 + 임시비번 1회 표시

import { useMemo, useState } from "react";
import DraggableModal from "../DraggableModal";
import {
  Save,
  KeyRound,
  Copy,
  Check,
  UserPlus,
  Search as SearchIcon,
} from "lucide-react";
import { axiosApi } from "../../../api/axiosAPI"; 
import { createPortal } from "react-dom";


const userDefaultImg = "/image/user.png";

const API = {
  CREATE_EMPLOYEE: "/admin/employee",
  SEARCH_EMPLOYEES: "/admin/employee/search",
  GET_EMPLOYEE: "/admin/getEmployee",
  VERIFY_ADMIN_PW: "/admin/verify-password",
};

const ID_HINT =
  "권장: 이름(영문/초성)+생년(4자리) 또는 임의 숫자 조합 (예: psh1997, hong0412)민감정보(주민번호 등)는 금지.";

const getModalRoot = () => {
  if (typeof document === "undefined") return null;
  return document.getElementById("modal-root");
}

export default function HrEmployeeModal({ open, onClose }) {
  const [adminPwErr, setAdminPwErr] = useState("");
  /* ===== 검색/조회 ===== */
  const [keyword, setKeyword] = useState("");
  const [includeResigned, setIncludeResigned] = useState(false);

  const [results, setResults] = useState([]); // 리스트용 (간단 필드)
  // 결과 예시: { empNo, empName, empId, deptName, positionName, empDelFl, profileImg }
  const [selectedEmpNo, setSelectedEmpNo] = useState(null);

  const selected = useMemo(() => {
    return results.find((r) => r.empNo === selectedEmpNo) ?? null;
  }, [results, selectedEmpNo]);

  /* ===== 추가(하단 폼) ===== */
  const [form, setForm] = useState({
    empName: "",
    empId: "",
    deptName: "",
    positionName: "",
  });

  const [msg, setMsg] = useState({ type: "", text: "" });

  /* ===== 관리자 비번 확인 모달 ===== */
  const [adminPwOpen, setAdminPwOpen] = useState(false);
  const [adminPw, setAdminPw] = useState("");

  /* ===== 발급 결과(임시 비번 1회 표시) ===== */
  const [issued, setIssued] = useState(null); // { empNo, empId, tempPw }
  const [issuedOpen, setIssuedOpen] = useState(false);

  const isValid = useMemo(() => {
    return (
      form.empName.trim().length > 0 &&
      form.empId.trim().length > 0 &&
      form.deptName.trim().length > 0 &&
      form.positionName.trim().length > 0
    );
  }, [form]);

  const validate = () => {
    if (!form.empName.trim()) return "이름은 필수입니다.";

    const id = form.empId.trim();
    if (!id) return "아이디는 필수입니다.";
    if (id.length < 6 || id.length > 20) return "아이디는 6~20자여야 합니다.";
    if (!/^[a-zA-Z0-9._-]+$/.test(id)) return "아이디는 영문/숫자/._- 만 허용됩니다.";

    if (!form.deptName.trim()) return "부서는 필수입니다.";
    if (!form.positionName.trim()) return "직급은 필수입니다.";

    return "";
  };

  const resetCreateForm = () => {
    setMsg({ type: "", text: "" });
    setForm({ empName: "", empId: "", deptName: "", positionName: "" });
    setAdminPw("");
    setAdminPwOpen(false);
  };

  /* ===== 검색 실행(UI 완성: 지금은 더미 데이터) ===== */
  const onSearch = async () => {
    setMsg({ type: "", text: "" });

    const q = keyword.trim();
    if (!q) {
      setResults([]);
      setSelectedEmpNo(null);
      setMsg({ type: "info", text: "검색어를 입력하세요." });
      return;
    }

    // ✅ 실제 연결:
    // const res = await axiosApi.get(API.SEARCH_EMPLOYEES, { params: { keyword: q, includeResigned } });
    // const list = Array.isArray(res.data) ? res.data : [];
    // setResults(list);
    // setSelectedEmpNo(list[0]?.empNo ?? null);

    // ✅ 더미 결과 (UI 확인용)
    const demo = [
      {
        empNo: "00001",
        empName: "홍길동",
        empId: "hong0412",
        deptName: "인사부",
        positionName: "대리",
        empEmail: "hong@company.com",
        empPhone: "010-0000-0000",
        enrollDate: "2026-01-15",
        empDelFl: "N",
        profileImg: null,
      },
      {
        empNo: "00002",
        empName: "김영희",
        empId: "younghee1996",
        deptName: "재무부",
        positionName: "과장",
        empEmail: "yh@company.com",
        empPhone: "010-1111-2222",
        enrollDate: "2025-11-02",
        empDelFl: "N",
        profileImg: null,
      },
      {
        empNo: "00003",
        empName: "박철수",
        empId: "chulsoo97",
        deptName: "영업부",
        positionName: "사원",
        empEmail: "cs@company.com",
        empPhone: "010-3333-4444",
        enrollDate: "2024-06-10",
        empDelFl: "Y", // 퇴사
        profileImg: null,
      },
    ];

    const filtered = demo.filter((e) => {
      const hit =
        e.empName.includes(q) ||
        e.empId.toLowerCase().includes(q.toLowerCase()) ||
        e.empNo.includes(q) ||
        e.deptName.includes(q) ||
        e.positionName.includes(q);
      if (!hit) return false;
      if (!includeResigned && e.empDelFl === "Y") return false;
      return true;
    });

    setResults(filtered);
    setSelectedEmpNo(filtered[0]?.empNo ?? null);

    if (filtered.length === 0) {
      setMsg({ type: "info", text: "검색 결과가 없습니다." });
    }
  };

  const onSelectClear = () => setSelectedEmpNo(null);

  /* ===== 추가 버튼 ===== */
  const onClickCreate = () => {
    console.log("onClickCreate fired"); 
    setMsg({ type: "", text: "" });
    const err = validate();
    console.log("validate err:", err); 
    if (err) return setMsg({ type: "error", text: err });
    setAdminPwOpen(true);
    console.log("adminPwOpen -> true (after set)");
  };

  const submitWithAdminPw = async () => {
    if (!adminPw) return;

    if (!window.confirm("사원을 추가하시겠습니까?")) return;

    try {
      setMsg({ type: "", text: "" });
      await axiosApi.post(API.VERIFY_ADMIN_PW, { adminPw });

      const payload = {
        empName: form.empName.trim(),
        empId: form.empId.trim(),
        deptName: form.deptName.trim(),
        positionName: form.positionName.trim(),
      }
    //   const res = await axiosApi.post(API.CREATE_EMPLOYEE, payload);

      /*
     API 
     CREATE_EMPLOYEE: "/admin/employee",
     SEARCH_EMPLOYEES: "/admin/employee/search",
     GET_EMPLOYEE: "/admin/getEmployee",
     VERIFY_ADMIN_PW: "/admin/verify-password",
      */ 

    //   setIssued(res.data);
    //   setIssuedOpen(true);

      setAdminPwOpen(false);
      setAdminPw("");
    //   setForm({ empName: "", empId: "", deptName: "", positionName: "" });

      setMsg({ type: "success", text: "사원이 추가되었습니다. 임시 비밀번호를 확인하세요." });
    } catch (e) {
    
      const status = e?.response?.status;

      if (status === 401) {
        setAdminPwErr("관리자 비밀번호가 일치하지 않습니다.");
      } else if (status === 403) {
        setAdminPwErr("관리자 권한이 없습니다." );
      } else if (status === 400) {
        setAdminPwErr("요청 값이 올바르지 않습니다.");
      } else {
        setAdminPwErr("요청 처리 중 오류가 발생했습니다." );
      }

      console.error(e);
      
    }
  };

  const hasResults = results.length > 0;

  return (
    <>
      <DraggableModal open={open} onClose={onClose} title="인사관리" width={980} height={720}>
        <div className="space-y-5">
          {/* ===== 상단: 검색/조회 ===== */}
          <section className="rounded-2xl border border-white/20 bg-white/15 p-5">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-3 py-2">
                <SearchIcon size={16} className="text-black/45" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSearch();
                  }}
                  placeholder="직원 검색 (이름/아이디/사번/부서/직급)"
                  className="w-full bg-transparent outline-none text-sm text-black/80 placeholder:text-black/40"
                />
              </div>

              <Toggle
                checked={includeResigned}
                onChange={setIncludeResigned}
                label="퇴사자 포함"
              />

              <button
                type="button"
                onClick={onSearch}
                className="text-xs px-3 py-2 rounded-xl bg-black/80 text-white hover:bg-black transition"
              >
                검색
              </button>

              {selectedEmpNo && (
                <button
                  type="button"
                  onClick={onSelectClear}
                  className="text-xs px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10 transition"
                >
                  선택 해제
                </button>
              )}
            </div>

            {msg.text && (
              <div
                className={`
                  mt-4 text-xs px-3 py-2 rounded-xl border
                  ${msg.type === "success" ? "bg-emerald-50/60 border-emerald-200/60 text-emerald-700" : ""}
                  ${msg.type === "error" ? "bg-rose-50/60 border-rose-200/60 text-rose-700" : ""}
                  ${msg.type === "info" ? "bg-slate-50/60 border-slate-200/60 text-slate-700" : ""}
                `}
              >
                {msg.text}
              </div>
            )}

            {/* 2열 레이아웃: 좌(리스트) / 우(증명사진+조회) */}
            <div className="mt-5 grid grid-cols-[360px_1fr] gap-4">
              {/* LEFT: 검색 결과 리스트 */}
              <div className="rounded-2xl border border-white/20 bg-white/12 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-black/70">검색 결과</div>
                  <div className="text-[11px] text-black/45">
                    {hasResults ? `${results.length}명` : "0명"}
                  </div>
                </div>

                <div className="mt-3 h-[260px] overflow-auto pr-1">
                  {!hasResults ? (
                    <div className="text-sm text-black/50">검색 결과가 없습니다.</div>
                  ) : (
                    <div className="space-y-2">
                      {results.map((emp) => {
                        const active = emp.empNo === selectedEmpNo;
                        return (
                          <button
                            key={emp.empNo}
                            type="button"
                            onClick={() => setSelectedEmpNo(emp.empNo)}
                            className={`
                              w-full text-left rounded-2xl border px-3 py-2 transition
                              ${active ? "border-black/20 bg-white/25" : "border-white/15 bg-white/10 hover:bg-white/18"}
                            `}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-[13px] font-semibold text-black/85 truncate">
                                  {highlightText(emp.empName, keyword)}
                                </div>
                                <div className="mt-0.5 text-[11px] text-black/55 truncate">
                                  {highlightText(emp.empId, keyword)} · {emp.empNo}
                                </div>
                                <div className="mt-1 text-[11px] text-black/55 truncate">
                                  {highlightText(emp.positionName, keyword)} · {highlightText(emp.deptName, keyword)}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                {emp.empDelFl === "Y" && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50/70 border border-rose-200/60 text-rose-700">
                                    퇴사
                                  </span>
                                )}
                                {active && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/80 text-white">
                                    선택됨
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-3 text-[11px] text-black/45">
                  * 목록을 클릭하면 우측 “전체 조회”가 갱신됩니다.
                </div>
              </div>

              {/* RIGHT: 증명사진 + 전체 조회 */}
              <div className="rounded-2xl border border-white/20 bg-white/12 p-4">
                <div className="grid grid-cols-[170px_1fr] gap-4">
                  {/* 증명사진 */}
                  <div>
                    <div className="text-[12px] font-semibold text-black/70 mb-2">직원 증명사진</div>
                    <div className="w-full aspect-square rounded-2xl bg-black/10 overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                      <img
                        src={selected?.profileImg || userDefaultImg}
                        className="w-full h-full object-cover"
                        alt="profile"
                      />
                    </div>

                    <div className="mt-3 text-sm font-semibold text-black/85">
                      {selected?.empName ?? "선택된 직원 없음"}
                    </div>
                    <div className="mt-1 text-xs text-black/50">
                      {selected ? `${selected.positionName ?? "-"} · ${selected.deptName ?? "-"}` : "좌측에서 선택"}
                    </div>
                  </div>

                  {/* 전체 조회란 */}
                  <div>
                    <div className="text-[12px] font-semibold text-black/70 mb-3">전체 조회</div>
                    {!selected ? (
                      <div className="text-sm text-black/50">좌측에서 직원을 선택하면 정보가 표시됩니다.</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="사번" value={selected.empNo} />
                        <Field label="아이디" value={selected.empId} />
                        <Field label="이메일" value={selected.empEmail ?? "-"} />
                        <Field label="전화번호" value={selected.empPhone ?? "-"} />
                        <Field label="부서" value={selected.deptName ?? "-"} />
                        <Field label="직급" value={selected.positionName ?? "-"} />
                        <Field label="입사일" value={selected.enrollDate ?? "-"} />
                        <Field label="재직상태" value={selected.empDelFl === "Y" ? "퇴사" : "재직"} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== 하단: 사원 추가(단일 섹션) ===== */}
          <section className="rounded-2xl border border-white/20 bg-white/12 p-5">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-black/75 flex items-center gap-2">
                <UserPlus size={16} className="text-black/60" />
                사원 추가
              </div>
              <div className="text-[11px] text-black/45">* 비밀번호는 서버에서 임시 발급</div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input
                label="이름*"
                value={form.empName}
                onChange={(v) => setForm((p) => ({ ...p, empName: v }))}
                placeholder="홍길동"
              />

              <Input
                label="아이디*"
                value={form.empId}
                onChange={(v) => setForm((p) => ({ ...p, empId: v }))}
                placeholder="psh1997"
              />

              <Input
                label="부서(이름)*"
                value={form.deptName}
                onChange={(v) => setForm((p) => ({ ...p, deptName: v }))}
                placeholder="인사부"
              />

              <Input
                label="직급(이름)*"
                value={form.positionName}
                onChange={(v) => setForm((p) => ({ ...p, positionName: v }))}
                placeholder="대리"
              />

              {/* <div className="col-span-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2"> */}
              <div>
                {/* <div className="text-[11px] text-black/45">아이디 추천</div> */}
                <div className="mt-1 text-[12px] text-black/30 leading-relaxed">{ID_HINT}</div>
              </div>

              <div className="col-span-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                <div className="text-[11px] text-black/45">비밀번호</div>
                <div className="mt-1 text-[13px] text-black/75 flex items-center gap-2">
                  <KeyRound size={14} className="text-black/20" />
                  서버 자동 생성(임시 비밀번호)
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={resetCreateForm}
                className="text-xs px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10 transition"
              >
                초기화
              </button>

              <button
                type="button"
                onClick={onClickCreate}
                disabled={!isValid}
                className={`
                  text-xs px-3 py-2 rounded-xl
                  bg-black/80 text-white hover:bg-black transition
                  flex items-center gap-2
                  ${!isValid ? "opacity-60 cursor-not-allowed" : ""}
                `}
              >
                <Save size={14} /> 추가
              </button>
            </div>
          </section>
        </div>
      </DraggableModal>

      {/* 관리자 비밀번호 확인 모달 */}
      <AdminPwConfirmModal
        open={adminPwOpen}
        onClose={() => {
          setAdminPwOpen(false);
          setAdminPw("");
          setAdminPwErr("");
        }}
        adminPw={adminPw}
        setAdminPw={(v) => {
        setAdminPw(v);
        setAdminPwErr(""); // ✅ 입력 바뀌면 에러 지움(추천)
        }}
        onConfirm={submitWithAdminPw}
        errorText={adminPwErr} 
      />

      {/* 발급 결과 모달(1회 표시) */}
      <IssuedCredentialModal
        open={issuedOpen}
        onClose={() => {
          setIssuedOpen(false);
          setIssued((p) => (p ? { ...p, tempPw: "" } : p));
        }}
        issued={issued}
      />
    </>
  );
}

/* ---------------- Sub Modals ---------------- */

function AdminPwConfirmModal({ open, onClose, adminPw, setAdminPw, onConfirm, errorText  }) {
  const can = adminPw.length >= 1;
  if (!open) return null;

  // ✅ 안전 가드: body가 없으면 렌더하지 않음
  if (typeof document === "undefined") return null;
  const root = document.getElementById("modal-root") || document.body;
  if (!root) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/30">
      <div className="w-[420px] rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl p-4">
        <div className="text-[14px] font-semibold text-black/85">관리자 비밀번호 확인</div>
        <div className="mt-2 text-xs text-black/60">
          * 사원 추가는 관리자 권한이 필요합니다. 비밀번호를 입력해 주세요.
        </div>

        <div className="mt-4">
          <Input
            label="관리자 비밀번호"
            type="password"
            value={adminPw}
            onChange={setAdminPw}
            placeholder="********"
          />

          {errorText && (
          <div className="mt-3 text-xs px-3 py-2 rounded-xl border bg-rose-50/60 border-rose-200/60 text-rose-700">
          {errorText}
          </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10 transition"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!can}
            onClick={onConfirm}
            className={`
              text-xs px-3 py-2 rounded-xl
              bg-black/80 text-white hover:bg-black transition
              ${!can ? "opacity-60 cursor-not-allowed" : ""}
            `}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
          root
  );
}

function IssuedCredentialModal({ open, onClose, issued }) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  if (typeof document === "undefined") return null;
  const root = document.getElementById("modal-root") || document.body;
  if (!root) return null;

  const empId = issued?.empId ?? "-";
  const tempPw = issued?.tempPw ?? "-";
  const empNo = issued?.empNo ?? "-";

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`ID: ${empId}\nTEMP PW: ${tempPw}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error(e);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/35">
      <div className="w-[460px] rounded-2xl bg-white/75 backdrop-blur-xl border border-white/30 shadow-xl p-5">
        <div>
          <div className="text-[15px] font-semibold text-black/85">계정 발급 완료</div>
          <div className="mt-1 text-xs text-black/55">
            * 임시 비밀번호는 <b>이 창에서만 1회 표시</b>됩니다. 안전하게 전달 후 닫아주세요.
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="사번" value={empNo} />
          <Field label="아이디" value={empId} />
          <div className="col-span-2">
            <Field label="임시 비밀번호" value={tempPw} highlight />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={onCopy}
            className="text-xs px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10 transition flex items-center gap-2"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "복사됨" : "복사"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-2 rounded-xl bg-black/80 text-white hover:bg-black transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    root
  );
}

/* ---------------- UI atoms ---------------- */

function Input({ label, value, onChange, disabled = false, placeholder = "", type = "text" }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
      <div className="text-[11px] text-black/45">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          mt-1 w-full bg-transparent outline-none text-[13px]
          ${disabled ? "text-black/55" : "text-black/85"}
          placeholder:text-black/30
        `}
      />
    </div>
  );
}

function Field({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        highlight ? "border-amber-200/70 bg-amber-50/50" : "border-white/15 bg-white/10"
      }`}
    >
      <div className="text-[11px] text-black/45">{label}</div>
      <div className="mt-0.5 text-[13px] text-black/85 break-words">{String(value ?? "-")}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className="px-3 py-2 rounded-xl bg-white/20 border border-white/20 hover:bg-white/30 transition flex items-center gap-2"
      aria-pressed={checked}
      title={label}
    >
      <span
        className={`
          w-9 h-5 rounded-full border transition relative
          ${checked ? "bg-black/80 border-black/20" : "bg-white/30 border-white/30"}
        `}
      >
        <span
          className={`
            absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition
            ${checked ? "left-4 bg-white" : "left-0.5 bg-black/40"}
          `}
        />
      </span>
      <span className="text-xs text-black/70">{label}</span>
    </button>
  );
}

/* ---------------- helpers ---------------- */

// 임시 비번: 영문 대/소 + 숫자(1~9) 6자리
function makeTempPw(len = 6) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const nums = "123456789";
  const chars = upper + lower + nums;
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/** 키워드 하이라이트: 문자열에 keyword 포함 부분만 강조 */
function highlightText(text, keyword) {
  const t = String(text ?? "");
  const k = String(keyword ?? "").trim();
  if (!k) return t;

  const idx = t.toLowerCase().indexOf(k.toLowerCase());
  if (idx === -1) return t;

  const before = t.slice(0, idx);
  const mid = t.slice(idx, idx + k.length);
  const after = t.slice(idx + k.length);

  return (
    <>
      {before}
      <mark className="bg-amber-200/70 rounded px-0.5">{mid}</mark>
      {after}
    </>
  );
}
