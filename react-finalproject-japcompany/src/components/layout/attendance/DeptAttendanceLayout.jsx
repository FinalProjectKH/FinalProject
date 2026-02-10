import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from 'react-router-dom';

const StatusCard = ({ label, count, percentage, total, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2 min-w-[140px]">
    <span className={`text-[10px] font-bold px-2 py-1 rounded w-fit ${color}`}>
      {label}
    </span>
    <div className="flex flex-col">
      <span className="text-xl font-bold">{count} 명</span>
      <span className="text-gray-400 text-xs">{percentage}% {total}명 기준</span>
    </div>
  </div>
);

const AttendanceDept = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate(); // 💡 1. useNavigate 훅을 추가해야 해! (import도 잊지 말고)
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // 💡 2. 권한 체크 로직 추가
  useEffect(() => {
  // 💡 user 정보가 완전히 들어왔을 때만 체크하도록 조건 강화
  if (user && user.empNo) {
    const userRole = Number(user.authorityLevel); // 숫자로 변환
    console.log("검증 중인 권한 레벨:", userRole);

    if (userRole < 2) {
      alert("팀장 이상의 권한이 필요합니다.");
      navigate("/attendance/my");
    }
  }
}, [user, navigate]);

  // 1. 데이터 페칭 함수
  const fetchDeptAttendance = async () => {
    if (!user?.deptId) return;
    try {
      setLoading(true);
      const response = await axios.get(`/api/attendance/department/${user.deptId}`, {
        params: { date: currentDate }
      });
      // 백엔드에서 DTO 리스트를 바로 보내준다고 가정
      setAttendanceList(response.data || []);
    } catch (error) {
      console.error("부서 근태 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeptAttendance();
  }, [currentDate, user?.deptId]);

  // 2. 실시간 통계 계산 (Render 시점에 계산)
  const stats = {
    normal: attendanceList.filter(i => !i.isLate && !i.isEarlyLeave && !i.isMissing && i.checkInTime).length,
    late: attendanceList.filter(i => i.isLate).length,
    early: attendanceList.filter(i => i.isEarlyLeave).length,
    missing: attendanceList.filter(i => i.isMissing).length,
    abnormal: attendanceList.filter(i => i.isAbnormal).length, // 혹시 몰라 남겨둔 비정상 체크
  };

  const totalMember = attendanceList.length || 0;
  const getPercent = (count) => totalMember > 0 ? ((count / totalMember) * 100).toFixed(0) : 0;

  return (
    <div className="p-6 space-y-8">
      {/* 상단 섹션: 대시보드 */}
      <div className="bg-[#fdfbf7] p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">부서 근태관리</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-inner border">
              <ChevronLeft className="w-5 h-5 cursor-pointer" onClick={() => {/* 날짜 변경 로직 */ }} />
              <span className="font-semibold">{currentDate}</span>
              <ChevronRight className="w-5 h-5 cursor-pointer" onClick={() => {/* 날짜 변경 로직 */ }} />
            </div>
            <button className="text-gray-500 text-sm font-medium hover:text-[#5b2f1f]" onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])}>오늘</button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-2">
          <div className="flex flex-col gap-4 p-4 bg-gray-50/50 rounded-2xl border border-dashed">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><span>📝 근무 상태</span></div>
            <StatusCard label="정상" count={stats.normal} percentage={getPercent(stats.normal)} total={totalMember} color="bg-green-100 text-green-600" />
          </div>

          <div className="flex flex-col gap-4 p-4 bg-gray-50/50 rounded-2xl border border-dashed flex-1">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><span>⏰ 시간 및 기록 이상</span></div>
            <div className="grid grid-cols-3 gap-4">
              <StatusCard label="지각" count={stats.late} percentage={getPercent(stats.late)} total={totalMember} color="bg-orange-100 text-orange-600" />
              <StatusCard label="조퇴" count={stats.early} percentage={getPercent(stats.early)} total={totalMember} color="bg-orange-100 text-orange-600" />
              <StatusCard label="출퇴근 누락" count={stats.missing} percentage={getPercent(stats.missing)} total={totalMember} color="bg-orange-100 text-orange-600" />
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4 bg-gray-50/50 rounded-2xl border border-dashed">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><span>⚠️ 비정상적 근무 상태</span></div>
            <StatusCard label="근무지 외 체크" count={stats.abnormal} percentage={getPercent(stats.abnormal)} total={totalMember} color="bg-red-100 text-red-600" />
          </div>
        </div>
      </div>

      {/* 하단 섹션: 리스트 테이블 */}
      <div className="bg-[#fdfbf7] p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative mb-6 w-72">
          <input type="text" placeholder="검색" className="w-full pl-10 pr-4 py-2 bg-gray-200/50 border-none rounded-full outline-none" />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="text-gray-500 text-sm border-b">
                <th className="pb-4 font-medium">사번</th>
                <th className="pb-4 font-medium">사원명</th>
                <th className="pb-4 font-medium">부서명</th>
                <th className="pb-4 font-medium">근무그룹명</th>
                <th className="pb-4 font-medium">출근시간</th>
                <th className="pb-4 font-medium">퇴근시간</th>
                <th className="pb-4 font-medium">총 근무 시간</th>
                <th className="pb-4 font-medium">휴가</th>
                <th className="pb-4 font-medium">근태이상</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="9" className="py-20 text-gray-400">데이터를 불러오는 중입니다...</td></tr>
              ) : attendanceList.length > 0 ? (
                attendanceList.map((item) => {
                  const statusMessages = [];
                  if (item.isLate) statusMessages.push("지각");
                  if (item.isEarlyLeave) statusMessages.push("조퇴");
                  if (item.isMissing) statusMessages.push("누락");
                  const statusText = statusMessages.length > 0 ? statusMessages.join(", ") : "정상";

                  return (
                    <tr key={item.empNo} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-gray-400">{item.empNo}</td>
                      <td className="py-4 font-medium">{item.empName}</td>
                      <td className="py-4 text-gray-600">{item.deptName}</td>
                      <td className="py-4 text-gray-600">{item.groupName || '기본근무'}</td>
                      <td className="py-4 font-semibold text-gray-700">{item.checkInTime || '-'}</td>
                      <td className="py-4 font-semibold text-gray-700">{item.checkOutTime || '-'}</td>
                      <td className="py-4 text-gray-700">{item.totalWorkTime || '0h 0m'}</td>
                      <td className="py-4 text-gray-600">{item.leaveHours || '-'}</td>
                      <td className="py-4">
                        <span className={`font-bold ${statusMessages.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="9" className="py-20 text-gray-400">조회된 근태 기록이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDept;