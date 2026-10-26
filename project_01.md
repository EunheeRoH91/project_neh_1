---
title: PROJECT 01 — 매출/정산 및 입금 대사 자동화 시스템
---

<span color="gray">[← 메인 포트폴리오로 이동](https://app.notion.com/p/3ff0fcd1161381c3b6d3c511c4eff042)</span>
<empty-block/>

<span color="gray">PROJECT 01 / FINANCIAL AUTOMATION SYSTEM</span>

# 매출/정산 및 입금 대사 자동화 시스템
### Multi-channel Revenue, Settlement & Deposit Reconciliation System

<empty-block/>

<columns>
	<column ratio="25">
		**프로젝트 성격**
		재무·자금 업무 프로세스 개선
	</column>
	<column ratio="25">
		**주요 기술 스택**
		React, TypeScript, Supabase
	</column>
	<column ratio="25">
		**핵심 목표**
		입금 대사 자동화율 80% 달성
	</column>
	<column ratio="25">
		**현재 상태**
		✅ 개발 및 배포 완료 (Live Demo 운영)
	</column>
</columns>

<empty-block/>

<columns>
	<column ratio="100">
		> **Live Service & Source Code**
		> - 🌐 **배포 사이트**: [Live Demo 바로가기](https://github.com/EunheeRoH91/project_neh_1) (Vercel 배포 완료)
		> - 📂 **소스 코드 저장소**: [GitHub Repository (EunheeRoH91/project_neh_1)](https://github.com/EunheeRoH91/project_neh_1)
	</column>
</columns>

<empty-block/>

---

<empty-block/>

<span color="gray">EXECUTIVE SUMMARY</span>

## 📌 프로젝트 3줄 요약

<columns>
	<column ratio="33">
		<callout icon="🚨">
			**기존 문제**
			<empty-block/>
			수만 건의 쇼핑몰 정산과 통장 입금을 엑셀로 맞추느라 야근과 오분개 위험 상존
		</callout>
	</column>
	<column ratio="33">
		<callout icon="💡">
			**해결 방법**
			<empty-block/>
			2단계 룰 기반 매칭 엔진과 거래처 대표자명 교차 매핑으로 대조 과정 자동화
		</callout>
	</column>
	<column ratio="34">
		<callout icon="📈">
			**도입 효과**
			<empty-block/>
			단순 수작업 공수 80% 절감 및 동명 거래처 충돌 방지로 회계 사고 원천 차단
		</callout>
	</column>
</columns>

<empty-block/>

---

<empty-block/>

<span color="gray">BEFORE vs AFTER</span>

## ⚖️ 프로세스 변화 한눈에 보기

<columns>
	<column ratio="50">
		### ❌ 기존 방식 (Before : 엑셀 수작업)
		- **목돈 정산 역추적**: 통장에 꽂힌 3천만 원이 어떤 주문 건들인지 엑셀 VLOOKUP으로 일일이 분해
		- **입금자명 수동 확인**: 법인 세금계산서인데 대표자 개인명으로 입금되면 통장 적요를 일일이 검색
		- **오분개 위험**: 동명이인 거래처에 동일 금액 청구가 있을 때 임의로 처리하다 장부 왜곡 발생
		- **가수금 방치**: 누구 돈인지 모르는 입금 건이 엑셀 시트에 메모로만 남아 관리 사각지대 발생
	</column>
	<column ratio="50">
		### ⭕ 개선 도구 (After : 자동 대사 시스템)
		- **2-Step 자동 분해**: 통장 입금 총액 대조 후 ➔ 주문번호별 수수료·반품·손실 자동 분류
		- **대표자명 자동 매핑**: 거래처 마스터와 연동해 대표자명 입금도 해당 법인 미수금에 즉시 연결
		- **충돌 시 자동 멈춤(HALT)**: 동명/동일 금액 발견 시 자동 처리 중단 ➔ 관리자 확인 팝업 호출
		- **가수금 전용 보관함**: 미확인 입금을 별도 테이블로 격리하고 관리자 권한으로 안전하게 통제
	</column>
</columns>

<empty-block/>

---

<empty-block/>

<span color="gray">CORE FEATURES</span>

## ⚙️ 핵심 해결 기능 3가지

<columns>
	<column ratio="33">
		### 01. B2C 2단계 정산 매칭
		**통장 입금 ↔ 쇼핑몰 정산 100% 대조**
		<empty-block/>
		- **1단계**: 통장 입금액과 플랫폼 총지급액 일치 여부 검증
		- **2단계**: 주문번호 단위로 뜯어서 플랫폼 수수료, 반품 환불, 파손 손실을 자동 라벨링
	</column>
	<column ratio="33">
		### 02. B2B 대표자명 교차 매칭
		**적요 불일치 스트레스 해결**
		<empty-block/>
		- 거래처 마스터에 `법인명`과 `대표자명`을 사전 등록
		- 통장 적요에 대표자 개인명이 찍혀도 해당 법인의 미수금 청구 내역과 자동 매핑
	</column>
	<column ratio="34">
		### 03. 회계 사고 방지 안전장치
		**동명/동일 금액 충돌 감지**
		<empty-block/>
		- 동일 명의 2건 이상 중복 청구 시 자동 매칭 즉시 중단
		- 관리자 확인 모달에서 사업자번호/계산서 비교 후 1-Click 수동 분개
	</column>
</columns>

<empty-block/>

---

<empty-block/>

<span color="gray">SYSTEM SCREEN & FLOW</span>

## 🖥️ 화면 구성 및 업무 흐름

### 1. 한눈에 보는 데이터 대사 워크플로우

```plain text
[은행 입금 엑셀 + 매출 원장 업로드]
                 ↓
┌───────────────────────┴───────────────────────┐
│ B2C (쇼핑몰) : 2단계 자동 분해                │ B2B (거래처) : 지능형 텍스트 매칭            │
│  - 1단계: 통장 총액 대조                      │  - 법인명 / 대표자명 교차 검색               │
│  - 2단계: 주문별 수수료/반품/손실 자동 분류   │  - 동명/동일금액 충돌 시 ⚠️ 수동 연결 팝업   │
└───────────────────────┬───────────────────────┘
                 ↓
      [대사 완료 및 대시보드 실시간 반영]
  (미수금 연령 분석 + 30일 초과 연체 경고 + 리스크 차트)
```

<empty-block/>

### 2. 주요 UI 화면

<columns>
	<column ratio="50">
		![대시보드 화면](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80)
		**대시보드 (KPI & 미수금 Aging)**
		- 실시간 대사율 및 가용 자금 현황 요약
		- 정산 기한(+30일) 초과 채권 붉은색 경고
		- 수수료/반품/파손 손익 누수 드릴다운 차트
	</column>
	<column ratio="50">
		![가수금 관리 화면](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80)
		**가수금 관리함 & 예외 처리 모달**
		- 미확인 입금 건 안전 격리 보관
		- 동명 거래처 후보 비교 및 원클릭 수동 연결
		- 재무 관리자 전용 권한 통제
	</column>
</columns>

<empty-block/>

---

<empty-block/>

<span color="gray">ROADMAP & STATUS</span>

## 📊 개발 진행 현황 (Milestones)

<columns>
	<column ratio="25">
		**Phase 1**
		<empty-block/>
		✅ 기반 인프라 구축
		<empty-block/>
		<span color="gray">Supabase DB 스키마, 사용자 권한 및 데이터 모델링 완료</span>
	</column>
	<column ratio="25">
		**Phase 2**
		<empty-block/>
		✅ 대사 엔진 구현
		<empty-block/>
		<span color="gray">통장 B2C/B2B 자동 분류 파서, 2-Step 매칭 및 대표자 교차 매칭 완료</span>
	</column>
	<column ratio="25">
		**Phase 3**
		<empty-block/>
		✅ 예외 처리 & 리스크 관리 UI
		<empty-block/>
		<span color="gray">동명 거래처 충돌 모달, 미확인 가수금 보관함, 미정산건 영업팀 이관 및 사후 조치(차월정산/대손상각) 완료</span>
	</column>
	<column ratio="25">
		**Phase 4**
		<empty-block/>
		✅ 대시보드 리포팅 & 엑셀 내보내기
		<empty-block/>
		<span color="gray">미수금 Aging 테이블, 리스크 시계열 차트, 4개 시트 전문 대사 보고서(.xlsx) 내보내기 완료</span>
	</column>
</columns>

<empty-block/>
