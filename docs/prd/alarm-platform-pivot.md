# PRD: 알림 기반 플랫폼 전환

| 항목 | 내용 |
|------|------|
| **기능명** | 알림 기반 플랫폼 전환 |
| **우선순위** | P0 |
| **한 줄 설명** | 복리계산기에서 매월 투자일·납입 관리 중심의 알림 플랫폼으로 전환 |
| **버전** | 1.1 |
| **작성일** | 2025-01-15 |
| **최종 수정** | 2025-01-15 |

---

## 1. Executive Summary

- Torich는 **복리 시뮬레이터**에서 **매월 투자일 알림·납입 관리** 중심 플랫폼으로 피벗한다.
- 30대 초반 직장인 타깃이 **다가오는 투자일**을 한 화면에서 보고, **종목별 알림 ON/OFF**로 수신 여부를 제어할 수 있게 한다.
- **하단 네비게이션**(홈, 통계, 캘린더, 설정), **통계/캘린더 페이지**, **기간 선택(DateRangePicker)** 등이 구현되어 있다.

---

## 2. 네비게이션 & 레이아웃

### 2.1 하단 네비게이션

| 항목 | 스펙 |
|------|------|
| **탭** | 홈(/), 통계(/stats), 캘린더(/calendar), 설정(/settings) |
| **숨김 경로** | /login, /add, /auth (및 하위) |
| **UI** | fixed bottom, 4탭, 활성 시 text-brand-600 |
| **패딩** | 네비 숨김 시 pb-20, 표시 시 pb-20 + 하단 nav 높이 |

### 2.2 AppLayout

- `HIDE_NAV_PATHS`에 해당하는 경로에서는 BottomNavigation 미렌더링.
- 그 외 경로에서는 `pb-20`으로 하단 여백 확보.

---

## 3. 대시보드 (메인)

### 3.1 예상 자산 배너

- **N년 뒤** 드롭다운: 1/3/5/10/30년 선택. `Button variant="outline"` 스타일.
- 예상 자산 금액 표시.
- 만기 안내 문구 (클릭 시 CashHoldItemsSheet).
- 월 납입 pill (우측 하단): "월 N만원씩 투자 중".

### 3.2 다가오는 투자

| 항목 | 스펙 |
|------|------|
| **위치** | 총 자산 배너 아래, "투자 목록 추가하기" 버튼 위. `activeRecords.length > 0`일 때만 렌더링. |
| **기간 선택** | 프리셋: 오늘, 3일, 7일, 보름, 한달, 1년. **기간 선택** 시 DateRangePicker로 날짜 범위 선택. |
| **기본값** | 프리셋 7일. 기간 선택 시 오늘~7일 후. |
| **UI** | 카드: `bg-white rounded-3xl p-6`. 제목: "📅 다가오는 투자". 드롭다운 버튼: 화살표 없음, outline 스타일. |
| **리스트** | 날짜·종목명(왼쪽), 월 투자금 + **완료하기** 버튼(오른쪽). 체크 아이콘 없음. |
| **완료** | "완료하기" 클릭 → localStorage 저장 → 항목 즉시 사라짐. |
| **되돌리기** | 완료 후 5초간 토스트("완료됨" + "되돌리기" 버튼). 되돌리기 시 localStorage 제거 후 목록 복원. |
| **데이터** | 프리셋: `getUpcomingPayments(records, days)`. 기간 선택: `getUpcomingPaymentsInRange(records, from, to)`. |

### 3.3 이번 달 현황 카드

- "이번 달 납입: N건 중 M건 완료". `/stats` 링크.
- `thisMonthStats.total > 0`일 때만 표시.

### 3.4 내 투자 목록

- 필터: 전체/진행 중/종료.
- 정렬: 평가금액/월 투자액/이름/다음 투자일 순.
- 카드 클릭 시 InvestmentDetailView.

---

## 4. 통계 페이지 (/stats)

| 항목 | 스펙 |
|------|------|
| **이번 달 납입 현황** | N건 중 M건 완료, 프로그레스 바. |
| **기간별 완료율** | 프리셋: 이번 달, 최근 3/6/12개월. **기간 선택** 시 DateRangePicker. |
| **기본값** | 최근 6개월. 기간 선택 시 7일 전~오늘. |
| **완료율 %** | 선택 기간 내 월별 완료율 평균. |
| **월별 차트** | BarChart, 0~100% Y축. |
| **총 납입 금액** | 선택 기간 내 완료된 건만 합산. 월평균 표시. |
| **스트릭** | 제거됨. |

---

## 5. 캘린더 페이지 (/calendar)

| 항목 | 스펙 |
|------|------|
| **월 네비게이션** | 이전/다음 월. |
| **캘린더 그리드** | 일~토, 날짜별 마커: 완료(초록), 미완료(빨강), 예정(회색). |
| **날짜 선택** | 해당 날짜의 투자 목록 표시. 완료됨 / 완료하기 버튼. |
| **완료** | "완료하기" 클릭 시 localStorage 저장. |

---

## 6. 설정 페이지 (/settings)

