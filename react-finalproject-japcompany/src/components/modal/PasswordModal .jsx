import { useMemo, useState } from "react";
import DraggableModal from "./DraggableModal"; // 경로가 다르면 맞춰주세요.
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { axiosApi } from "../../api/axiosAPI"; // 필요 없으면 제거 가능

const PasswordModal = ({ open, onClose }) => {
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [loading, setLoading] = useState(false);

  const pwRuleOk = useMemo(() => {
    // 8~16, 영문/숫자/특수문자 조합(각 1개 이상)
    const lenOk = newPw.length >= 8 && newPw.length <= 16;
    const hasAlpha = /[a-zA-Z]/.test(newPw);
    const hasNum = /[0-9]/.test(newPw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(newPw);
    return lenOk && hasAlpha && hasNum && hasSpecial;
  }, [newPw]);

  const matchOk = useMemo(() => newPw.length > 0 && newPw === newPw2, [newPw, newPw2]);

  const canSubmit = useMemo(() => {
    return curPw.trim().length > 0 && pwRuleOk && matchOk && !loading;
  }, [curPw, pwRuleOk, matchOk, loading]);

  const onSubmit = async () => {
    if (!canSubmit) return;

    if (!window.confirm("비밀번호를 변경하시겠습니까?")) return;

    try {
      setLoading(true);

      // ✅ 서버 API에 맞게 엔드포인트/바디는 수정하세요.
      await axiosApi.post("/employee/change-password", {
        currentPassword: curPw,
        newPassword: newPw,
      });

      alert("비밀번호가 변경되었습니다.");
      setCurPw("");
      setNewPw("");
      setNewPw2("");
      onClose?.();
    } catch (e) {
      console.error(e);
      alert("비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DraggableModal open={open} onClose={onClose} title="보안 설정" width={520} height={520}>
      <div className="space-y-4">
        {/* 현재 비밀번호 */}
        <Field
          label="현재 비밀번호"
          icon={<KeyRound size={16} className="text-black/30" />}
          value={curPw}
          onChange={setCurPw}
          placeholder="현재 비밀번호 입력"
        />

        {/* 새 비밀번호 */}
        <Field
          label="새 비밀번호"
          icon={<Lock size={16} className="text-black/30" />}
          value={newPw}
          onChange={setNewPw}
          placeholder="8~16자, 영문/숫자/특수문자 조합"
          hint={
            newPw.length === 0
              ? null
              : pwRuleOk
              ? <span className="text-emerald-600/90">사용 가능한 비밀번호 입니다.</span>
              : <span className="text-rose-600/90">8~16자 + 영문/숫자/특수문자 조합이 필요합니다.</span>
          }
        />

        {/* 새 비밀번호 확인 */}
        <Field
          label="새 비밀번호 확인"
          icon={<ShieldCheck size={16} className="text-black/30" />}
          value={newPw2}
          onChange={setNewPw2}
          placeholder="새 비밀번호를 한 번 더 입력"
          hint={
            newPw2.length === 0
              ? null
              : matchOk
              ? <span className="text-emerald-600/90">일치합니다.</span>
              : <span className="text-rose-600/90">비밀번호가 일치하지 않습니다.</span>
          }
        />

        {/* 안내 문구 */}
        <div className="rounded-2xl border border-white/20 bg-white/20 backdrop-blur p-4">
          <div className="text-[13px] font-semibold text-black/75 mb-2">비밀번호 설정 방법</div>
          <ul className="text-[12px] text-black/60 leading-5 list-disc pl-5 space-y-1">
            <li>8~16자의 영문자, 숫자, 특수문자를 조합하여 사용하세요.</li>
            <li>연속한 문자와 숫자, 동일 문자 반복, 키보드 순차 배열 구성을 피해주세요.</li>
            <li>이전 비밀번호의 재사용을 피해주세요.</li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className="pt-1 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/20 bg-white/15 hover:bg-white/25 transition text-sm text-black/70"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-xl bg-black/75 hover:bg-black/80 disabled:bg-black/30 transition text-sm text-white"
          >
            {loading ? "변경 중..." : "비밀번호 변경"}
          </button>
        </div>
      </div>
    </DraggableModal>
  );
};

const Field = ({ label, icon, value, onChange, placeholder, hint }) => (
  <div className="space-y-1.5">
    <div className="text-[12px] font-semibold text-black/70">{label}</div>
    <div className="rounded-2xl border border-white/20 bg-white/20 backdrop-blur px-4 py-3 flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-[13px] text-black/75 placeholder:text-black/35"
      />
    </div>
    {hint ? <div className="text-[12px]">{hint}</div> : null}
  </div>
);

export default PasswordModal;
