'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const mockItems = [
    { id: 1, title: 'S&P500', amount: '10만', period: '3년', expected: '5천' },
    { id: 2, title: '테슬라', amount: '20만', period: '5년', expected: '1.5억' },
    { id: 3, title: '비트코인', amount: '15만', period: '2년', expected: '8천' },
  ]

  return (
    <main className="min-h-screen bg-coolgray-25">      {/* 상단 헤더 */}
      <header className="h-[52px] flex items-center justify-between px-4">
        <h1 className="font-bold text-coolgray-900 text-xl">
          티끌모아 태산
        </h1>
        <button 
          onClick={() => router.push('/login')}
          className="px-4 py-1.5 text-sm font-medium text-coolgray-800 hover:text-brand-600 transition-colors"
        >
          로그인
        </button>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {/* 상단 요약 카드 */}
        <div className="bg-white rounded-3xl shadow-md p-8">
          <h2 className="text-lg font-bold text-coolgray-900 mb-6">
            나의 자산 예측
          </h2>
          <div className="space-y-6">
            {/* Header */}
            <div className="text-coolgray-700 text-lg font-medium">
              5년 뒤 예상 자산
            </div>
            
            {/* Main */}
            <div className="text-coolgray-900 text-3xl font-bold leading-tight">
              3억 2,000만 원
            </div>
            
            {/* Footer */}
            <div className="text-coolgray-700 text-lg font-medium">
            매월 <span className="text-brand-600 font-semibold">45만 원</span>씩 모으고 있어요
            </div>
          </div>
        </div>

        {/* 투자 목록 추가하기 버튼 */}
        <button 
          onClick={() => router.push('/add')}
          className="w-full bg-brand-600 text-white font-bold rounded-2xl py-4 shadow-lg flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          투자 목록 추가하기
        </button>

        {/* 하단 리스트 카드 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-coolgray-900 mb-4">
            내 투자 목록
          </h2>
          <div className="space-y-1">
            {mockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 px-2 border-b border-coolgray-100 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="font-semibold text-coolgray-900 mb-1">
                    {item.title}
                  </div>
                  <div className="text-xs text-coolgray-400">
                    월 {item.amount} / {item.period}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-coolgray-900">
                    총 {item.expected}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
