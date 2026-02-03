// src/pages/Calendar.tsx
import React from 'react';
import ApprovalMain from '../components/approval/ApprovalMain'; 
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ApprovalHeader from '../components/approval/ApprovalHeader';
const Approval = () => {
  return (
<div className="flex w-full h-screen overflow-hidden bg-gray-50">
    {/* background */}
  <div className="absolute inset-0 bg-[url('/image/bg.jpeg')] bg-cover bg-center bg-no-repeat opacity-40 z-0" />
      
      <Sidebar />

      <div className="flex-1 ml-[240px] flex flex-col h-full">
        
        <div className="flex-shrink-0">
           <Header />
        </div>

        <main className="flex-1 overflow-hidden relative p-4">
          <div className="h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <ApprovalMain />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Approval;