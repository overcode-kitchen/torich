'use client'

import { formatFullDate } from '@/app/utils/date'

interface ProgressSectionProps {
  progress: number
  completed: boolean
  startDate: Date
  endDate: Date
}

export function ProgressSection({
  progress,
  completed,
  startDate,
  endDate,
}: ProgressSectionProps) {
  return (
    <section className="py-6 border-b border-border-subtle-lighter">
      <div className="flex justify-between text-base text-muted-foreground mb-3">
        <span className="font-medium">진행률</span>
        <span className="font-bold text-foreground">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500' : 'bg-brand-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-foreground-subtle mt-3">
        <span>시작: {formatFullDate(startDate)}</span>
        <span>종료: {formatFullDate(endDate)}</span>
      </div>
    </section>
  )
}
