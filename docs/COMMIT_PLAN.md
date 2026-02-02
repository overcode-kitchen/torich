# 커밋 계획 (기능별 분리)

아래 순서대로 `git add` → `git commit` 실행하면 됩니다.
각 커밋 메시지는 변경 배경과 구체적 내용을 포함합니다.

---

## 1. chore: .cursorrules 디자인 시스템 규칙 추가

```
chore: .cursorrules 디자인 시스템 규칙 추가

- Role & Vibe: Senior Frontend Engineer 역할, Pixel-Perfect·Airy·Accessible UI 목표
- Tech Stack: Next.js App Router, Tailwind CSS, shadcn/ui, lucide-react
- Design System: text-base(16px) 기본, 넉넉한 스페이싱(gap-6, p-6, py-8)
- Headings: H1/H2/H3 tracking-tight, rounded-xl 기본 radius
- Colors: semantic colors 사용, raw hex 금지
- Shadcn/ui: 기존 @/components/ui 활용, Form(react-hook-form+zod) 래핑
- Code Style: Functional Components, cn() 유틸, md:/lg: 반응형
- Vibe Coding: 이미지→코드 4단계 워크플로우 (Analyze→Match→Implement→Refine)
- Korean: 더미 텍스트는 자연스러운 한국어 문장 사용
```

**파일:** `.cursorrules`

---

## 2. feat(utils): 날짜·결제 유틸 확장

```
feat(utils): 날짜·결제 유틸 확장

- getUpcomingPaymentsInRange: fromDate~toDate 범위 내 결제일 목록 반환
  - UpcomingInvestments 커스텀 날짜 범위 선택 시 사용
- getUpcomingPayments: d=0(오늘)부터 검사하도록 버그 수정
  - 기존 d=1~N은 오늘 제외되어 있었음
- getPaymentHistoryFromStart: 투자 시작일 기준 월별 납입 기록
  - investment_days, start_date, period_years로 해당 월 모든 납입일 완료 여부 판단
- getPaymentHistory: 시그니처 확장 (investment_days, start_date, period_years)
  - 기간 내 월만 포함, 시작 전/종료 후 월 제외
```

**파일:** `app/utils/date.ts`, `app/utils/payment-history.ts`

---

## 3. feat(utils): 이번 달 납입 통계 유틸 추가

```
feat(utils): 이번 달 납입 통계 유틸 추가

- getThisMonthStats: 진행 중 투자만 대상으로 이번 달 납입 통계
  - total: 총 납입 예정 건수 (investment_days × 투자 수)
  - completed: localStorage 기반 완료 건수
  - 홈 화면 "이번 달 납입 N건 중 M건 완료" 카드용
- getPaymentEventsForMonth: 특정 연·월의 모든 납입 이벤트 목록
  - stats/캘린더 페이지에서 월별 납입 일정 표시용
```

**파일:** `app/utils/stats.ts`

---

## 4. feat(ui): DateRangePicker 컴포넌트 추가

```
feat(ui): DateRangePicker 컴포넌트 추가

- react-day-picker 기반 날짜 범위 선택 컴포넌트
- shadcn/ui 스타일 적용, from~to 날짜 범위 선택
- UpcomingInvestments에서 "다가오는 투자" 기간을 커스텀으로 지정할 때 사용
- components/shadcn-studio/date-picker-02 참조하여 구현
```

**파일:** `components/ui/date-range-picker.tsx`, `components/shadcn-studio/date-picker/date-picker-02.tsx`

---

## 5. feat(ui): AppLayout 및 하단 네비게이션 추가

```
feat(ui): AppLayout 및 하단 네비게이션 추가

- AppLayout: children 래핑, 하단 네비 숨김 경로 처리
  - /login, /add, /auth* 에서는 BottomNavigation 미표시
  - pb-20로 하단 네비 높이만큼 여백 확보
- BottomNavigation: 홈(/), 캘린더(/calendar), 통계(/stats), 설정(/settings) 탭
- app/calendar, app/settings, app/stats 페이지 스캐폴딩
- layout: AppLayout 래핑, metadata(title/description), html lang=ko
```

**파일:** `app/components/AppLayout.tsx`, `app/components/BottomNavigation.tsx`, `app/calendar/page.tsx`, `app/settings/page.tsx`, `app/stats/page.tsx`, `app/layout.tsx`

---

## 6. feat(ui): UpcomingInvestments 기간 선택 및 커스텀 날짜 범위

```
feat(ui): UpcomingInvestments 기간 선택 및 커스텀 날짜 범위

- 프리셋 기간: 오늘(1일)/3일/7일/보름(15일)/한달(30일)/1년(365일) 드롭다운
- DateRangePicker: 커스텀 날짜 범위 선택 시 캘린더 UI
- 납입 완료 체크 시 Undo 토스트 (5초 내 실행 취소 가능)
- props 변경: items → records (Investment[] 직접 전달, 내부에서 결제일 계산)
- clearPaymentCompleted: localStorage에서 완료 기록 제거 (Undo용)
```

**파일:** `app/components/UpcomingInvestments.tsx`

---

## 7. feat(ui): 홈 이번 달 납입 현황 카드 추가

```
feat(ui): 홈 이번 달 납입 현황 카드 추가

- activeRecords: 진행 중 투자만 필터 (isCompleted 제외)
- thisMonthStats: getThisMonthStats(activeRecords)로 이번 달 총/완료 건수
- "이번 달 납입 N건 중 M건 완료" 카드 추가 (records 있고 total>0일 때만)
- 카드 클릭 시 /stats로 이동 (자세히 보기)
- UpcomingInvestments에 records 전달 (기존 upcomingItems 제거)
```

**파일:** `app/page.tsx`

---

## 8. feat(ui): InvestmentDetailView Airy 디자인 및 UX 개선

```
feat(ui): InvestmentDetailView Airy 디자인 및 UX 개선

- Airy 디자인 시스템 적용
  - 본문 text-base(16px), 헤딩 tracking-tight
  - 섹션 py-5→py-6, pb-10→pb-12, 다음 투자일 박스 py-5 px-5
  - H2 text-3xl font-semibold, H3 text-lg font-semibold
  - 투자 정보 행(월 투자금/목표 기간/연 수익률 등) text-base
  - 삭제 모달 제목 text-xl, 버튼 text-base
- 스크롤 시 헤더에 종목명 고정 (IntersectionObserver)
  - titleRef로 종목명 영역 감지, 스크롤 시 showStickyTitle
- 월별 납입 기록: 시작일 기준, "이어서 보기" 페이징
  - getPaymentHistoryFromStart 사용, visiblePaymentMonths 6→+10씩 증가
```

**파일:** `app/components/InvestmentDetailView.tsx`

---

## 9. docs: PRD 업데이트

```
docs: PRD 업데이트

- PRD.md: 최신 요구사항 및 구조 반영
- docs/prd/alarm-platform-pivot.md: 알림 플랫폼 피벗 관련 PRD 추가
```

**파일:** `docs/PRD.md`, `docs/prd/alarm-platform-pivot.md`

---

## 10. docs: 기능별 커밋 계획 문서 추가

```
docs: 기능별 커밋 계획 문서 추가

- docs/COMMIT_PLAN.md: 기능별 커밋 분리 가이드 및 상세 메시지
- 향후 유사 작업 시 참고용
```

**파일:** `docs/COMMIT_PLAN.md`
