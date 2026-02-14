package com.example.demo.common.utility;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Pagination {
	private int currentPage;		// 현재 페이지 번호
	private int listCount;			// 전체 게시글 수
	
	private int limit = 10;			// 한 페이지 목록에 보여지는 게시글 수
	private int pageSize = 10;		// 보여질 페이지 번호 개수
	
	private int maxPage;			// 마지막 페이지 번호
	private int startPage;			// 보여지는 맨 앞 페이지 번호
	private int endPage;			// 보여지는 맨 뒤 페이지 번호
	
	private int prevPage;			// 이전 페이지 모음의 마지막 번호
	private int nextPage;			// 다음 페이지 모음의 시작 번호
	
	// 🔥 [추가] DB 쿼리(Oracle ROWNUM)용 변수
	private int startRow; 
	private int endRow;

	// 2개짜리 생성자
	public Pagination(int currentPage, int listCount) {
		super();
		this.currentPage = currentPage;
		this.listCount = listCount;
		calculate();
	}

	// 4개짜리 생성자
	public Pagination(int currentPage, int listCount, int limit, int pageSize) {
		super();
		this.currentPage = currentPage;
		this.listCount = listCount;
		this.limit = limit;
		this.pageSize = pageSize;
		calculate();
	}

	private void calculate() {
		// 1. maxPage 계산
		maxPage = (int)Math.ceil((double)listCount / limit);

		// 2. startPage 계산
		startPage = (currentPage - 1) / pageSize * pageSize + 1;

		// 3. endPage 계산
		endPage = startPage + pageSize - 1;
		if(endPage > maxPage) endPage = maxPage;

		// 4. prevPage 계산
		if(currentPage < pageSize)  prevPage = 1;
		else prevPage = startPage - 1;

		// 5. nextPage 계산
		if(endPage == maxPage) nextPage = maxPage;
		else nextPage = endPage + 1;
		
		// 🔥 [추가] DB 쿼리용 행 번호 계산 (Oracle ROWNUM 기준)
		// 예: 1페이지 -> 1 ~ 10, 2페이지 -> 11 ~ 20
		startRow = (currentPage - 1) * limit + 1;
		endRow = startRow + limit - 1;
	}
}