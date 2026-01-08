'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function AuthCodeErrorPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-coolgray-25 flex items-center justify-center px-4 relative">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 p-2 text-coolgray-700 hover:text-coolgray-900 transition-colors"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="w-full max-w-xs">
        {/* 타이틀 */}
        <h1 className="text-3xl font-bold text-coolgray-900 text-center mb-4">
          티끌모아 태산
        </h1>

        {/* 에러 메시지 카드 */}
        <div className="bg-white rounded-3xl shadow-md p-8 text-center space-y-6">
          <div className="space-y-2">
            <p className="text-coolgray-900 text-lg font-semibold">
              로그인 중 오류가 발생했습니다
            </p>
            <p className="text-coolgray-500 text-sm">
              다시 시도해주세요
            </p>
          </div>

          {/* 로그인 화면으로 돌아가기 버튼 */}
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-brand-600 text-white font-bold rounded-xl py-4 px-6 hover:bg-brand-700 transition-colors"
          >
            로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    </main>
  )
}


