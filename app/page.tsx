'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export default function Home() {
  const [dbStatus, setDbStatus] = useState('⏳ DB 연결 확인 중...')
  const [envCheck, setEnvCheck] = useState('확인 중...')

  useEffect(() => {
    // 1. 환경변수 확인
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setEnvCheck(hasUrl && hasKey ? '✅ 환경변수 있음' : '❌ 환경변수 없음 (Vercel 설정 확인 필요)')

    // 2. 실제 DB 통신 시도
    const checkDB = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseKey)
      // records 테이블에서 아무거나 조회 시도
      const { data, error } = await supabase.from('records').select('*').limit(1)
      
      if (error) {
        console.error(error)
        setDbStatus(`❌ 연결 실패: ${error.message}`)
      } else {
        setDbStatus('✅ Supabase DB 연결 성공! (데이터 조회 가능)')
      }
    }

    checkDB()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-4 bg-slate-50">
      <h1 className="text-3xl font-bold text-slate-900">티클모아태산 서버 점검</h1>
      
      <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-600">Vercel 배포 상태</span>
          <span className="text-green-600 font-bold">🟢 정상</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-600">환경변수(Key)</span>
          <span className={envCheck.includes('✅') ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {envCheck}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-600">DB 연결</span>
          <span className={dbStatus.includes('✅') ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {dbStatus.includes('✅') ? '✅ 연결됨' : '❌ 실패'}
          </span>
        </div>
        
        {/* 실패 시 에러 메시지 크게 보여주기 */}
        {!dbStatus.includes('✅') && !dbStatus.includes('⏳') && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md mt-4">
            {dbStatus}
          </div>
        )}
      </div>
    </main>
  )
}