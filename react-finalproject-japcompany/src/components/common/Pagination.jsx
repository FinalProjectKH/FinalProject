import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

export default function Pagination({ pagination, setPage }) {
  // pagination 정보가 없으면 아무것도 안 그림
  if (!pagination) return null;

  const { currentPage, startPage, endPage, maxPage, prevPage, nextPage } = pagination;

  // 페이지가 1개밖에 없으면 굳이 표시 안 함 (선택사항)
  if (maxPage <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8 select-none">
      
      {/* << 맨 처음으로 */}
      <button
        onClick={() => setPage(1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 transition-colors"
      >
        <FaAngleDoubleLeft />
      </button>

      {/* < 이전 그룹으로 */}
      <button
        onClick={() => setPage(prevPage)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 transition-colors"
      >
        <FaChevronLeft />
      </button>

      {/* 숫자 버튼 (startPage ~ endPage) */}
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => setPage(pageNum)}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-all shadow-sm ${
            currentPage === pageNum
              ? "bg-blue-600 text-white border border-blue-600 transform scale-105"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          }`}
        >
          {pageNum}
        </button>
      ))}

      {/* > 다음 그룹으로 */}
      <button
        onClick={() => setPage(nextPage)}
        disabled={currentPage === maxPage}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 transition-colors"
      >
        <FaChevronRight />
      </button>

      {/* >> 맨 끝으로 */}
      <button
        onClick={() => setPage(maxPage)}
        disabled={currentPage === maxPage}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 transition-colors"
      >
        <FaAngleDoubleRight />
      </button>

    </div>
  );
}