| 항목 | 스펙 |
|------|------|
| **전체 알림** | ON/OFF 토글. `torich_notification_global` localStorage. |
| **계정** | 로그인 이메일 표시, 로그아웃 버튼. |
| **앱 정보** | 버전 1.0.0, 문의하기, 이용약관, 개인정보처리방침. |

---

## 7. 투자 상세 (InvestmentDetailView)

### 7.1 헤더

- 뒤로가기, **스크롤 시 종목명 고정**, 알림/메뉴.
- **종목명 고정**: Intersection Observer로 큰 종목명이 뷰포트를 벗어나면 헤더에 작은 종목명(text-sm) 표시. 스크롤 시에만 표시.

### 7.2 콘텐츠 구조

1. **종목명 & 상태** (h2 text-2xl), 다음 투자일 카드.
2. **진행률** (text-sm).
3. **투자 정보** (text-sm): 월 투자금, 목표 기간, 연 수익률, 매월 투자일, 총 원금, 예상 수익, **만기 시 예상 금액**.
   - 만기 시 예상 금액은 총 원금/예상 수익과 동일한 행 스타일로 표시. 별도 강조 없음.
4. **월별 납입 기록** (하단 배치).

### 7.3 월별 납입 기록

| 항목 | 스펙 |
|------|------|
| **데이터** | `getPaymentHistoryFromStart`: 투자 **시작일부터** 오늘까지. |
| **위치** | 투자 정보 섹션 아래. |
| **페이징** | 기본 6개월 표시. "이어서 보기" 클릭 시 10개월씩 추가. |
| **테이블** | 월(YYYY.MM), 투자일, 납입 금액, 상태. text-sm. |
| **상태** | ✓ 완료됨 / ✗ 미완료. 해당 월의 **모든 납입일** 완료 시에만 완료. |

### 7.4 UI 계층

- 상세 내역 텍스트: **14px (text-sm)**.
- 섹션 제목: text-sm font-bold.

---

## 8. 용어 & UI 일관성

| 구분 | 표시 |
|------|------|
| **액션 버튼** | "완료하기" (클릭 시 완료 처리) |
| **상태** | "✓ 완료됨" (이미 완료된 상태) |

---

## 9. Technical Requirements

### 9.1 상태 저장 (localStorage)

| 키 | 값 | 용도 |
|----|-----|------|
| `torich_completed_{id}_{YYYY-MM}_{day}` | ISO 8601 일시 | 납입 완료 체크 |
| `torich_notification_{id}` | "1"/"0" | 종목별 알림 ON/OFF |
| `torich_notification_global` | "1"/"0" | 전체 알림 ON/OFF |

### 9.2 날짜/납입 로직

| 파일 | 함수 |
|------|------|
| `app/utils/date.ts` | `getNextPaymentDate`, `getDaysUntilNextPayment`, `getUpcomingPayments`, `getUpcomingPaymentsInRange` |
| `app/utils/payment-history.ts` | `getPaymentHistory`, `getPaymentHistoryFromStart` |
| `app/utils/stats.ts` | `getThisMonthStats`, `getPeriodTotalPaid`, `getMonthlyCompletionRates`, `getPaymentEventsForMonth`, `isPaymentEventCompleted`, `getMonthlyCompletionRatesForRange`, `getPeriodTotalPaidForRange` |

### 9.3 완료 판정

- **월별 완료**: 해당 월의 **모든** 납입일(investment_days)이 localStorage에 기록된 경우에만 `completed: true`.
- `getPaymentHistory` / `getPaymentHistoryFromStart` 모두 동일 로직.

### 9.4 DateRangePicker

- `components/ui/date-range-picker.tsx`.
- `@ss-components/date-picker-02` 기반.
- 메인(다가오는 투자), 통계 페이지에서 "기간 선택" 시 사용.

---

## 10. Out of Scope (현재)

- 실제 푸시 알림/이메일 발송.
- 알림 설정 서버 저장.
- 다국어/다른 로케일.
- 월별 납입 기록 테이블 내 [완료] 버튼 (현재 미구현, 다가오는 투자/캘린더에서만 완료 가능).

---

## 11. 변경 이력 (v1.0 → v1.1)

| 항목 | 변경 내용 |
|------|-----------|
| 네비게이션 | 하단 4탭 (홈, 통계, 캘린더, 설정) 추가 |
| 통계/캘린더/설정 | 신규 페이지 추가 |
| 다가오는 투자 | 기간 프리셋 + 기간 선택(DateRangePicker), 기본 오늘~7일 |
| 완료 UX | "완료" → "완료하기", 체크 아이콘 제거, 되돌리기 토스트 |
| 상태 표시 | "✓ 완료" → "✓ 완료됨" |
| 통계 | 기간 선택(이번 달/3/6/12개월/기간 선택), 스트릭 제거 |
| 투자 상세 | 스크롤 시 종목명만 상단 고정, 만기 시 예상 금액 통합, 월별 납입 기록 시작일부터+페이징, text-sm |
| 완료 판정 | 월별 모든 납입일 완료 시에만 완료로 표시 |
