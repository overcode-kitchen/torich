'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconArrowLeft } from '@tabler/icons-react'

export default function AddInvestmentPage() {
  const router = useRouter()
  const [stockName, setStockName] = useState('')
  const [monthlyAmount, setMonthlyAmount] = useState('')
  const [period, setPeriod] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 저장 로직 구현
    console.log({ stockName, monthlyAmount, period })
    router.back()
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
          className="w-full bg-coolgray-800 text-white font-medium rounded-xl py-4 hover:bg-coolgray-900 transition-colors"
        >
          저장하기
        </button>
      </div>
    </main>
  )
}

