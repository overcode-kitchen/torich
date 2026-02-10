'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { addDays } from 'date-fns'
import { formatPaymentDateShort, getUpcomingPayments, getUpcomingPaymentsInRange } from '@/app/utils/date'
import type { Investment } from '@/app/types/investment'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import type { DateRange } from 'react-day-picker'
import { usePaymentCompletion } from '@/app/hooks/usePaymentCompletion'
import type { PaymentEvent } from '@/app/utils/stats'


const PRESET_OPTIONS = [
  { label: '오늘', days: 1 },
  { label: '3일', days: 3 },
  { label: '7일', days: 7 },
  { label: '보름', days: 15 },
  { label: '한달', days: 30 },
  { label: '1년', days: 365 },
] as const

interface UpcomingItem {
  investment: Investment
  paymentDate: Date
  dayOfMonth: number
}

interface UpcomingInvestmentsProps {
  records: Investment[]
}


export default function UpcomingInvestments({ records }: UpcomingInvestmentsProps) {
  const [selectedPreset, setSelectedPreset] = useState<'preset' | 'custom'>('preset')
  const [selectedDays, setSelectedDays] = useState(7)
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(() => {
    const t = new Date()
    return { from: t, to: addDays(t, 6) }
  })
  
  const { handleComplete, handleUndo, isEventCompleted, pendingUndo } = usePaymentCompletion()

  const items = useMemo(() => {
    if (selectedPreset === 'custom' && customDateRange?.from && customDateRange?.to) {
      const payments = getUpcomingPaymentsInRange(records, customDateRange.from, customDateRange.to)
      return payments.map((p) => {
        const inv = records.find((r) => r.id === p.id)!
        return { investment: inv, paymentDate: p.paymentDate, dayOfMonth: p.dayOfMonth }
      })
    }
    const effectiveDays = selectedDays
    const payments = getUpcomingPayments(records, effectiveDays)
    return payments.map((p) => {
      const inv = records.find((r) => r.id === p.id)!
      return { investment: inv, paymentDate: p.paymentDate, dayOfMonth: p.dayOfMonth }
    })
  }, [records, selectedPreset, selectedDays, customDateRange])


  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const event: PaymentEvent = {
        investmentId: item.investment.id,
        year: item.paymentDate.getFullYear(),
        month: item.paymentDate.getMonth() + 1,
        day: item.dayOfMonth,
        yearMonth: `${item.paymentDate.getFullYear()}-${String(item.paymentDate.getMonth() + 1).padStart(2, '0')}`,
        monthlyAmount: item.investment.monthly_amount,
        title: item.investment.title
      }
      return !isEventCompleted(event)
    })
  }, [items, isEventCompleted])

  const rangeLabel =
    selectedPreset === 'custom' && customDateRange?.from && customDateRange?.to
      ? `${customDateRange.from.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} - ${customDateRange.to.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`
      : PRESET_OPTIONS.find((p) => p.days === selectedDays)?.label ?? `${selectedDays}일`

  if (records.length === 0) return null

  return (
    <div className="bg-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-1">
          <Image
            src="/icons/3d/bell-yellow.png"
            alt="다가오는 투자 알림 아이콘"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <span>다가오는 투자</span>
        </h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border border-border hover:border-surface-strong-hover"
              >
                {rangeLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[140px]">
              {PRESET_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.days}
                  onClick={() => {
                    setSelectedPreset('preset')
                    setSelectedDays(opt.days)
                  }}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPreset('custom')
                  const t = new Date()
                  setCustomDateRange({ from: t, to: addDays(t, 6) })
                }}
              >
                기간 선택
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 커스텀 기간 선택 */}
      {selectedPreset === 'custom' && (
        <div className="mb-4">
          <DateRangePicker
            value={customDateRange}
            onChange={setCustomDateRange}
            placeholder="기간 선택"
            buttonClassName="w-full"
          />
        </div>
      )}

      {visibleItems.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {rangeLabel} 이내 예정된 투자가 없어요
        </p>
      ) : (
      <div className="space-y-2">
        {visibleItems.map((item) => (
          <div
            key={`${item.investment.id}-${item.paymentDate.getTime()}-${item.dayOfMonth}`}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface border border-border-subtle"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {formatPaymentDateShort(item.paymentDate)} · {item.investment.title}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm font-bold text-foreground">
                {formatCurrency(item.investment.monthly_amount)}
              </span>
              <button
                type="button"
                onClick={() => {
                  const event: PaymentEvent = {
                    investmentId: item.investment.id,
                    year: item.paymentDate.getFullYear(),
                    month: item.paymentDate.getMonth() + 1,
                    day: item.dayOfMonth,
                    yearMonth: `${item.paymentDate.getFullYear()}-${String(item.paymentDate.getMonth() + 1).padStart(2, '0')}`,
                    monthlyAmount: item.investment.monthly_amount,
                    title: item.investment.title
                  }
                  handleComplete(event)
                }}
                className="px-3 py-1.5 rounded-lg border border-border text-foreground-muted text-xs font-medium hover:bg-surface-hover hover:border-surface-strong-hover transition-colors"
                aria-label="납입 완료 체크"
              >
                완료하기
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* 되돌리기 토스트 */}
      {pendingUndo && (
        <div
          className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-xl bg-surface-dark text-white px-4 py-3 shadow-lg"
          role="status"
        >
          <span className="text-sm font-medium">완료됨</span>
          <button
            type="button"
            onClick={handleUndo}
            className="text-sm font-semibold text-brand-300 hover:text-brand-200 transition-colors"
          >
            되돌리기
          </button>
        </div>
      )}
    </div>
  )
}
