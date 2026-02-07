import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface CalendarGridSectionProps {
  currentMonth: Date
  calendarDays: (number | null)[]
  selectedDate: Date | null
  getDayStatus: (day: number) => 'completed' | 'missed' | 'scheduled' | null
  goToPrevMonth: () => void
  goToNextMonth: () => void
  selectDate: (day: number) => void
  clearSelection: () => void
}

export function CalendarGridSection({
  currentMonth,
  calendarDays,
  selectedDate,
  getDayStatus,
  goToPrevMonth,
  goToNextMonth,
  selectDate,
  clearSelection,
}: CalendarGridSectionProps) {
  return (
    <>
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="p-2 text-foreground-muted hover:text-foreground"
        >
          <CaretLeft className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold text-foreground">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 text-foreground-muted hover:text-foreground"
        >
          <CaretRight className="w-6 h-6" />
        </button>
      </div>

      {/* 캘린더 그리드 */}
      <div
        className="bg-card rounded-2xl p-4 mb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map((w) => (
            <div key={w} className="text-center text-xs font-medium text-muted-foreground py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${i}`}
                  className="aspect-square cursor-pointer"
                  onClick={clearSelection}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && clearSelection()}
                  aria-label="선택 해제"
                />
              )
            }
            const status = getDayStatus(day)
            const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth()
            return (
              <button
                key={day}
                type="button"
                onClick={() => selectDate(day)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors ${
                  isSelected ? 'bg-[var(--brand-accent-bg)] text-[var(--brand-accent-text)] ring-2 ring-brand-500' : 'hover:bg-surface-hover'
                }`}
              >
                <span className="font-medium">{day}</span>
                {status && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      status === 'completed' ? 'bg-green-500' : status === 'missed' ? 'bg-red-500' : 'bg-surface-strong-hover'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>
        {/* 색상 범례 */}
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-foreground-muted">완료됨</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-foreground-muted">미완료</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-surface-strong-hover" />
            <span className="text-xs text-foreground-muted">예정</span>
          </div>
        </div>
      </div>
    </>
  )
}
