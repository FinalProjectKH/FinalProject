// src/components/modal/admin/HrEmployeeModal.jsx
// ✅ 추가: 검색 결과 리스트(스크롤/하이라이트/퇴사자 포함 토글) UI까지 완성본
// - 상단: 검색창 + (퇴사자 포함 토글) + 검색 버튼
// - 결과: 좌측 리스트(스크롤, 선택 하이라이트, 퇴사 배지, 키워드 하이라이트)
// - 우측: 증명사진 + 전체 조회(읽기 전용)
// - 하단: 사원 추가(이름/아이디/부서명/직급명) + 관리자 비번 확인 + 임시비번 1회 표시

import { useEffect, useMemo, useState } from "react";
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
  //부서 / 직급 조회
  const [deptOptions, setDeptOptions] = useState([]);  
  const [positionOptions, setPositionOptions] = useState([]);  
  /*관리자 비번 조회 중 에러 */   
  const [adminPwErr, setAdminPwErr] = useState("");
  /* ===== 검색/조회 ===== */
  const [keyword, setKeyword] = useState("");
  const [includeResigned, setIncludeResigned] = useState(false);

  const [results, setResults] = useState([]); // 리스트용 (간단 필드)
  // 결과 예시: { empNo, empName, empId, deptName, positionName, empDelFl, profileImg }
  const [selectedEmpNo, setSelectedEmpNo] = useState(null);
  const [employeeDetail, setEmployeeDetail] = useState(null);
  



  //부서 / 직급 조회
  useEffect(()=>{
    if (!open) return;

    setDeptOptions([]);
    setPositionOptions([]);

    const fetchDeptList =async()=> {
        const res = await axiosApi.get("/admin/fetchDeptList");
        // 데이터를 소문자로 변환해서 저장
        const formatted = res.data.map(item => ({
          deptCode: item.DEPTCODE,
          deptName: item.DEPTNAME
        }));
        console.log("deptOptions:", res.data); 
        setDeptOptions(res.data);
    };

    const fetchPositionList=async()=> {
        const res =  await axiosApi.get("/admin/fetchPositionList");
         console.log("positionOptions:", res.data); 
         // 데이터를 소문자로 변환해서 저장
        const formatted = res.data.map(item => ({
          positionCode: item.POSITIONCODE,
          positionName: item.POSITIONNAME
        }));
        setPositionOptions(res.data);
    };

    fetchDeptList();
    fetchPositionList();

  },[open]);

    /* ===== 추가(하단 폼) ===== */
  const [form, setForm] = useState({
    empName: "",
    empId: "",
    deptName: "",
    positionName: "",
    deptCode: "",
    positionCode: "",
  });

  const [msg, setMsg] = useState({ type: "", text: "" });

  const selected = useMemo(() => {
    return results.find((r) => r.empNo === selectedEmpNo) ?? null;
  }, [results, selectedEmpNo]);

  const viewEmp = employeeDetail ?? selected;

  useEffect(() => {
  if (!open) return;

  console.log("selectedEmpNo:", selectedEmpNo);


  // 선택 해제 시 초기화
  if (!selectedEmpNo) {
    setEmployeeDetail(null);
    setForm({
      empName: "",
      empId: "",
      deptName: "",
      positionName: "",
      deptCode: "",
      positionCode: "",
    });
    return;
  }

  (async () => {
    try {
      const res = await axiosApi.get(API.GET_EMPLOYEE, {
        params: { empNo: selectedEmpNo }, // 서버 파라미터명이 다르면 여기만 수정
      });

      const r = res.data;
      console.log("getEmployee res.data =", r);

      // ✅ 대문자/소문자 둘 다 대응해서 “프론트용 키”로 통일
      const d = {
        empNo: r.empNo ?? r.EMP_NO,
        empName: r.empName ?? r.EMP_NAME,
        empId: r.empId ?? r.EMP_ID,
        empEmail: r.empEmail ?? r.EMP_EMAIL,
        empPhone: r.empPhone ?? r.EMP_PHONE,
        enrollDate: r.enrollDate ?? r.ENROLL_DATE,
        empDelFl: r.empDelFl ?? r.EMP_DEL_FL,
        introduction: r.introduction ?? r.INTRODUCTION,
        profileImg: r.profileImg ?? r.PROFILE_IMG,
        deptName: r.deptName ?? r.DEPT_NAME,
        positionName: r.positionName ?? r.POSITION_NAME,
        deptCode: r.deptCode ?? r.DEPT_CODE,
        positionCode: r.positionCode ?? r.POSITION_CODE,
      };

      setEmployeeDetail(d);




      // 하단 폼에도 같이 채움(조회/수정 겸용)
      setForm((p) => ({
        ...p,
        empName: d.empName ?? "",
        empId: d.empId ?? "",
        deptCode: d.deptCode ?? "",
        positionCode: d.positionCode ?? "",
      }));
    } catch (e) {
      console.error(e);
      setEmployeeDetail(null);
      setMsg({ type: "error", text: "직원 상세 조회에 실패했습니다." });
    }
  })();
}, [open, selectedEmpNo]);

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
      form.deptCode.length > 0 &&
      form.positionCode.length > 0
    );
  }, [form]);

  const validate = () => {
    if (!form.empName.trim()) return "이름은 필수입니다.";

    const id = form.empId.trim();
    if (!id) return "아이디는 필수입니다.";
    if (id.length < 6 || id.length > 20) return "아이디는 6~20자여야 합니다.";
    if (!/^[a-zA-Z0-9._-]+$/.test(id)) return "아이디는 영문/숫자/._- 만 허용됩니다.";

    if (!form.deptCode) return "부서는 필수입니다.";
    if (!form.positionCode) return "직급은 필수입니다.";

    return "";
  };

  const resetCreateForm = () => {
    setMsg({ type: "", text: "" });
    setForm({ empName: "", empId: "", deptCode: "", positionCode: "" });
    setAdminPw("");
    setAdminPwOpen(false);
  };

  /* ===== 검색 실행 ===== */
  const onSearch = async () => {
    setMsg({ type: "", text: "" });

    const q = keyword.trim();
    if (!q) {
      setResults([]);
      setSelectedEmpNo(null);
      setMsg({ type: "info", text: "검색어를 입력하세요." });
      return;
    }

    try {
    const res = await axiosApi.get(API.SEARCH_EMPLOYEES, {
      params: {
        keyword: q,
        includeResigned: includeResigned,
      },
    });

    const raw = Array.isArray(res.data) ? res.data : [];
    const list = raw.map((e) => ({
      empNo: e.empNo ?? e.EMP_NO,
      empName: e.empName ?? e.EMP_NAME,
      empId: e.empId ?? e.EMP_ID,
      deptName: e.deptName ?? e.DEPT_NAME,
      positionName: e.positionName ?? e.POSITION_NAME,
      empDelFl: e.empDelFl ?? e.EMP_DEL_FL,
      profileImg: e.profileImg ?? e.PROFILE_IMG,
    }));

    console.log("list[0] =", list[0]);
    console.log("list[0].empNo / EMP_NO =", list[0]?.empNo, list[0]?.EMP_NO);

    setResults(list);
    setSelectedEmpNo(list[0]?.empNo ?? null);

    if (list.length === 0) {
      setMsg({ type: "info", text: "검색 결과가 없습니다." });
    }
        
    } catch (e) {
        console.error(e);
        setMsg({ type: "error", text: "검색 중 오류가 발생했습니다." });
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
        deptCode: form.deptCode,
        positionCode: form.positionCode,
      }
      const res = await axiosApi.post(API.CREATE_EMPLOYEE, payload); 

      /*
     API 
     CREATE_EMPLOYEE: "/admin/employee",
     SEARCH_EMPLOYEES: "/admin/employee/search",
     GET_EMPLOYEE: "/admin/getEmployee",
     VERIFY_ADMIN_PW: "/admin/verify-password",
      */ 

      setIssued(res.data);
      setIssuedOpen(true);

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
                            key={emp.empNo || emp.EMP_NO}
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
                        src={viewEmp?.profileImg || userDefaultImg}
                        onError={(e) => {
                            e.currentTarget.src = userDefaultImg;
                        }}
                        className="w-full h-full object-cover"
                        alt="profile"
                      />
                    </div>

                    <div className="mt-3 text-sm font-semibold text-black/85">
                      {viewEmp?.empName ?? "선택된 직원 없음"}
                    </div>
                    <div className="mt-1 text-xs text-black/50">
                      {viewEmp ? `${viewEmp.positionName ?? "-"} · ${viewEmp.deptName ?? "-"}` : "좌측에서 선택"}
                    </div>
                  </div>

                  {/* 전체 조회란 */}
                  <div>
                    <div className="text-[12px] font-semibold text-black/70 mb-3">전체 조회</div>
                    {!viewEmp ? (
                      <div className="text-sm text-black/50">좌측에서 직원을 선택하면 정보가 표시됩니다.</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="사번" value={viewEmp.empNo} />
                        <Field label="아이디" value={viewEmp.empId} />
                        <Field label="이메일" value={viewEmp.empEmail ?? "-"} />
                        <Field label="전화번호" value={viewEmp.empPhone ?? "-"} />
                        <Field label="부서" value={viewEmp.deptName ?? "-"} />
                        <Field label="직급" value={viewEmp.positionName ?? "-"} />
                        <Field label="입사일" value={viewEmp.enrollDate ?? "-"} />
                        <Field label="재직상태" value={viewEmp.empDelFl === "Y" ? "퇴사" : "재직"} />
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
                인사 정보 관리
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

              <select
                key="dept-select"
                value={form.deptCode}
                onChange={(e) => setForm((p) => ({ ...p, deptCode: e.target.value }))}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2
                             text-[13px] text-black/85 outline-none"
              >
                <option key="__placeholder" value="">부서 선택</option>
                {deptOptions.map(d =>(
                    <option key={d.DEPTCODE} value={d.DEPTCODE}>
                        {d.DEPTNAME}
                    </option>
                ))}
              </select>

              <select 
                key="position-select"         
                value={form.positionCode}
                onChange={(e) => setForm((p) => ({ ...p, positionCode: e.target.value }))}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2
                           text-[13px] text-black/85 outline-none"
              >  
                <option key="__empty_position" value="">직급 선택</option>
                {positionOptions.map(o => (
                    <option key={o.POSITIONCODE} value={o.POSITIONCODE}>
                        {o.POSITIONNAME}
                    </option>
                ))}
              </select>

              {/* <div className="col-span-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2"> */}
              <div>
                {/* <div className="text-[11px] text-black/45">아이디 추천</div> */}
                <div className="mt-1 text-[12px] text-black/30 leading-relaxed">{ID_HINT}</div>
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
    <span>
      {before}
      <mark className="bg-amber-200/70 rounded px-0.5">{mid}</mark>
      {after}
    </span>
  );
}
