'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export interface UseAddInvestmentDataReturn {
  userId: string | null
  isSubmitting: boolean
  setIsSubmitting: (submitting: boolean) => void
  handleSubmit: (data: {
    stockName: string
    monthlyAmount: string
    period: string
    startDate: Date
    investmentDays: number[]
    annualRate: number
    isManualInput: boolean
    originalSystemRate: number | null
    selectedStock: any
  }) => Promise<void>
}

export function useAddInvestmentData(): UseAddInvestmentDataReturn {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // 사용자 정보 가져오기
  useEffect(() => {
    const getUser = async (): Promise<void> => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
      } else {
        router.push('/login')
      }
    }

    void getUser()
  }, [router])

  // 폼 제출 처리
  const handleSubmit = async (data: {
    stockName: string
    monthlyAmount: string
    period: string
    startDate: Date
    investmentDays: number[]
    annualRate: number
    isManualInput: boolean
    originalSystemRate: number | null
    selectedStock: any
  }): Promise<void> => {
    try {
      setIsSubmitting(true)

      const supabase = createClient()
      // 콤마 제거 후 숫자로 변환하고 만원 단위로 처리 (원 단위로 변환)
      const monthlyAmountInWon = parseInt(data.monthlyAmount.replace(/,/g, '')) * 10000
      const periodYearsNum = parseInt(data.period)
      
      // 최종 금액 계산을 위한 임포트 (나중에 calculations 훅에서 가져옴)
      const { calculateFinalAmount } = await import('@/app/utils/finance')
      const finalAmount = calculateFinalAmount(monthlyAmountInWon, periodYearsNum, data.annualRate)

      // is_custom_rate 판별: 직접 입력했거나, 시스템 값을 수정한 경우 true
      const isCustomRate = data.isManualInput || (data.originalSystemRate !== null && data.annualRate !== data.originalSystemRate)

      // symbol 결정: 검색을 통해 선택한 경우 selectedStock.symbol, 직접 입력은 null
      const stockSymbol = !data.isManualInput && data.selectedStock?.symbol ? data.selectedStock.symbol : null

      // Supabase에 데이터 저장
      const { error } = await supabase
        .from('records')
        .insert({
          user_id: userId,
          title: data.stockName.trim(),
          symbol: stockSymbol,
          monthly_amount: monthlyAmountInWon,
          period_years: periodYearsNum,
          annual_rate: data.annualRate,
          final_amount: finalAmount,
          start_date: data.startDate.toISOString().split('T')[0],
          investment_days: data.investmentDays.length > 0 ? data.investmentDays : null,
          is_custom_rate: isCustomRate,
        })

      if (error) {
        console.error('저장 오류:', error)
        alert('저장에 실패했습니다. 다시 시도해주세요.')
        return
      }

      // 성공 시 메인으로 이동
      router.refresh()
      router.push('/')
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    userId,
    isSubmitting,
    setIsSubmitting,
    handleSubmit,
  }
}
