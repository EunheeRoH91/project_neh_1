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
		**프로젝트 유형**
		재무·자금 자동화 도구 개발
	</column>
	<column ratio="25">
		**주요 기술 스택**
		React, TypeScript, Supabase (PostgreSQL)
	</column>
	<column ratio="25">
		**담당 역할**
		도메인 설계, PRD/디자인 수립, 대사 로직 구현
	</column>
	<column ratio="25">
		**프로젝트 상태**
		프로토타입 개발 및 고도화 진행 중 (Phase 1~2)
	</column>
</columns>

<empty-block/>

---

<empty-block/>

<span color="gray">01 / BACKGROUND</span>

## Background (업무 배경)

다양한 판매 채널(자사몰, 네이버 스마트스토어, 쿠팡, B2B 도매 거래)을 통해 매출이 발생하는 환경에서는, 매월 수만 건의 판매 데이터와 실제 은행 계좌 입금 내역(Bank Statements)을 일일이 교차 검증(Reconciliation)하는 대규모 정산 작업이 수반됩니다.

특히 플랫폼별로 정산 주기와 차감 수수료율이 상이하고, B2B 거래의 경우 거래처 법인명 대신 대표자 개인명으로 입금되는 등 실무 현장의 불일치 요소가 빈번하게 발생하여, 전통적인 엑셀 수작업 방식으로는 마감 기한 준수와 자금 통제에 심각한 병목이 초래되었습니다.

<empty-block/>

---

<empty-block/>

<span color="gray">02 / PROBLEM</span>

## Problem (직면했던 실무 문제)

실무 과정에서 확인된 핵심적인 비효율과 위험 요인은 다음과 같았습니다.

1. **엑셀 수작업 대사의 한계와 인적 오류 (Human Error)**
   월 수만 건의 데이터를 엑셀 `VLOOKUP`과 복사-붙여넣기에 의존하면서 작업 피로도가 극에 달하고, 오수식이나 누락으로 인한 장부 오차 위험이 상존했습니다.
2. **B2B 입금 적요 불일치 및 동명·동일 금액 충돌 (Collision Risk)**
   세금계산서는 법인명으로 발행되었으나 입금은 대표자명으로 들어오거나, 동일한 금액의 청구 건을 가진 복수의 동명 거래처가 존재할 때 자동 매칭을 시도하면 심각한 회계 분개 왜곡이 발생했습니다.
3. **손익 누수(Risk) 파악의 어려움**
   플랫폼에서 일괄 차감하는 정산 수수료, 반품 환불액, 배송 파손 손실 등이 덩어리 금액 뒤에 가려져 있어, 원천 거래 단위의 손익 누수를 적시에 추적하기 어려웠습니다.
4. **미확인 가수금 방치 및 내부통제(Internal Control) 부재**
   통장에 돈은 들어왔으나 매출 출처를 알 수 없는 '가수금'이 엑셀에 방치되어 관리 사각지대가 생기고, 권한 구분 없는 시트 공유로 민감 재무 정보 유출 위험이 있었습니다.

<empty-block/>

---

<empty-block/>

<span color="gray">03 / APPROACH</span>

## Approach (해결 전략 및 개선 방향)

단순한 수식 매크로를 넘어, **신뢰할 수 있는 데이터베이스와 룰 기반 엔진을 갖춘 웹 기반 자동화 도구**로 패러다임을 전환했습니다.

- **B2C 2-Step 대사 엔진 구축**: 플랫폼 총지급액 덩어리 대사(1단계) ➔ 주문번호 기준 수수료/반품/파손 원천 거래 분해(2단계)로 대사 정확도 100% 확보
- **B2B 지능형 매핑 및 자동 중단(HALT) 안전장치**: 거래처 마스터의 대표자명 교차 매핑 지원, 동명/동일 금액 2건 이상 충돌 시 임의 매칭을 즉시 차단하고 자금 관리자 수동 연결 모달 호출
- **가수금 보관함 분리 및 엄격한 RLS 보안 통제**: 원천 불명 입금 건을 `suspense_amounts` 테이블로 자동 격리하고, Supabase Row Level Security(RLS)를 통해 관리자 외 접근 차단
- **미수금(AR) 연령 분석 및 드릴다운 대시보드**: 정산 예정일(+30일) 기준 악성 연체 채권 붉은색 경고 하이라이트 및 리스크 파이/라인 차트 제공

<empty-block/>

---

<empty-block/>

<span color="gray">04 / IMPLEMENTATION</span>

## Implementation (구체적 시스템 구현)

### 1. 전체 데이터 대사 워크플로우

