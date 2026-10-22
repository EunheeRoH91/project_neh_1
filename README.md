# 📊 FinanceFlow: 다채널 매출/정산 및 입금 대사 자동화 시스템

> **기업 자금/재무팀 전용 통합 정산 및 내부통제 자동화 플랫폼**  
> 다채널(B2B 도매, 스마트스토어, 쿠팡, 자사몰 PG) 매출 데이터와 은행 통장 입금 내역(Bank Statement)을 교차 검증하고, AI 텍스트 분석 및 룰 기반 엔진으로 미수금(AR), 수익 누수 리스크(수수료/반품/파손), 미확인 입금액(가수금)을 강력하게 통제합니다.

---

## 🚀 주요 기능 (Key Features)

### 1. Supabase 기반 역할별 권한 통제 (RBAC & RLS)
- **자금/재무 관리자 (Admin)**: 전체 읽기/쓰기, 정산 대사 매칭, 동명 충돌 가수금 수동 분개 승인.
- **경영진/CFO (Executive)**: 전사 요약 대시보드 및 리스크/가수금 모니터링 (경영 리포팅 전용).
- **영업 관리자 (Viewer)**: 담당 거래처 실적 및 확정 미수금만 열람 가능. **미확인 가수금(`suspense_amounts`)은 PostgreSQL RLS(Row Level Security) 정책으로 조회 원천 차단**.

### 2. 핵심 대시보드 & 리스크 시각화
- **자금 흐름 요약 KPI**: 총 발생 매출액, 누적 입금액, 미수금(AR) 총액, 기한 초과 악성 채권, 미확인 가수금 실시간 집계.
- **리스크 비중 분석 (Donut Chart)**: 플랫폼 수수료, 반품/취소, 파손 손실 점유율 시각화 및 **영역 클릭 시 원천 거래 내역 드릴다운(Drill-down)** 지원.
- **주차별 리스크 발생 추이 (Line Chart)**: 프로모션 및 반품 급증 이상 징후 조기 탐지.
- **거래처별 미수금(AR) 묶음표 (Aging Ledger)**: 동일 거래처 복수 주문건을 한 줄로 그룹핑하고, 행 클릭 시 개별 주문/청구 내역 아코디언 펼침 지원.

### 3. 다채널 정산 대사 엔진 (Data Matching Engine)
- **B2C (오픈마켓/자사몰) 2-Step 대사**:
  1. *Step 1*: 은행 입금 덩어리 대조 (지급액 불일치 시 미확인 가수금 보관함으로 자동 이관)
  2. *Step 2*: 주문번호 기준 원장 매칭 및 차액을 4대 리스크(수수료, 반품, 파손, 기타)로 분해
- **B2B (세금계산서) 텍스트 + 금액 매칭**:
  - 통장 적요란에 법인명이 아닌 **대표자 개인명**이 찍히더라도 거래처 마스터와 교차 대조하여 자동 매칭 제안.

### 4. 회계 사고 차단 예외 처리 & 내부통제 (Edge Cases & Exception Handling)
- **동명/동일 금액 중복 충돌 감지**: 동명 대표자 및 동일 금액 청구건이 2건 이상 존재할 경우 자동 매칭을 즉각 중단하고 가수금 보관함으로 격리.
- **수동 분개 대조 UI**: 충돌난 후보 거래처를 나란히 비교하고, 자금 관리자가 확인 후 라디오 버튼으로 1건을 수동 확정.
- **내부통제 감사 기록 (Audit Trail)**: 모든 대사 및 수동 분개 이력을 타임스탬프와 함께 영구 기록.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Data Visualization**: Recharts
- **Backend / Database**: Supabase (PostgreSQL, Row Level Security, Auth RBAC)
- **Icons & UI**: Lucide Icons, Custom Design System (`#0F172A`, `#1E40AF`, `#38BDF8`, `#F8FAFC`)

---

## 💻 로컬 실행 방법 (Getting Started)

### 1. 저장소 클론 및 패키지 설치
```bash
git clone https://github.com/EunheeRoH91/project_neh_1.git
cd project_neh_1
npm install
```

### 2. 환경 변수 설정 (.env)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 개발 서버 구동
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속합니다.

---

## 📁 프로젝트 구조 (Architecture)

```
project_neh_1/
├── src/
│   ├── types/database.ts     # Supabase DB 타입 정의
│   ├── lib/supabaseClient.ts # Supabase 클라이언트 설정
│   ├── App.tsx               # 통합 대시보드 및 대사 워크스페이스
│   ├── main.tsx              # 앱 엔트리포인트
│   └── index.css             # Tailwind 글로벌 스타일
├── supabase/
│   └── migrations/           # PostgreSQL RLS 및 RBAC 스키마 마이그레이션 SQL
├── PRD.md                    # 제품 요구사항 정의서 (PRD)
├── DESIGN.md                 # UI/UX 금융 전문 디자인 가이드
└── package.json
```
