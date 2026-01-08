'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react'
import { createClient } from '@/utils/supabase/client'

export default function AddInvestmentPage() {
  const router = useRouter()
  const [stockName, setStockName] = useState('')
  const [monthlyAmount, setMonthlyAmount] = useState('')
  const [period, setPeriod] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // 로그인한 유저 정보 가져오기
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      } else {
        // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
        router.push('/login')
      }
    }
    getUser()
  }, [router])

  // 복리 계산 함수
  const calculateFinalAmount = (monthlyAmount: number, periodYears: number): number => {
    const annualRate = 10 // 연 수익률 10%
    const monthlyRate = annualRate / 12 / 100 // 월 이율
    const totalMonths = periodYears * 12 // 총 개월 수

    // 기납입액 기준 월복리 계산: 월납입금 * ((1 + r)^n - 1) / r * (1 + r)
    const finalAmount = monthlyAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
    
    return Math.round(finalAmount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    if (!stockName.trim()) {
      alert('종목명을 입력해주세요.')
      return
    }
    if (!monthlyAmount || parseInt(monthlyAmount) <= 0) {
      alert('월 투자액을 입력해주세요.')
      return
    }
    if (!period || parseInt(period) <= 0) {
      alert('투자 기간을 입력해주세요.')
      return
    }
    if (!userId) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    try {
      setIsSubmitting(true)

      const supabase = createClient()
      const monthlyAmountNum = parseInt(monthlyAmount)
      const periodYearsNum = parseInt(period)
      const finalAmount = calculateFinalAmount(monthlyAmountNum, periodYearsNum)

      // Supabase에 데이터 저장
      const { error } = await supabase
        .from('records')
        .insert({
          user_id: userId,
          title: stockName.trim(),
          monthly_amount: monthlyAmountNum,
          period_years: periodYearsNum,
          annual_rate: 10,
          final_amount: finalAmount,
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

  // 숫자만 입력받는 핸들러
  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setter(value)
  }

  return (
    <main className="min-h-screen bg-coolgray-25">
      {/* 뒤로가기 버튼 */}
      <header className="h-[52px] flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-coolgray-700 hover:text-coolgray-900 transition-colors"
          aria-label="뒤로가기"
        >
          <IconArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* 상단 헤더 텍스트 */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-coolgray-900 mb-3">
            람쥐씨, 어떤 꿈을 꾸고 계신가요?
          </h1>
          <p className="text-sm text-coolgray-400 whitespace-pre-line">
            매달 꾸준히 모았을 때,{'\n'}10년 뒤 얼마가 될지 바로 보여드릴게요.
          </p>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {/* 종목명 입력 */}
          <input
            type="text"
            value={stockName}
            onChange={(e) => setStockName(e.target.value)}
            placeholder="S&P 500"
            className="w-full bg-white rounded-2xl p-5 text-coolgray-900 placeholder-coolgray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          {/* 월 투자액 입력 */}
          <input
            type="text"
            value={monthlyAmount}
            onChange={(e) => handleNumericInput(e, setMonthlyAmount)}
            placeholder="10만원씩"
            className="w-full bg-white rounded-2xl p-5 text-coolgray-900 placeholder-coolgray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          {/* 투자 기간 입력 */}
          <input
            type="text"
            value={period}
            onChange={(e) => handleNumericInput(e, setPeriod)}
            placeholder="3년간"
            className="w-full bg-white rounded-2xl p-5 text-coolgray-900 placeholder-coolgray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        {/* 저장하기 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-coolgray-800 text-white font-medium rounded-xl py-4 hover:bg-coolgray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <IconLoader2 className="w-5 h-5 animate-spin" />
              <span>저장 중...</span>
            </>
          ) : (
            '저장하기'
          )}
        </button>
      </div>
    </main>
  )
}

