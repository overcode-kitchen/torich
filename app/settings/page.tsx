'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { IconLoader2 } from '@tabler/icons-react'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [notificationOn, setNotificationOn] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('torich_notification_global')
        setNotificationOn(stored === null ? true : stored === '1')
      }
      setIsLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.replace('/login')
      window.location.href = '/login'
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const toggleNotification = () => {
    const next = !notificationOn
    setNotificationOn(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('torich_notification_global', next ? '1' : '0')
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-coolgray-25 flex items-center justify-center">
        <IconLoader2 className="w-8 h-8 animate-spin text-brand-600" />
      </main>
    )
  }

  if (!user) {
    router.replace('/login')
    return null
  }

  return (
    <main className="min-h-screen bg-coolgray-25">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <h1 className="text-xl font-bold text-coolgray-900 mb-6">설정</h1>

        {/* 알림 설정 */}
        <section className="bg-white rounded-2xl overflow-hidden mb-4">
          <h2 className="text-sm font-semibold text-coolgray-600 px-4 pt-4 pb-2">알림</h2>
          <div className="flex items-center justify-between px-4 py-3 border-t border-coolgray-100">
            <span className="text-coolgray-900 font-medium">전체 알림</span>
            <button
              type="button"
              role="switch"
              aria-checked={notificationOn}
              onClick={toggleNotification}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                notificationOn ? 'bg-brand-500' : 'bg-coolgray-200'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  notificationOn ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-coolgray-500 px-4 pb-4">(추후) 알림 시간대, 메시지 톤 설정</p>
        </section>

        {/* 계정 */}
        <section className="bg-white rounded-2xl overflow-hidden mb-4">
          <h2 className="text-sm font-semibold text-coolgray-600 px-4 pt-4 pb-2">계정</h2>
          <div className="px-4 py-3 border-t border-coolgray-100">
            <p className="text-sm text-coolgray-500">로그인된 이메일</p>
            <p className="text-coolgray-900 font-medium mt-0.5">{user.email || '-'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-4 py-3 text-left text-red-600 font-medium hover:bg-red-50 transition-colors border-t border-coolgray-100"
          >
            {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
          </button>
        </section>

        {/* 앱 정보 */}
        <section className="bg-white rounded-2xl overflow-hidden">
          <h2 className="text-sm font-semibold text-coolgray-600 px-4 pt-4 pb-2">앱 정보</h2>
          <div className="px-4 py-3 border-t border-coolgray-100 flex justify-between items-center">
            <span className="text-coolgray-900">버전</span>
            <span className="text-coolgray-500 text-sm">1.0.0</span>
          </div>
          <a
            href="mailto:support@torich.app"
            className="block px-4 py-3 text-coolgray-900 font-medium hover:bg-coolgray-50 border-t border-coolgray-100"
          >
            문의하기
          </a>
          <a
            href="#"
            className="block px-4 py-3 text-coolgray-600 text-sm hover:bg-coolgray-50 border-t border-coolgray-100"
          >
            이용약관
          </a>
          <a
            href="#"
            className="block px-4 py-3 text-coolgray-600 text-sm hover:bg-coolgray-50 border-t border-coolgray-100"
          >
            개인정보처리방침
          </a>
        </section>
      </div>
    </main>
  )
}
