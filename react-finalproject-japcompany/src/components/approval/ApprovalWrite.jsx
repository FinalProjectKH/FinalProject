import React from 'react';
import { useParams } from 'react-router-dom';

export default function ApprovalWrite() {
  const { formId } = useParams();
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">📝 문서 작성</h1>
      <p className="mt-4">선택한 양식: <span className="text-blue-600 font-bold">{formId}</span></p>
    </div>
  );
}