const STORAGE_PREFIX = 'torich_completed_'

/**
 * 해당 투자의 최근 N개월 납입 완료 기록 조회
 * @param investmentId 투자 ID
 * @param months 최근 몇 개월 (기본 6)
 * @returns [{ yearMonth: '2025-01', completed: true }, ...] (최신순)
 */
export function getPaymentHistory(
  investmentId: string,
  months: number = 6
): Array<{ yearMonth: string; monthLabel: string; completed: boolean }> {
  if (typeof window === 'undefined') return []

  const today = new Date()
  const results: Array<{ yearMonth: string; monthLabel: string; completed: boolean }> = []

  for (let i = 0; i < months; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`
    const monthLabel = `${month}월`

    let completed = false
    const prefix = `${STORAGE_PREFIX}${investmentId}_${yearMonth}_`
    for (let key = 0; key < localStorage.length; key++) {
      const k = localStorage.key(key)
      if (k && k.startsWith(prefix) && localStorage.getItem(k) === '1') {
        completed = true
        break
      }
    }

    results.push({ yearMonth, monthLabel, completed })
  }

  return results
}
