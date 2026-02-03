// src/components/modal/MyInfoModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import DraggableModal from "./DraggableModal";
import { axiosApi } from "../../api/axiosAPI";
import { useAuthStore } from "../../store/authStore";
import { Pencil, Save, Undo2, ImageUp } from "lucide-react";
const userDefaultImg = "/image/user.png"

/**
 * ✅ MyInfoModal (완성본)
 * - 조회 기본
 * - 수정 토글 (이메일/닉네임/전화/자기소개)
 * - 변경된 값만 payload에 담아 저장
 * - 프로필 이미지 업로드(별도)
 * - 성공 시 authStore.user 갱신 → 헤더 즉시 반영
 *
 * ⚠️ API 엔드포인트만 프로젝트에 맞게 바꾸세요.
 */
const API = {
  UPDATE_PROFILE: "/mypage/profile", // PUT: {empEmail, empNickname, empPhone, introduction}
  UPLOAD_IMAGE: "/mypage/profile-image", // PUT multipart: profileImage
};

const MyInfoModal=({ open, onClose }) => {
  const [previewImg, setPreviewImg] = useState(null);
  const [pickedFile, setPickedFile] = useState(null);

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // draft(수정 가능한 4개 + (선택) password는 별도 모달에서 처리한다고 합의했으니 제외)
  const [draft, setDraft] = useState({
    empEmail: "",
    empNickname: "",
    empPhone: "",
    introduction: "",
  });

  const fileRef = useRef(null);

  // 모달 열릴 때 draft 초기화
  useEffect(() => {
    if (!open) return;
    setMsg({ type: "", text: "" });
    setEdit(false);

    if (user) {
      setDraft({
        empEmail: user.empEmail ?? "",
        empNickname: user.empNickname ?? "",
        empPhone: user.empPhone ?? "",
        introduction: user.introduction ?? "",
      });
    }
  }, [open, user]);

  const readonlyFields = useMemo(() => {
    if (!user) return [];
    return [
      { label: "회사이름", value: user.companyName ?? "회사" }, // 서버에 없으면 기본
      { label: "아이디", value: user.empId ?? "-" },
      { label: "이메일", value: user.empEmail ?? "-" }, // 조회용(아래는 수정용)
      { label: "닉네임", value: user.empNickname ?? "-" }, // 조회용
      { label: "직책", value: user.positionName ?? "-" },
      { label: "부서", value: user.deptName ?? "-" },
      { label: "사원번호", value: user.empNo ?? "-" },
      { label: "전화번호", value: user.empPhone ?? "-" }, // 조회용
      { label: "입사일", value: user.enrollDate ?? "-" },
      { label: "자기 소개", value: user.introduction ?? "-" }, // 조회용
    ];
  }, [user]);

  const canInteract = user && !saving && !uploading;

  const openFilePicker = () => {
    if (!canInteract) return;
    fileRef.current?.click();
  };

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
        setPreviewImg(null);
        setPickedFile(null);
        return;
    }
    // 같은 파일 다시 선택 가능하게
    e.target.value = "";
    
    setPickedFile(file);

    // ✅ 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
        setPreviewImg(reader.result);
    };
    reader.readAsDataURL(file);


    // try {
    //   const form = new FormData();
    //   form.append("profileImage", file);

    //   const res = await axiosApi.put(API.UPLOAD_IMAGE, form, {
    //     headers: { "Content-Type": "multipart/form-data" },
    //   });

    //   // 서버가 갱신된 user를 반환한다는 가정
    //   const updated = res.data;
    //   if (updated) setUser(updated);

    //   setMsg({ type: "success", text: "프로필 이미지가 변경되었습니다." });
    // } catch (err) {
    //   console.error(err);
    //   setMsg({ type: "error", text: "프로필 이미지 변경에 실패했습니다." });
    // } finally {
    //   setUploading(false);
    // }
  };

  const onClickEdit = () => {
    if (!user) return;
    setMsg({ type: "", text: "" });
    setEdit(true);
  };

  const onCancelEdit = () => {
    if (!user) return;
    setMsg({ type: "", text: "" });
    setDraft({
      empEmail: user.empEmail ?? "",
      empNickname: user.empNickname ?? "",
      empPhone: user.empPhone ?? "",
      introduction: user.introduction ?? "",
    });
    setEdit(false);
  };

  // 변경된 값만 payload 구성
  const buildPayload = () => {
    if (!user) return {};

    const payload = {};
    if (draft.empEmail !== (user.empEmail ?? "")) payload.empEmail = draft.empEmail.trim();
    if (draft.empNickname !== (user.empNickname ?? "")) payload.empNickname = draft.empNickname.trim();
    if (draft.empPhone !== (user.empPhone ?? "")) payload.empPhone = draft.empPhone.trim();
    if (draft.introduction !== (user.introduction ?? "")) payload.introduction = draft.introduction;

    // 빈문자 허용 여부는 정책에 따라.
    // 여기서는 "아예 비우기"도 가능하게 두되, trim은 이메일/닉/폰에만 적용.
    return payload;
  };

  const validatePayload = (payload) => {
    // 최소 검증만 (상세 검증은 서버가 최종)
    if (payload.empEmail != null && payload.empEmail.length > 0) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.empEmail);
      if (!ok) return "이메일 형식이 올바르지 않습니다.";
    }
    if (payload.empPhone != null && payload.empPhone.length > 0) {
      // 너무 빡세게 막지 않음. 숫자/하이픈 정도만
      const ok = /^[0-9\-+()\s]{7,20}$/.test(payload.empPhone);
      if (!ok) return "전화번호 형식이 올바르지 않습니다.";
    }
    if (payload.empNickname != null && payload.empNickname.length > 30) {
      return "닉네임은 30자 이하여야 합니다.";
    }
    if (payload.introduction != null && payload.introduction.length > 1000) {
      return "자기 소개는 1000자 이하여야 합니다.";
    }
    return "";
  };

  const onSave = async () => {
    if (!window.confirm("수정하시겠습니까?")) return;
    if (!user) return;

    setMsg({ type: "", text: "" });

    const payload = buildPayload();
    const keys = Object.keys(payload);

    if (keys.length === 0) {
      setMsg({ type: "info", text: "변경된 내용이 없습니다." });
      setEdit(false);
      return;
    }

    const errMsg = validatePayload(payload);
    if (errMsg) {
      setMsg({ type: "error", text: errMsg });
      return;
    }

    setSaving(true);
    try {
      const res = await axiosApi.put(API.UPDATE_PROFILE, payload);

      // 서버가 갱신된 user를 반환한다는 가정
      const updated = res.data;
      if (updated) setUser(updated);
      else {
        // 만약 서버가 user를 안 내려주면, 최소한 draft를 auth user에 합치기(임시)
        setUser({ ...user, ...payload });
      }

      setMsg({ type: "success", text: "저장되었습니다." });
      setEdit(false);
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "저장에 실패했습니다." });
    } finally {
      setSaving(false);
    }
  };

    //저장 버튼 비활성화
    const isChanged = useMemo(() => {
    if (!user) return false;
    return (
      draft.empEmail !== user.empEmail ||
      draft.empNickname !== user.empNickname ||
      draft.empPhone !== user.empPhone ||
      draft.introduction !== user.introduction ||
      pickedFile !== null
    );
    }, [draft, user, previewImg]);


  return (
    <DraggableModal open={open} onClose={onClose} title="내 정보 설정" width={500} height={620}>
      {/* {!user ? (
        <div className="text-sm text-black/60">로그인 정보가 없습니다.</div> */}
        {user ? (
        <div className="space-y-5">
          {/* 상단 프로필 영역 */}
          <section className="rounded-2xl border border-white/20 bg-white/15 p-5">
            <div className="flex flex-col items-center">
              {/* 프로필 이미지 */}
              <div className="relative">
                <div className="w-[112px] h-[112px] rounded-[28px] bg-black/10 overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                  {/* 실제 이미지가 있으면 넣기 (user.profileImg 등) */}
                  {/* <img src={user.profileImg} alt="profile" className="w-full h-full object-cover" /> */}
                  <img
                    src={previewImg || user?.profileImg || userDefaultImg}
                    className="w-full h-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={!canInteract}
                  className={`
                    absolute -bottom-2 -right-2
                    w-10 h-10 rounded-2xl
                    bg-white/40 backdrop-blur-xl
                    border border-white/25
                    grid place-items-center
                    hover:bg-white/55 transition
                    ${!canInteract ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                  aria-label="프로필 이미지 변경"
                  title="프로필 이미지 변경"
                >
                  <ImageUp size={18} className="text-black/70" />
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickImage}
                />
              </div>

              {/* 이름 */}
              <div className="mt-3 text-[16px] font-semibold text-black/85">{user.empName ?? "-"}</div>
              <div className="mt-1 text-xs text-black/50">
                {user.positionName ?? "-"} · {user.deptName ?? "-"}
              </div>

              {/* 액션 버튼 */}
              <div className="mt-4 flex items-center gap-2">
                {!edit ? (
                  <button
                    type="button"
                    onClick={onClickEdit}
                    disabled={!canInteract}
                    className={`
                      text-xs px-3 py-2 rounded-xl
                      bg-black/80 text-white hover:bg-black transition
                      flex items-center gap-2
                      ${!canInteract ? "opacity-60 cursor-not-allowed" : ""}
                    `}
                  >
                    <Pencil size={14} /> 수정
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={!isChanged || saving || uploading}
                      className={`
                        text-xs px-3 py-2 rounded-xl
                        bg-black/80 text-white hover:bg-black transition
                        flex items-center gap-2
                        ${(!isChanged || saving || uploading) ? "opacity-60 cursor-not-allowed" : ""}
                      `}
                    >
                      <Save size={14} /> 저장
                    </button>

                    <button
                      type="button"
                      onClick={onCancelEdit}
                      disabled={saving || uploading}
                      className={`
                        text-xs px-3 py-2 rounded-xl
                        bg-black/5 hover:bg-black/10 transition
                        flex items-center gap-2
                        ${(saving || uploading) ? "opacity-60 cursor-not-allowed" : ""}
                      `}
                    >
                      <Undo2 size={14} /> 취소
                    </button>
                  </>
                )}
              </div>

              {/* 메시지 */}
              {msg.text && (
                <div
                  className={`
                    mt-3 text-xs px-3 py-2 rounded-xl border
                    ${msg.type === "success" ? "bg-emerald-50/60 border-emerald-200/60 text-emerald-700" : ""}
                    ${msg.type === "error" ? "bg-rose-50/60 border-rose-200/60 text-rose-700" : ""}
                    ${msg.type === "info" ? "bg-slate-50/60 border-slate-200/60 text-slate-700" : ""}
                  `}
                >
                  {msg.text}
                </div>
              )}
            </div>
          </section>

          {/* 읽기 전용(요약) */}
          <section className="rounded-2xl border border-white/20 bg-white/12 p-5">
            <div className="text-[13px] font-semibold text-black/75 mb-3">전체 정보 조회</div>
            <div className="grid grid-cols-2 gap-3">
              {readonlyFields.map((f) => (
                <Field key={f.label} label={f.label} value={f.value} />
              ))}
            </div>
          </section>

          {/* 수정 가능한 영역 */}
          <section className="rounded-2xl border border-white/20 bg-white/12 p-5">
            <div className="text-[13px] font-semibold text-black/75 mb-3">수정 가능한 정보</div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="이메일"
                value={draft.empEmail}
                onChange={(v) => setDraft((p) => ({ ...p, empEmail: v }))}
                disabled={!edit || saving || uploading}
                placeholder="example@company.com"
              />
              <Input
                label="닉네임"
                value={draft.empNickname}
                onChange={(v) => setDraft((p) => ({ ...p, empNickname: v }))}
                disabled={!edit || saving || uploading}
                placeholder="닉네임"
              />
              <Input
                label="전화번호"
                value={draft.empPhone}
                onChange={(v) => setDraft((p) => ({ ...p, empPhone: v }))}
                disabled={!edit || saving || uploading}
                placeholder="010-0000-0000"
              />

              <div className="col-span-2">
                <TextArea
                  label="자기 소개"
                  value={draft.introduction}
                  onChange={(v) => setDraft((p) => ({ ...p, introduction: v }))}
                  disabled={!edit || saving || uploading}
                  placeholder="자기 소개를 입력하세요."
                />
              </div>
            </div>

            {!edit && (
              <p className="mt-3 text-xs text-black/45">
                * 직책/부서/사번/입사일 등은 회사(관리자) 측에서 관리됩니다.
              </p>
            )}
          </section>
        </div>
        ) : (
      <div className="text-sm text-black/60">로그인 정보가 없습니다.</div>
      )}
    </DraggableModal>
  );
}

/* ---------------- UI atoms ---------------- */

function Field({ label, value }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
      <div className="text-[11px] text-black/45">{label}</div>
      <div className="mt-0.5 text-[13px] text-black/80 break-words">{String(value ?? "-")}</div>
    </div>
  );
}

function Input({ label, value, onChange, disabled, placeholder = "", type = "text" }) {
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

function TextArea({ label, value, onChange, disabled, placeholder = "" }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
      <div className="text-[11px] text-black/45">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={5}
        className={`
          mt-1 w-full bg-transparent outline-none text-[13px] resize-none
          ${disabled ? "text-black/55" : "text-black/85"}
          placeholder:text-black/30
        `}
      />
    </div>
  );
}

export default MyInfoModal;