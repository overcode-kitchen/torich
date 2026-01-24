'use client'

import { useMemo, useState } from 'react'
import { IconX } from '@tabler/icons-react'

interface InvestmentDaysPickerSheetProps {
  /** 현재 선택된 날짜들 (1~31) */
  days: number[]
  onClose: () => void
  onApply: (days: number[]) => void
}

function normalizeDays(days: number[]) {
  return Array.from(new Set(days))
    .filter((d) => Number.isFinite(d) && d >= 1 && d <= 31)
    .sort((a, b) => a - b)
}

export default function InvestmentDaysPickerSheet({
  days,
  onClose,
  onApply,
}: InvestmentDaysPickerSheetProps) {
  const [tempDays, setTempDays] = useState<number[]>(() => normalizeDays(days))

  const isDirty = useMemo(() => {
    const a = normalizeDays(days).join(',')
    const b = normalizeDays(tempDays).join(',')
    return a !== b
  }, [days, tempDays])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-black/50 animate-in fade-in-0 duration-200" onClick={onClose} />

      {/* 바텀 시트 */}
      <div className="relative z-50 w-full max-w-md bg-white rounded-t-3xl shadow-xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-coolgray-200 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pb-4">
          <h2 className="text-lg font-bold text-coolgray-900">매월 투자일 선택</h2>
          <button
            onClick={onClose}
            className="p-1 text-coolgray-400 hover:text-coolgray-600 transition-colors"
            aria-label="닫기"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* 선택된 날짜 미리보기 */}
        <div className="px-6 pb-3">
          {tempDays.length > 0 ? (
            <div className="flex flex-wrap gap-1 justify-end">
              {tempDays.map((day) => (
                <span
                  key={day}
                  className="inline-flex items-center bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {day}일
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-coolgray-400 text-right">선택된 날짜가 없어요</p>
          )}
        </div>

        {/* 날짜 선택 그리드 */}
        <div className="px-6 pb-6 overflow-y-auto">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const selected = tempDays.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setTempDays((prev) => {
                      if (prev.includes(day)) return prev.filter((d) => d !== day)
                      return normalizeDays([...prev, day])
                    })
                  }}
                  className={`h-9 rounded-full text-sm font-semibold transition-colors ${
                    selected
                      ? 'bg-brand-600 text-white'
                      : 'bg-coolgray-50 text-coolgray-700 hover:bg-coolgray-100'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-coolgray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-coolgray-700 bg-coolgray-100 rounded-xl hover:bg-coolgray-200 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onApply(normalizeDays(tempDays))}
            disabled={!isDirty}
            className="flex-1 py-3 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-default"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  )
}

