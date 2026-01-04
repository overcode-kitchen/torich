'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { IconPlus, IconLogout, IconUser, IconLoader2 } from '@tabler/icons-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { formatCurrency } from '@/lib/utils'

interface Record {
  id: string
  title: string
  monthly_amount: number
  period_years: number
  expected_amount: string
  created_at: string
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [records, setRecords] = useState<Record[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    // 인증 상태 확인 및 데이터 로드
    const checkAuthAndLoadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // 로그인한 경우 records 데이터 가져오기
          const { data, error } = await supabase
            .from('records')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) {
            console.error('데이터 조회 오류:', error)
          } else {
            setRecords(data || [])
          }
        }
      } catch (error) {
        console.error('인증 확인 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndLoadData()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // 로그인 시 데이터 다시 로드
        supabase
          .from('records')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error) {
              setRecords(data || [])
            }
          })
      } else {
        // 로그아웃 시 데이터 초기화
        setRecords([])
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      setUser(null)
      setRecords([])
      router.refresh()
      
      // 확실한 이동을 위해 window.location 사용
      window.location.href = '/login'
    } catch (error) {
      console.error('로그아웃 오류:', error)
      setIsLoggingOut(false)
    }
  }


  if (isLoading) {
    return (
      <main className="min-h-screen bg-coolgray-25 flex items-center justify-center">
        <IconLoader2 className="w-8 h-8 animate-spin text-brand-600" />
      </main>
    )
  }

  // 비로그인 상태: 랜딩 페이지
  if (!user) {
    return (
      <main className="min-h-screen bg-[#F2F4F6] flex flex-col">
        {/* 1. 상단 로고 */}
        <div className="text-center pt-8 mb-8">
          <h1 className="text-green-500 font-bold text-2xl">토리치</h1>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="w-full max-w-sm">
            {/* 2. 설명 카드 (White Card) - 텍스트와 이미지만 포함 */}
            <div className="bg-white w-full rounded-[32px] px-6 py-10 shadow-sm">
              {/* 타이틀 */}
              <h2 className="text-2xl font-bold text-gray-900 leading-tight text-left mb-3 whitespace-pre-line">
                내가 심은 작은 도토리,{'\n'}10년 뒤엔 얼마가 될까요?
              </h2>

              {/* 서브 텍스트 */}
              <p className="text-gray-500 text-sm leading-relaxed text-left mb-8 whitespace-pre-line">
                막연한 부자의 꿈, 숫자로 확인해보세요.{'\n'}복리 계산기가 10초 만에 알려드려요.
              </p>

              {/* 이미지 영역 */}
              <div className="w-48 h-48 mx-auto bg-gray-50 rounded-full flex items-center justify-center">
                <span className="text-4xl">🐿️</span>
              </div>
            </div>

            {/* 3. 메인 버튼 (Green Button) - 카드 밖으로 분리 */}
            <button
              onClick={() => router.push('/add')}
              className="w-full bg-[#00C261] hover:bg-green-600 text-white text-lg font-bold py-4 rounded-2xl shadow-md mt-5 mb-8 transition-colors"
            >
              계산기 두드려보기
            </button>

            {/* 4. 로그인 영역 */}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-3">이미 람쥐이신가요?</p>
              <button
                onClick={() => router.push('/login')}
                className="bg-[#E5E7EB] text-coolgray-600 px-8 py-3 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 로그인 상태: 기존 대시보드
  return (
    <main className="min-h-screen bg-coolgray-25">
      {/* 상단 헤더 */}
      <header className="h-[52px] flex items-center justify-between px-4">
        <h1 className="font-bold text-coolgray-900 text-xl">
          티끌모아 태산
        </h1>
        <div className="flex items-center gap-3">
          {/* 유저 프로필 UI */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <IconUser className="w-4 h-4 text-brand-600" />
            </div>
            <span className="text-sm text-coolgray-700 hidden sm:inline">
              {user.email?.split('@')[0] || '사용자'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2 text-coolgray-700 hover:text-coolgray-900 transition-colors disabled:opacity-50"
            aria-label="로그아웃"
          >
            <IconLogout className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-6">
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
              {user && records.length > 0
                ? formatCurrency(
                    records.reduce((sum, record) => sum + parseFloat(record.expected_amount), 0)
                  )
                : '0만원'}
            </div>
            
            {/* Footer */}
            <div className="text-coolgray-700 text-lg font-medium">
              매월{' '}
              <span className="text-brand-600 font-semibold">
                {user && records.length > 0
                  ? formatCurrency(
                      records.reduce((sum, record) => sum + record.monthly_amount, 0)
                    )
                  : '0만원'}
              </span>
              씩 모으고 있어요
            </div>
          </div>
        </div>

        {/* 투자 목록 추가하기 버튼 */}

        <button 
          onClick={() => router.push('/add')}
          className="w-full bg-brand-600 text-white font-bold rounded-2xl py-4 shadow-lg flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
        >
          <IconPlus className="w-5 h-5" />
          투자 목록 추가하기
        </button>

        {/* 하단 리스트 카드 */}
        {records.length > 0 ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-coolgray-900 mb-4">
                내 투자 목록
              </h2>
              <div className="space-y-1">
                {records.map((item) => {
                  // 수익금 계산: 예상 금액 - 투자 원금 (월 투자액 * 12 * 기간)
                  const expectedAmount = parseFloat(item.expected_amount)
                  const totalInvested = item.monthly_amount * 12 * item.period_years
                  const profit = expectedAmount - totalInvested
                  
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-4 px-2 border-b border-coolgray-100 last:border-b-0"
                    >
                      {/* 좌측 영역 */}
                      <div className="flex flex-col">
                        {/* 종목명 */}
                        <div className="text-lg font-bold text-coolgray-900 mb-1">
                          {item.title}
                        </div>
                        {/* 상세 정보 */}
                        <div className="text-sm text-coolgray-500">
                          월 {formatCurrency(item.monthly_amount)} · {item.period_years}년
                        </div>
                      </div>
                      
                      {/* 우측 영역 */}
                      <div className="flex flex-col items-end">
                        {/* 최종 예상 금액 */}
                        <div className="text-xl font-bold text-coolgray-900 mb-1">
                          {formatCurrency(item.expected_amount)}
                        </div>
                        {/* 수익금 배지 */}
                        <div className="bg-[#E0F8E8] text-green-600 rounded-full px-3 py-0.5 text-sm font-medium">
                          + {formatCurrency(profit)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
              <p className="text-coolgray-500 text-lg">
                아직 등록된 투자가 없어요
              </p>
              <button 
                onClick={() => router.push('/add')}
                className="bg-brand-600 text-white font-bold rounded-2xl py-4 px-8 shadow-lg flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
              >
                <IconPlus className="w-5 h-5" />
                투자 목록 추가하기
              </button>
            </div>
          )}
      </div>
    </main>
  )
}
