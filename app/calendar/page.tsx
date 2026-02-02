'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { IconLoader2, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { formatCurrency } from '@/lib/utils'
import { Investment, getStartDate } from '@/app/types/investment'
import { isCompleted } from '@/app/utils/date'
import {
  getPaymentEventsForMonth,
  isPaymentEventCompleted,
  type PaymentEvent,
} from '@/app/utils/stats'
import { addMonths, subMonths, format, getDaysInMonth, startOfMonth, getDay } from 'date-fns'
import { ko } from 'date-fns/locale'

const STORAGE_PREFIX = 'torich_completed_'

function setPaymentCompleted(investmentId: string, year: number, month: number, day: number): void {
  if (typeof window === 'undefined') return
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`
  const key = `${STORAGE_PREFIX}${investmentId}_${yearMonth}_${day}`
  localStorage.setItem(key, new Date().toISOString())
}

export default function CalendarPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [records, setRecords] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set())

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (u) {
        const { data } = await supabase.from('records').select('*').order('created_at', { ascending: false })
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
      } else setRecords([])
    })
    return () => subscription.unsubscribe()
  }, [])

  const activeRecords = useMemo(() => {
    return records.filter((r) => {
      const start = getStartDate(r)
      return !isCompleted(start, r.period_years)
    })
  }, [records])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth() + 1

  const eventsForMonth = useMemo(
    () => getPaymentEventsForMonth(activeRecords, year, month),
    [activeRecords, year, month]
  )

  const eventsByDay = useMemo(() => {
    const map = new Map<number, PaymentEvent[]>()
    for (const e of eventsForMonth) {
      const list = map.get(e.day) || []
      list.push(e)
      map.set(e.day, list)
    }
    return map
  }, [eventsForMonth])

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const first = startOfMonth(currentMonth)
    const startPad = getDay(first)
    const cells: (number | null)[] = []
    for (let i = 0; i < startPad; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [currentMonth])

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return []
    if (selectedDate.getFullYear() !== year || selectedDate.getMonth() !== month - 1) return []
    const d = selectedDate.getDate()
    return eventsByDay.get(d) || []
  }, [selectedDate, eventsByDay, year, month])

  const handleComplete = (e: PaymentEvent) => {
    setPaymentCompleted(e.investmentId, e.year, e.month, e.day)
    setCompletedKeys((prev) => new Set(prev).add(`${e.investmentId}_${e.year}_${e.month}_${e.day}`))
  }

  const isEventCompleted = (e: PaymentEvent) => {
    const key = `${e.investmentId}_${e.year}_${e.month}_${e.day}`
    if (completedKeys.has(key)) return true
    return isPaymentEventCompleted(e.investmentId, e.year, e.month, e.day)
  }

  const getDayStatus = (day: number) => {
    const events = eventsByDay.get(day) || []
    if (events.length === 0) return null
    const today = new Date()
    const isPast = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1) || (year === today.getFullYear() && month === today.getMonth() + 1 && day < today.getDate())
    const allCompleted = events.every((ev) => isEventCompleted(ev))
    if (allCompleted) return 'completed'
    if (isPast) return 'missed'
    return 'scheduled'
  }

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
        <h1 className="text-xl font-bold text-coolgray-900 mb-4">캘린더</h1>

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              setCurrentMonth((m) => subMonths(m, 1))
              setSelectedDate(null)
            }}
            className="p-2 text-coolgray-600 hover:text-coolgray-900"
          >
            <IconChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-semibold text-coolgray-900">
            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
          </span>
          <button
            type="button"
            onClick={() => {
              setCurrentMonth((m) => addMonths(m, 1))
              setSelectedDate(null)
            }}
            className="p-2 text-coolgray-600 hover:text-coolgray-900"
          >
            <IconChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 캘린더 그리드 */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((w) => (
              <div key={w} className="text-center text-xs font-medium text-coolgray-500 py-1">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="aspect-square" />
              }
              const status = getDayStatus(day)
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth()
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(new Date(year, month - 1, day))}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors ${
                    isSelected ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500' : 'hover:bg-coolgray-50'
                  }`}
                >
                  <span className="font-medium">{day}</span>
                  {status && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        status === 'completed' ? 'bg-green-500' : status === 'missed' ? 'bg-red-500' : 'bg-coolgray-300'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 선택된 날짜의 투자 목록 */}
        {selectedDate && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-coolgray-700 mb-3">
              {format(selectedDate, 'M월 d일', { locale: ko })} 예정 투자
            </h3>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-coolgray-500">해당 날짜에 예정된 투자가 없어요</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((e) => {
                  const done = isEventCompleted(e)
                  return (
                    <div
                      key={`${e.investmentId}-${e.day}`}
                      className="flex items-center justify-between py-2 border-b border-coolgray-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-coolgray-900">{e.title}</p>
                        <p className="text-sm text-coolgray-500">{formatCurrency(e.monthlyAmount)}</p>
                      </div>
                      {done ? (
                        <span className="text-green-600 text-sm font-medium">✓ 완료됨</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleComplete(e)}
                          className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700"
                          aria-label="납입 완료 체크"
                        >
                          완료하기
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
