# 커밋 계획 (기능별 분리)

아래 순서대로 `git add` → `git commit` 실행하면 됩니다.

---

## 1. chore: .cursorrules 디자인 시스템 규칙 추가

```
chore: .cursorrules 디자인 시스템 규칙 추가

- Role & Vibe (Airy & Accessible)
- Tech Stack (Next.js, Tailwind, shadcn/ui)
- Design System (폰트, 스페이싱, 헤딩, radius, 색상)
- Shadcn/ui 사용 규칙
- 코드 생성 스타일
- 이미지→코드 워크플로우
- 한국어 더미 텍스트 규칙
```

**파일:** `.cursorrules`

---

## 2. feat(utils): 날짜·결제 유틸 확장

```
feat(utils): 날짜·결제 유틸 확장

- date: getUpcomingPaymentsInRange (날짜 범위 내 결제일 조회)
- date: getUpcomingPayments 버그 수정 (d=0 시작)
- payment-history: getPaymentHistoryFromStart (시작일 기준 월별 납입 기록)
- payment-history: getPaymentHistory 시그니처 확장 (investment_days, start_date, period_years)
```

**파일:** `app/utils/date.ts`, `app/utils/payment-history.ts`

---

## 3. feat(utils): 이번 달 납입 통계 유틸 추가

```
feat(utils): 이번 달 납입 통계 유틸 추가

- getThisMonthStats: 진행 중 투자 기준 이번 달 총 건수/완료 건수
- getPaymentEventsForMonth: 특정 월 납입 이벤트 목록
```

**파일:** `app/utils/stats.ts`

---

## 4. feat(ui): DateRangePicker 컴포넌트 추가

```
feat(ui): DateRangePicker 컴포넌트 추가

- shadcn 기반 날짜 범위 선택 컴포넌트
- 다가오는 투자 기간 선택용
```

**파일:** `components/ui/date-range-picker.tsx`, `components/shadcn-studio/date-picker/date-picker-02.tsx`

---

## 5. feat(ui): AppLayout 및 하단 네비게이션 추가

```
feat(ui): AppLayout 및 하단 네비게이션 추가

- AppLayout: 하단 네비 숨김 경로 처리 (login, add, auth)
- BottomNavigation: 홈/캘린더/통계/설정 탭
- 캘린더/설정/통계 페이지 스캐폴딩
- layout: AppLayout 래핑, metadata, lang=ko
```

**파일:** `app/components/AppLayout.tsx`, `app/components/BottomNavigation.tsx`, `app/calendar/page.tsx`, `app/settings/page.tsx`, `app/stats/page.tsx`, `app/layout.tsx`

---

## 6. feat(ui): UpcomingInvestments 기간 선택 및 커스텀 날짜 범위

```
feat(ui): UpcomingInvestments 기간 선택 및 커스텀 날짜 범위

- 프리셋 기간 선택 (오늘/3일/7일/보름/한달/1년)
- DateRangePicker로 커스텀 날짜 범위 선택
- 납입 완료 시 Undo 토스트
- records props로 변경 (items → records)
```

**파일:** `app/components/UpcomingInvestments.tsx`

---

## 7. feat(ui): 홈 이번 달 납입 현황 카드 추가

```
feat(ui): 홈 이번 달 납입 현황 카드 추가

- activeRecords 기반 thisMonthStats 계산
- 이번 달 납입 N건 중 M건 완료 카드
- /stats 링크
```

**파일:** `app/page.tsx`

---

## 8. feat(ui): InvestmentDetailView Airy 디자인 및 UX 개선

```
feat(ui): InvestmentDetailView Airy 디자인 및 UX 개선

- Airy 디자인: text-base, tracking-tight, py-6, rounded-xl
- 스크롤 시 헤더에 종목명 고정
- 월별 납입 기록: 시작일 기준, 이어서 보기 페이징
- 삭제 모달 폰트/버튼 크기 조정
```

**파일:** `app/components/InvestmentDetailView.tsx`

---

## 9. docs: PRD 업데이트

```
docs: PRD 업데이트

- PRD.md 내용 갱신
- docs/prd/ alarm-platform-pivot 추가
```

**파일:** `docs/PRD.md`, `docs/prd/alarm-platform-pivot.md`

---

## 실행 순서

```bash
# 1
git add .cursorrules
git commit -m "chore: .cursorrules 디자인 시스템 규칙 추가

- Role & Vibe (Airy & Accessible)
- Tech Stack (Next.js, Tailwind, shadcn/ui)
- Design System (폰트, 스페이싱, 헤딩, radius, 색상)
- Shadcn/ui 사용 규칙
- 코드 생성 스타일
- 이미지→코드 워크플로우
- 한국어 더미 텍스트 규칙"

# 2
git add app/utils/date.ts app/utils/payment-history.ts
git commit -m "feat(utils): 날짜·결제 유틸 확장

- date: getUpcomingPaymentsInRange (날짜 범위 내 결제일 조회)
- date: getUpcomingPayments 버그 수정 (d=0 시작)
- payment-history: getPaymentHistoryFromStart (시작일 기준 월별 납입 기록)
- payment-history: getPaymentHistory 시그니처 확장 (investment_days, start_date, period_years)"

# 3
git add app/utils/stats.ts
git commit -m "feat(utils): 이번 달 납입 통계 유틸 추가

- getThisMonthStats: 진행 중 투자 기준 이번 달 총 건수/완료 건수
- getPaymentEventsForMonth: 특정 월 납입 이벤트 목록"

# 4
git add components/ui/date-range-picker.tsx components/shadcn-studio/date-picker/date-picker-02.tsx
git commit -m "feat(ui): DateRangePicker 컴포넌트 추가

- shadcn 기반 날짜 범위 선택 컴포넌트
- 다가오는 투자 기간 선택용"

# 5
git add app/components/AppLayout.tsx app/components/BottomNavigation.tsx app/calendar/page.tsx app/settings/page.tsx app/stats/page.tsx app/layout.tsx
git commit -m "feat(ui): AppLayout 및 하단 네비게이션 추가

- AppLayout: 하단 네비 숨김 경로 처리 (login, add, auth)
- BottomNavigation: 홈/캘린더/통계/설정 탭
- 캘린더/설정/통계 페이지 스캐폴딩
- layout: AppLayout 래핑, metadata, lang=ko"

# 6
git add app/components/UpcomingInvestments.tsx
git commit -m "feat(ui): UpcomingInvestments 기간 선택 및 커스텀 날짜 범위

- 프리셋 기간 선택 (오늘/3일/7일/보름/한달/1년)
- DateRangePicker로 커스텀 날짜 범위 선택
- 납입 완료 시 Undo 토스트
- records props로 변경 (items → records)"

# 7
git add app/page.tsx
git commit -m "feat(ui): 홈 이번 달 납입 현황 카드 추가

- activeRecords 기반 thisMonthStats 계산
- 이번 달 납입 N건 중 M건 완료 카드
- /stats 링크"

# 8
git add app/components/InvestmentDetailView.tsx
git commit -m "feat(ui): InvestmentDetailView Airy 디자인 및 UX 개선

- Airy 디자인: text-base, tracking-tight, py-6, rounded-xl
- 스크롤 시 헤더에 종목명 고정
- 월별 납입 기록: 시작일 기준, 이어서 보기 페이징
- 삭제 모달 폰트/버튼 크기 조정"

# 9
git add docs/PRD.md docs/prd/
git commit -m "docs: PRD 업데이트

- PRD.md 내용 갱신
- docs/prd/ alarm-platform-pivot 추가"
```
