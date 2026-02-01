'use client'

import { formatCurrency } from '@/lib/utils'
import { Investment, getStartDate, formatInvestmentDays } from '@/app/types/investment'
import { 
  getRemainingText, 
  isCompleted 
} from '@/app/utils/date'

interface InvestmentItemProps {
  item: Investment
  onClick: () => void
  calculateFutureValue?: (monthlyAmount: number, T: number, P: number, R: number) => number
}

export default function InvestmentItem({
  item,
  onClick,
  calculateFutureValue,
}: InvestmentItemProps) {
  // 시작일 추출 (start_date가 없으면 created_at 사용)
  const startDate = getStartDate(item)
  
  // 남은 기간 텍스트
  const remainingText = getRemainingText(startDate, item.period_years)
  
  // 완료 여부
  const completed = isCompleted(startDate, item.period_years)

  return (
    <div className="border-b border-coolgray-100 last:border-b-0 py-2">
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left flex items-start gap-2 px-4 py-4 rounded-2xl transition-colors transition-transform duration-150 ease-out hover:bg-coolgray-25 active:bg-coolgray-50 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white will-change-transform"
      >
        {/* 종목명 및 상세 정보 */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 종목명 */}
          <h3 className="text-lg font-bold text-coolgray-900 mb-1 truncate">
            {item.title}
          </h3>
          {/* 월 투자금 · 남은 기간 · 매월 투자일 */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className={`text-sm ${completed ? 'text-green-600 font-semibold' : 'text-coolgray-500'}`}>
              월 {formatCurrency(item.monthly_amount)} · {remainingText}
            </p>
            {item.investment_days && item.investment_days.length > 0 && (
              <span className="text-xs text-coolgray-400 bg-coolgray-100 px-2 py-0.5 rounded-full">
                {formatInvestmentDays(item.investment_days)}
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  )
}

