# [DESIGN SYSTEM] 매출/정산 및 입금 대사 자동화 시스템 디자인 가이드
(Design System: Trust & Financial Professionalism)

---

## 1. 디자인 철학 및 콘셉트 (Design Philosophy)

### 1.1. 콘셉트: 신뢰와 전문성 (Trust & Financial Authority)
본 시스템은 금융, 대기업 재무팀, C-Level 경영진 공식 리포팅을 위한 **고신뢰도 자금 관리 도구**입니다.
시각적 현혹을 지양하고, **정확한 숫자 전달**, **이성적인 리스크 인지**, **직관적인 내부통제 플로우**를 제공하기 위해 클래식 비즈니스 금융 팔레트와 정돈된 카드 기반 대시보드 레이아웃을 채택합니다.

* **Clean White & Soft Gray Structure**: 슬라이드 및 보고서에 최적화된 연회색(`#F8FAFC`) 캔버스 위에 순백색(`#FFFFFF`) 컨테이너를 배치하여 데이터 시인성을 극대화합니다.
* **Clarity & Hierarchy**: 다크 네이비(`#0F172A`)로 숫자의 무게감을 잡고, 로얄 블루(`#1E40AF`)로 핵심 액션을 유도하며, 스카이 블루(`#38BDF8`)로 차트와 추이를 경쾌하게 보조합니다.
* **Audit-ready Precision**: 1원 단위 금액과 정산 기한(+30일)의 정상/연체 구분을 명확한 기능성 배지와 정밀한 타이포그래피로 구현합니다.

---

## 2. 컬러 시스템 (Color Palette Specification)

### 2.1. 코어 브랜드 및 테마 팔레트 (Core Palette)

| 색상 명칭 | HEX 코드 | Tailwind 매핑 | 시각적 역할 및 용도 |
| :--- | :--- | :--- | :--- |
| **Dark Navy** | `#0F172A` | `slate-900` | • 주요 제목, 고중량 헤드라인, 핵심 금액 숫자<br>• 최고 권한(Admin) 강조 및 묵직한 베이스 텍스트 |
| **Royal Blue** | `#1E40AF` | `blue-800` | • **메인 브랜드 및 액션 컬러**<br>• 프라이머리 버튼, 활성화된 사이드바 메뉴, 확정 승인 버튼 |
| **Sky Blue** | `#38BDF8` | `sky-400` | • **보조 포인트 및 차트 강조 컬러**<br>• 라인 차트 포인트, 대사율 게이지, 서브 배지 |
| **Soft Gray** | `#F8FAFC` | `slate-50` | • **전체 웹페이지 및 대시보드 메인 배경색**<br>• 장시간 데이터 분석 시 눈의 피로도를 낮추는 미색 |
| **Pure White** | `#FFFFFF` | `white` | • 위젯 카드, 테이블, 팝업 모달의 컨테이너 배경 |

### 2.2. 상태 및 기능성 시맨틱 컬러 (Functional Semantic Colors)

| 상태 명칭 | HEX 코드 | 용도 및 컴포넌트 |
| :--- | :--- | :--- |
| **Success (정상/완료)** | `#059669` / `#ECFDF5` | 🟢 정산 완료, 대사 일치 건, 정상 채권 배지 |
| **Critical / Overdue (연체/위험)** | `#DC2626` / `#FEF2F2` | 🔴 **기한 초과 악성 채권 (+30일 경과)**, 수수료 초과 차감 경고 |
| **Warning / Suspense (가수금/충돌)** | `#D97706` / `#FFFBEB` | ⚠️ **동명/동일 금액 중복 충돌 경고**, 미확인 가수금 보관함 |
| **Neutral Border** | `#E2E8F0` / `#CBD5E1` | 카드 테두리, 테이블 구분선, 폼 인풋 보더 |

---

## 3. 타이포그래피 시스템 (Typography Hierarchy)

* **기본 폰트**: `-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif`
* **숫자 폰트 (Financial Figures)**: 등폭 특성이 우수한 Tabular figures 및 Monospace를 함께 활용하여 자릿수 대조 편의성 보장.

| 레벨 | 폰트 크기 | 굵기 (Weight) | 라인 높이 | 적용 대상 |
| :--- | :--- | :--- | :--- | :--- |
| **Display KPI** | `28px (1.75rem)` | Bold (700) | `1.2` | 대시보드 최상단 핵심 금액(총 매출, 누적 입금) |
| **H1 (Page Title)** | `20px (1.25rem)` | Bold (700) | `1.3` | 페이지 타이틀, 모달 타이틀 |
| **H2 (Section Header)**| `16px (1.0rem)` | Semi-Bold (600) | `1.4` | 차트 위젯 제목, 테이블 타이틀 |
| **Body (Main)** | `14px (0.875rem)` | Regular (400) / Med (500) | `1.5` | 본문, 테이블 셀 텍스트, 설명 문구 |
| **Caption / Badge** | `12px (0.75rem)` | Semi-Bold (600) | `1.4` | 상태 배지, 연령 분석(+30d), 보조 메타데이터 |

