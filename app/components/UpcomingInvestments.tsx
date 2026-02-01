'use client'

import { useState, useCallback, useMemo } from 'react'
import { IconCheck } from '@tabler/icons-react'
import { formatCurrency } from '@/lib/utils'
import { formatPaymentDateShort } from '@/app/utils/date'
import type { Investment } from '@/app/types/investment'

const STORAGE_PREFIX = 'torich_completed_'

function getCompletedKey(investmentId: string, year: number, month: number, day: number): string {
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`
  return `${STORAGE_PREFIX}${investmentId}_${yearMonth}_${day}`
}

function isPaymentCompleted(investmentId: string, date: Date, dayOfMonth: number): boolean {
  if (typeof window === 'undefined') return false
  const key = getCompletedKey(investmentId, date.getFullYear(), date.getMonth() + 1, dayOfMonth)
  return localStorage.getItem(key) === '1'
}

function setPaymentCompleted(investmentId: string, date: Date, dayOfMonth: number): void {
  if (typeof window === 'undefined') return
  const key = getCompletedKey(investmentId, date.getFullYear(), date.getMonth() + 1, dayOfMonth)
  localStorage.setItem(key, '1')
}

interface UpcomingItem {
  investment: Investment
  paymentDate: Date
  dayOfMonth: number
}

interface UpcomingInvestmentsProps {
  items: UpcomingItem[]
}

export default function UpcomingInvestments({ items }: UpcomingInvestmentsProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set())

  const toggleComplete = useCallback((investmentId: string, date: Date, dayOfMonth: number) => {
    setPaymentCompleted(investmentId, date, dayOfMonth)
    const key = `${investmentId}_${date.getTime()}_${dayOfMonth}`
    setCompletedIds((prev) => new Set(prev).add(key))
  }, [])

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const key = `${item.investment.id}_${item.paymentDate.getTime()}_${item.dayOfMonth}`
      if (completedIds.has(key)) return false
      return !isPaymentCompleted(item.investment.id, item.paymentDate, item.dayOfMonth)
    })
  }, [items, completedIds])

  if (visibleItems.length === 0) return null

  return (
    <div className="bg-white rounded-3xl p-6">
      <h2 className="text-lg font-bold text-coolgray-900 mb-4">
        📅 다가오는 투자
      </h2>
      <div className="space-y-2">
        {visibleItems.map((item) => (
          <div
            key={`${item.investment.id}-${item.paymentDate.getTime()}-${item.dayOfMonth}`}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-coolgray-25 border border-coolgray-100"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-coolgray-900 truncate">
                {formatPaymentDateShort(item.paymentDate)} · {item.investment.title}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm font-bold text-coolgray-900">
                {formatCurrency(item.investment.monthly_amount)}
              </span>
              <button
                type="button"
                onClick={() => toggleComplete(item.investment.id, item.paymentDate, item.dayOfMonth)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors"
              >
                <IconCheck className="w-3.5 h-3.5" />
                완료
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
