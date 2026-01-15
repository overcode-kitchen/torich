'use client'

import { formatCurrency } from '@/lib/utils'
import { Investment, getStartDate } from '@/app/types/investment'
import { 
  getRemainingText, 
  isCompleted 
} from '@/app/utils/date'

interface InvestmentItemProps {
  item: Investment
  onClick: () => void
  calculateFutureValue: (monthlyAmount: number, T: number, P: number, R: number) => number
}

export default function InvestmentItem({
  item,
  onClick,
  calculateFutureValue,
}: InvestmentItemProps) {
  // 시작일 추출 (start_date가 없으면 created_at 사용)
  const startDate = getStartDate(item)
  
  // 연이율 (기본 10%)
  const R = item.annual_rate ? item.annual_rate / 100 : 0.10
  
  // 만기 시점 미래 가치 계산
  const calculatedFutureValue = calculateFutureValue(
    item.monthly_amount,
    item.period_years,
    item.period_years,
    R
  )
  
  // 총 원금 계산
  const totalPrincipal = item.monthly_amount * 12 * item.period_years
  
  // 수익금 계산
  const calculatedProfit = calculatedFutureValue - totalPrincipal
  
  // 남은 기간 텍스트
  const remainingText = getRemainingText(startDate, item.period_years)
  
  // 완료 여부
  const completed = isCompleted(startDate, item.period_years)

  return (
    <div 
      onClick={onClick}
      className="flex items-start gap-2 py-4 px-2 border-b border-coolgray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      {/* 좌측: 종목명 및 상세 정보 */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* 종목명 */}
        <h3 className="text-lg font-bold text-coolgray-900 mb-1 truncate">
          {item.title}
        </h3>
        {/* 한 줄로 합친 정보: 월 투자금 · 남은 기간 */}
        <p className={`text-sm ${completed ? 'text-green-600 font-semibold' : 'text-coolgray-500'}`}>
          월 {formatCurrency(item.monthly_amount)} · {remainingText}
        </p>
      </div>
      
      {/* 우측: 금액 정보 */}
      <div className="flex-shrink-0 flex flex-col items-end">
        {/* 최종 예상 금액 */}
        <span className="text-xl font-bold text-coolgray-900 mb-1 whitespace-nowrap">
          {formatCurrency(calculatedFutureValue)}
        </span>
        {/* 수익금 배지 */}
        <span className="bg-[#E0F8E8] text-green-600 rounded-full px-3 py-0.5 text-sm font-medium whitespace-nowrap">
          + {formatCurrency(calculatedProfit)}
        </span>
      </div>
    </div>
  )
}

