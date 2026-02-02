'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { IconLoader2 } from '@tabler/icons-react'
import { formatCurrency } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Investment, getStartDate } from '@/app/types/investment'
import { isCompleted } from '@/app/utils/date'
import {
  getThisMonthStats,
  getPeriodTotalPaid,
  getMonthlyCompletionRates,
  getMonthlyCompletionRatesForRange,
  getPeriodTotalPaidForRange,
} from '@/app/utils/stats'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import type { DateRange } from 'react-day-picker'
import { subMonths, subDays } from 'date-fns'

export default function StatsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [records, setRecords] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (u) {
        const { data } = await supabase
          .from('records')
          .select('*')
          .order('created_at', { ascending: false })
        setRecords(data || [])
      }
      setIsLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('records').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          setRecords(data || [])
        })
      } else {
        setRecords([])
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  type PeriodPreset = '1' | '3' | '6' | '12' | 'custom'
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('6')
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(() => {
    const end = new Date()
    const start = subDays(end, 6)
    return { from: start, to: end }
  })

  const isCustomRange = periodPreset === 'custom' && customDateRange?.from && customDateRange?.to
  const effectiveMonths = periodPreset === 'custom' ? 6 : parseInt(periodPreset, 10)

  const activeRecords = useMemo(() => {
    return records.filter((r) => {
      const start = getStartDate(r)
      return !isCompleted(start, r.period_years)
    })
  }, [records])

  const thisMonth = useMemo(() => getThisMonthStats(activeRecords), [activeRecords])

  const periodTotal = useMemo(() => {
    if (isCustomRange) {
      return getPeriodTotalPaidForRange(activeRecords, customDateRange!.from!, customDateRange!.to!)
    }
    return getPeriodTotalPaid(activeRecords, effectiveMonths)
  }, [activeRecords, effectiveMonths, isCustomRange, customDateRange])

  const monthlyRates = useMemo(() => {
    if (isCustomRange) {
      return getMonthlyCompletionRatesForRange(activeRecords, customDateRange!.from!, customDateRange!.to!)
    }
    return getMonthlyCompletionRates(activeRecords, effectiveMonths)
  }, [activeRecords, effectiveMonths, isCustomRange, customDateRange])

  const periodCompletionRate = useMemo(() => {
    const rates = monthlyRates
    if (rates.length === 0) return 0
    const totalEvents = rates.reduce((s, r) => s + r.total, 0)
    const totalCompleted = rates.reduce((s, r) => s + r.completed, 0)
    return totalEvents > 0 ? Math.round((totalCompleted / totalEvents) * 100) : 0
  }, [monthlyRates])

  const rangeMonthCount = monthlyRates.length
  const monthlyAvg = activeRecords.length > 0 && rangeMonthCount > 0
    ? Math.round(periodTotal / rangeMonthCount)
    : 0

  const chartData = useMemo(() => {
    return [...monthlyRates].reverse().map((r) => ({
      name: r.monthLabel,
      rate: r.rate,
      completed: r.completed,
      total: r.total,
    }))
  }, [monthlyRates])

  const periodLabel =
    periodPreset === '1'
      ? '이번 달'
      : periodPreset === 'custom' && isCustomRange
        ? `${customDateRange!.from!.toLocaleDateString('ko-KR', { month: 'short', year: 'numeric' })} - ${customDateRange!.to!.toLocaleDateString('ko-KR', { month: 'short', year: 'numeric' })}`
        : `최근 ${effectiveMonths}개월`

  if (isLoading) {
    return (
      <main className="min-h-screen bg-coolgray-25 flex items-center justify-center">
        <IconLoader2 className="w-8 h-8 animate-spin text-brand-600" />
      </main>
    )
  }

  if (!user) {
    router.replace('/login')
    return null
  }

  return (
    <main className="min-h-screen bg-coolgray-25">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <h1 className="text-xl font-bold text-coolgray-900 mb-6">통계</h1>

        {/* 이번 달 현황 */}
        <section className="bg-white rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-coolgray-600 mb-3">이번 달 납입 현황</h2>
          <p className="text-lg font-bold text-coolgray-900 mb-2">
            {thisMonth.total}건 중 {thisMonth.completed}건 완료
          </p>
          <div className="h-2 bg-coolgray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: thisMonth.total > 0 ? `${(thisMonth.completed / thisMonth.total) * 100}%` : '0%' }}
            />
          </div>
        </section>

        {/* 기간별 완료율 */}
        <section className="bg-white rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-coolgray-200 border-coolgray-200 hover:border-coolgray-300"
                >
                  {periodLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[140px]">
                <DropdownMenuItem onClick={() => setPeriodPreset('1')}>이번 달</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriodPreset('3')}>최근 3개월</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriodPreset('6')}>최근 6개월</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriodPreset('12')}>최근 12개월</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setPeriodPreset('custom')
                    const end = new Date()
                    setCustomDateRange({ from: subDays(end, 6), to: end })
                  }}
                >
                  기간 선택
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <h2 className="text-sm font-semibold text-coolgray-600">완료율</h2>
          </div>
          {periodPreset === 'custom' && (
            <div className="mb-3">
              <DateRangePicker
                value={customDateRange}
                onChange={setCustomDateRange}
                placeholder="기간 선택"
                buttonClassName="w-full"
              />
            </div>
          )}
          <p className="text-2xl font-bold text-brand-600 mb-4">{periodCompletionRate}%</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={28} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="#02c463" fillOpacity={0.7 + (i / chartData.length) * 0.3} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-coolgray-500 mt-1">{periodLabel} 월별 완료율</p>
        </section>

        {/* 총 납입 금액 */}
        <section className="bg-white rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-coolgray-600 mb-2">총 납입 금액</h2>
          <p className="text-2xl font-bold text-coolgray-900">{formatCurrency(periodTotal)}</p>
          <p className="text-sm text-coolgray-500 mt-1">{periodLabel} 총 납입</p>
          {monthlyAvg > 0 && (
            <p className="text-sm text-coolgray-500">월평균 약 {formatCurrency(monthlyAvg)}</p>
          )}
        </section>
      </div>
    </main>
  )
}