---

## 4. 레이아웃 구조 (Layout & Architecture)

샘플 대시보드 UI를 기반으로 좌측 사이드바와 상단 헤더, 메인 작업 영역의 3분할 구조를 적용합니다.

```
┌───────────────┬────────────────────────────────────────────────────────┐
│ [브랜드 로고] │ [상단 헤더] 검색바 | 기간/채널 필터 | 🛡️ RBAC 역할 스위처    │
├───────────────┼────────────────────────────────────────────────────────┤
│ [사이드바]    │ [KPI Summary] 5개 지표 카드 (스파크라인 & 증감율 배지)   │
│ - 대시보드    ├────────────────────────────┬───────────────────────────┤
│ - 입금 대사   │ [차트 1] 리스크 비중 (Pie) │ [차트 2] 주차별 추이 (Line)│
│ - 가수금 관리 │ (도넛 차트 + 드릴다운)     │ (로얄블루 & 스카이블루 라인) │
│ - 거래처 마스터├────────────────────────────┴───────────────────────────┤
│               │ [미수금(AR) 연령 분석표]                                 │
│               │ +30일 초과 악성 채권 붉은색 경고 & 거래처 대표자명 표기   │
└───────────────┴────────────────────────────────────────────────────────┘
```

### 4.1. 컴포넌트 규격
* **Card Container**: `bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.06)]`
* **KPI Card**: 상단 지표명 + 아이콘, 중앙 굵은 숫자(`#0F172A`), 하단 증감율 배지(`#1E40AF` 또는 `#059669`)
* **Sidebar Menu**: 기본 `text-slate-600 hover:bg-slate-100`, 활성 상태 `bg-blue-50 text-blue-800 font-bold border-r-4 border-blue-800`
* **Modal Dialog**: 백드롭 `bg-slate-900/40 backdrop-blur-sm`, 모달 본체 `bg-white rounded-2xl shadow-2xl border border-slate-200`

---

## 5. 차트 & 시각화 스타일 가이드 (Charts & Data Viz)

1. **차감 리스크 파이/도넛 차트 (PieChart)**
   * 중앙 도넛형 구조 (`innerRadius: 65`, `outerRadius: 95`)
   * 범례 레이블 및 컬러 명세 (컴팩트 11px 단일 행 렌더링):
     * **정산수수료**: Royal Blue (`#1E40AF`)
     * **반품/취소**: Rose (`#DC2626`)
     * **파손/사고**: Sky Blue (`#38BDF8`)
     * **기타**: Slate (`#94A3B8`)
   * 범례 레이아웃 규칙: `whitespace-nowrap`, `text-[11px]`로 줄바꿈 없이 **단일 행(한 줄)**으로 정렬
   * 상호작용: 파이 섹션 호버 시 스케일 확대, 클릭 시 원천 거래 내역 드릴다운 모달 오픈
   * **마우스 호버 툴팁 (Custom Tooltip)**:
     * 컴팩트 화이트 카드 (`bg-white/95 rounded-xl border border-slate-200/90 shadow-lg`)
     * 텍스트 크기: `text-[11px]` (카테고리명) + `text-xs font-bold font-mono` (금액)
     * 시각 인디케이터: 카테고리 컬러 `w-2 h-2 rounded-full` 닷 표기

2. **주차별 리스크 시계열 라인 차트 (LineChart)**
   * 부드러운 자연 곡선(`type="monotone"`)
   * 주 라인 두께: `strokeWidth={2}`
   * 그리드 라인: 미세한 점선(`stroke="#F1F5F9"`)
   * 범례: 파이 차트와 동일하게 `정산수수료 / 반품/취소 / 파손/사고 / 기타` 단일 행 표시
   * **주간 손실 툴팁 (Custom Tooltip)**:
     * 상단: 주차 라벨 (`text-[11px] font-bold`) + 구분선
     * 본문: 각 지표별 `1.5px` 컬러 닷 + `11px` 라벨 + 굵은 등폭 숫자 (`font-mono`) 정렬

3. **미수금 연령 분석 (Aging Table)**
   * 정상 채권: `bg-emerald-50 text-emerald-700 border-emerald-200` (🟢 정상 채권)
   * 기한 초과 악성 채권: `bg-rose-50 text-rose-700 border-rose-200 animate-pulse` (🔴 기한 초과 악성 채권)

---

## 6. 인터랙션 및 마이크로 인터랙션 (Interactions)

* **버튼 호버**: `transition-all duration-150 active:scale-[0.98]`
* **테이블 행 호버**: `hover:bg-slate-50/80`
* **RBAC 역할 전환**: 선택된 권한에 따라 화면 상단에 인라인 경고 바 및 RLS 차단 안내 즉시 갱신
* **동명 거래처 수동 분개 팝업**: 선택된 라디오 후보 박스에 `ring-2 ring-blue-700 bg-blue-50/30` 하이라이트 부여
