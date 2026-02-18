import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { axiosApi } from '../../../api/axiosAPI';
import { useAuthStore } from "../../../store/authStore";

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

const DeptAttendanceMain = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptLeaveList, setDeptLeaveList] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // 💡 권한 체크 로직
  useEffect(() => {
    if (user && user.empNo) {
      const userRole = Number(user.authorityLevel);
      if (userRole < 2) {
        alert("팀장 이상의 권한이 필요합니다.");
        navigate("/attendance/my");
      }
    }
  }, [user, navigate]);

  const fetchDeptAttendance = async () => {
    // 💡 1. 모든 입구 컷 조건을 한 줄로 정리!
    // 유저가 없거나, 사번이 없거나, 사번이 빈 문자열이면 즉시 중단
    if (!user || !user.empNo || user.empNo === '') {
        console.warn("방어 코드 작동: 유저 정보가 불완전하여 요청을 중단함");
        return;
    }

    // 💡 2. 여기 도달했다는 건 유저 정보가 확실히 있다는 뜻!
    console.log("현재 스토어의 유저 정보:", user);

    try {
      setLoading(true);
      console.log("API 요청 시도 - 부서코드:", user.deptCode);
      
      const [attendanceRes, leaveRes] = await Promise.all([
        axiosApi.get(`/api/attendance/department/${user.deptCode}`, {
          params: { date: currentDate }
        }),
        axiosApi.get('/api/attendance/dept-leaves')
      ]);
      
      console.log("응답 성공!", attendanceRes.data);
      setAttendanceList(attendanceRes.data || []);
      setDeptLeaveList(leaveRes.data || []);
    } catch (error) {
      // 💡 2. 에러가 나면 응답 객체 전체를 확인
      console.error("에러 상세 내역:", error.response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeptAttendance();
  }, [currentDate, user]);

  const stats = {
    normal: attendanceList.filter(i => i.startTime && i.startTime !== "-" && !i.late && !i.earlyLeave && !i.missing).length,
    late: attendanceList.filter(i => i.late).length,
    early: attendanceList.filter(i => i.earlyLeave).length,
    missing: attendanceList.filter(i => i.missing).length,
    abnormal: 0,
  };

  const handleDateChange = (days) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const totalMember = attendanceList.length || 0;
  const getPercent = (count) => totalMember > 0 ? ((count / totalMember) * 100).toFixed(0) : 0;

  return (
    <div className="p-6 space-y-8">
      {/* 상단 대시보드 */}
      <div className="bg-[#fdfbf7] p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">부서 근태관리</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-inner border">
              <ChevronLeft className="w-5 h-5 cursor-pointer" onClick={() => handleDateChange(-1)} />
              <span className="font-semibold">{currentDate}</span>
              <ChevronRight className="w-5 h-5 cursor-pointer" onClick={() => handleDateChange(1)} />
            </div>
            <button className="text-gray-500 text-sm font-medium hover:text-[#5b2f1f]" onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])}>오늘</button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-2">
          <div className="flex flex-col gap-4 p-4 bg-gray-50/50 rounded-2xl border border-dashed">
            <div className="text-xs text-gray-400 mb-1">📝 근무 상태</div>
            <StatusCard label="정상" count={stats.normal} percentage={getPercent(stats.normal)} total={totalMember} color="bg-green-100 text-green-600" />
          </div>
          <div className="flex flex-col gap-4 p-4 bg-gray-50/50 rounded-2xl border border-dashed flex-1">
            <div className="text-xs text-gray-400 mb-1">⏰ 시간 및 기록 이상</div>
            <div className="grid grid-cols-3 gap-4">
              <StatusCard label="지각" count={stats.late} percentage={getPercent(stats.late)} total={totalMember} color="bg-orange-100 text-orange-600" />
              <StatusCard label="조퇴" count={stats.early} percentage={getPercent(stats.early)} total={totalMember} color="bg-orange-100 text-orange-600" />
              <StatusCard label="출퇴근 누락" count={stats.missing} percentage={getPercent(stats.missing)} total={totalMember} color="bg-orange-100 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 리스트 */}
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
                <th className="pb-4 font-medium">출근시간</th>
                <th className="pb-4 font-medium">퇴근시간</th>
                <th className="pb-4 font-medium">총 근무 시간</th>
                <th className="pb-4 font-medium">휴가</th>
                <th className="pb-4 font-medium">근태이상</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="py-20 text-gray-400">데이터를 불러오는 중입니다...</td></tr>
              ) : attendanceList.length > 0 ? (
                attendanceList.map((item) => {
                  // 💡 여기서 휴가 데이터를 매칭해야 에러가 안 나!
                  const empLeave = deptLeaveList.find(l => l.employee?.empNo === item.empNo);
                  
                  const statusMessages = [];
                  if (item.late) statusMessages.push("지각");
                  if (item.earlyLeave) statusMessages.push("조퇴");
                  if (item.missing) statusMessages.push("누락");
                  const statusText = statusMessages.length > 0 ? statusMessages.join(", ") : "정상";

                  return (
                    <tr key={item.empNo} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-gray-400">{item.empNo}</td>
                      <td className="py-4 font-medium">{item.empName}</td>
                      <td className="py-4 text-gray-600">{item.deptName}</td>
                      <td className="py-4 font-semibold text-gray-700">{item.startTime || '-'}</td>
                      <td className="py-4 font-semibold text-gray-700">{item.endTime || '-'}</td>
                      <td className="py-4 text-gray-700">{item.totalWorkTime || '0h 0m'}</td>
                      <td className="py-4 text-gray-600">{empLeave ? `${empLeave.leaveDays}일` : '-'}</td>
                      <td className="py-4">
                        <span className={`font-bold ${statusMessages.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="8" className="py-20 text-gray-400">조회된 근태 기록이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeptAttendanceMain;