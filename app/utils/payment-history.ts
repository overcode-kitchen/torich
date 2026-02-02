const STORAGE_PREFIX = 'torich_completed_'

function isDayCompleted(investmentId: string, year: number, month: number, day: number): boolean {
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`
  const key = `${STORAGE_PREFIX}${investmentId}_${yearMonth}_${day}`
  const val = localStorage.getItem(key)
  return !!val
}

/**
 * 해당 투자의 최근 N개월 납입 완료 기록 조회
 * @param investmentId 투자 ID
 * @param months 최근 몇 개월 (기본 6)
 * @param investment_days 매월 투자일 [5, 25] - 이 값이 있어야 해당 월의 모든 납입일 완료 시에만 completed: true
 * @param start_date 투자 시작일 (선택)
 * @param period_years 투자 기간 년수 (선택)
 * @returns [{ yearMonth: '2025-01', completed: true }, ...] (최신순)
 */
export function getPaymentHistory(
  investmentId: string,
  months: number = 6,
  investment_days?: number[] | null,
  start_date?: string | null,
  period_years?: number
): Array<{ yearMonth: string; monthLabel: string; completed: boolean }> {
  if (typeof window === 'undefined') return []

  const today = new Date()
  const startDate = start_date ? new Date(start_date) : null
  const endDate =
    startDate && period_years
      ? new Date(startDate.getFullYear() + period_years, startDate.getMonth(), startDate.getDate())
      : null

  const results: Array<{ yearMonth: string; monthLabel: string; completed: boolean }> = []

  for (let i = 0; i < months; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`
    const monthLabel = `${month}월`

    const days = investment_days && investment_days.length > 0 ? investment_days : []
    const daysInMonth = new Date(year, month, 0).getDate()

    const paymentDaysInMonth = days.filter((day) => day <= daysInMonth)
    const paymentDatesInRange = paymentDaysInMonth.filter((day) => {
      const paymentDate = new Date(year, month - 1, day)
      if (startDate && paymentDate < startDate) return false
      if (endDate && paymentDate > endDate) return false
      return true
    })

    let completed: boolean
    if (paymentDatesInRange.length === 0) {
      completed = true
    } else {
      completed = paymentDatesInRange.every((day) =>
        isDayCompleted(investmentId, year, month, day)
      )
    }

    results.push({ yearMonth, monthLabel, completed })
  }

  return results
}

/**
 * 투자 시작일부터 오늘까지 전체 월별 납입 기록 (최신순)
 * @param investment_days 매월 투자일
 * @param start_date 투자 시작일
 * @param period_years 투자 기간 년수
 */
export function getPaymentHistoryFromStart(
  investmentId: string,
  investment_days?: number[] | null,
  start_date?: string | null,
  period_years?: number
): Array<{ yearMonth: string; monthLabel: string; completed: boolean }> {
  if (typeof window === 'undefined') return []

  const today = new Date()
  const startDate = start_date ? new Date(start_date) : today
  const endDate =
    startDate && period_years
      ? new Date(startDate.getFullYear() + period_years, startDate.getMonth(), startDate.getDate())
      : today

  const results: Array<{ yearMonth: string; monthLabel: string; completed: boolean }> = []
  const days = investment_days && investment_days.length > 0 ? investment_days : []

  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const endLimit = today < endDate ? today : endDate
  const end = new Date(endLimit.getFullYear(), endLimit.getMonth(), 1)
  if (current > end) return []

  while (current <= end) {
    const year = current.getFullYear()
    const month = current.getMonth() + 1
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`
    const monthLabel = `${month}월`

    const daysInMonth = new Date(year, month, 0).getDate()
    const paymentDaysInMonth = days.filter((d) => d <= daysInMonth)
    const paymentDatesInRange = paymentDaysInMonth.filter((day) => {
      const paymentDate = new Date(year, month - 1, day)
      if (paymentDate < startDate) return false
      if (endDate && paymentDate > endDate) return false
      return true
    })

    let completed: boolean
    if (paymentDatesInRange.length === 0) {
      completed = true
    } else {
      completed = paymentDatesInRange.every((day) =>
        isDayCompleted(investmentId, year, month, day)
      )
    }

    results.push({ yearMonth, monthLabel, completed })
    current.setMonth(current.getMonth() + 1)
  }

  return results.reverse()
}
