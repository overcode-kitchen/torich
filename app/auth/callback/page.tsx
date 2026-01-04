'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      // 로그인 후 이동할 주소 (없으면 메인으로)
      const next = searchParams.get('next') ?? '/'
      
      // 해시 프래그먼트에서 토큰 추출 (PKCE가 아닌 경우)
      const hash = window.location.hash.substring(1)
      const hashParams = new URLSearchParams(hash)
      
      // 쿼리 파라미터에서 code 추출 (PKCE인 경우)
      const code = searchParams.get('code')
      
      if (code) {
        // PKCE 플로우: code를 세션으로 교환
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error) {
            router.replace(next)
            return
          }
        } catch (error) {
          console.error('Code exchange error:', error)
        }
      } else if (hashParams.get('access_token')) {
        // Implicit 플로우: 해시에서 토큰 추출 (PKCE가 작동하지 않은 경우)
        // 이 경우는 Supabase가 자동으로 처리하지만, 명시적으로 세션 설정
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: hashParams.get('access_token')!,
            refresh_token: hashParams.get('refresh_token') || '',
          })
          
          if (!error && data.session) {
            router.replace(next)
            return
          }
        } catch (error) {
          console.error('Session set error:', error)
        }
      }
      
      // 에러 발생 시 에러 페이지로
      router.replace('/auth/auth-code-error')
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-coolgray-25 flex items-center justify-center">
      <div className="text-center">
        <p className="text-coolgray-700">로그인 처리 중...</p>
      </div>
    </div>
  )
}