```plain text
[은행 입금 내역 + 매출/정산 원장 업로드]
                 ↓
       < 거래 유형 자동 판별 >
      ┌──────────┴──────────┐
[B2C (자사몰/오픈마켓)]    [B2B (세금계산서/도매)]
      ↓                             ↓
1단계: 총액 덩어리 대사        적요 텍스트 & 금액 기반 검색
  - 1원 단위까지 100% 일치?       - 법인명/대표자명 교차 매핑
  - 불일치 시 가수금 격리          - 일치 후보 N건 확인
      ↓                             ↓
2단계: 주문번호별 상세 분해    [1건 일치] ➔ 즉시 매칭 제안
  - 수수료/반품/손실 자동 분류  [2건 충돌] ➔ 자동중단 & 수동연결 팝업
      ↓                        [0건]      ➔ 가수금 보관함 적재
[대사 확정 및 리스크 DB 적재]               ↓
                 └──────────────┬─────────────┘
                                ↓
        [대시보드 실시간 반영 (AR Aging, 리스크 차트)]
```

<empty-block/>

### 2. 핵심 대시보드 화면 및 기능

![대시보드 UI 화면](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80)
<span color="gray">📷 [대시보드 화면 영역] KPI 카드, 가용 자금 현황, AR Aging 분석표 및 리스크 차트 캡처를 등록하세요.</span>

- **가용 자금 & 실시간 대사율**: 총 발생 매출액 대비 누적 입금 완료액 및 대사율(`Reconciliation Rate`) 실시간 집계
- **미수금(AR) Aging Table**: 매출 인식일 기준 `+30일` 초과 건 붉은색 배지(`OVERDUE`) 하이라이트
- **인터랙티브 드릴다운 리스크 차트**: 플랫폼 수수료, 반품, 파손액 파이/라인 차트 클릭 시 원천 주문 레코드 즉시 필터링 표출

<empty-block/>

### 3. 예외 처리 & 데이터베이스 내부통제 (RLS)

![가수금 관리 및 예외 처리 UI](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80)
<span color="gray">📷 [예외 처리 화면 영역] 동명 거래처 충돌 모달, 가수금 관리함, 또는 데이터베이스 스키마 다이어그램을 등록하세요.</span>

- **동명/동일 금액 중복 충돌 모달**: 후보 거래처 N개의 사업자번호, 세금계산서 발행번호, 미수 잔액을 한 화면에서 비교하여 실무자가 1-Click 수동 분개
- **Supabase RLS 보안 정책**:
  ```sql
  -- 관리자(admin) 및 경영진(executive)만 가수금 테이블 조회 가능
  CREATE POLICY "Allow admin and executive to read suspense_amounts"
  ON public.suspense_amounts FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'executive'))
  );
  ```

<empty-block/>

---

<empty-block/>

<span color="gray">05 / EVIDENCE & STATUS</span>

## Evidence & Status (성과 및 현재 상태)

### 1. 구체적 개선 성과 및 기대 효과

- **대사 자동화율 목표 80% 이상 달성**: 정형화된 B2C 2-Step 및 정형 B2B 건의 즉각 자동 상계로 수작업 공수 획기적 단축
- **회계 사고 원천 차단**: 동명 거래처 중복 시 자동 중단 및 대표자명 교차 검증을 통해 오분개 및 오정산 위험 방지
- **투명한 감사 추적(Audit Trail)**: 모든 수동 연결 및 가수금 해소 내역에 처리자 ID, 일시, 사유를 영구 보존하여 회계 투명성 확보

### 2. 현재 개발 진행 상태 (Milestones)

- **Phase 1 (기반 인프라 & DB 모델링)**: ✅ 완료 — Supabase Auth, Profiles, 6개 핵심 테이블 스키마 및 RLS 정책 수립
- **Phase 2 (핵심 대사 알고리즘 & 파서)**: 🔄 개발 진행 중 — 엑셀/CSV 데이터 파서 및 B2C 2-Step / B2B 대표자명 매칭 로직 프로토타입 구현
- **Phase 3~4 (예외 처리 UI & 대시보드 리포팅)**: 📅 예정 — 동명 충돌 팝업 모달, AR Aging 테이블 및 Recharts 드릴다운 연동

> **실무자의 코멘트:** 과거 단순 엑셀 매크로로 해결하던 정산 작업을, 실제 실무 환경에서 마주치는 '대표자명 불일치', '가수금 보안 누수', '중복 입금 충돌' 등의 현실적 문제를 해결할 수 있는 독립형 정산 자동화 웹 도구로 발전시키고 있습니다.

<empty-block/>
