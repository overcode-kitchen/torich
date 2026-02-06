'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CircleNotch, Sun, Moon, Devices } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useTheme, type Theme } from '@/app/components/ThemeProvider'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [notificationOn, setNotificationOn] = useState(true)
  const [isBrandStoryOpen, setIsBrandStoryOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser()
      setUser(u)
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('torich_notification_global')
        setNotificationOn(stored === null ? true : stored === '1')
      }
      setIsLoading(false)
    }
    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    // 렌더링 중이 아닌 시점에 리다이렉트 수행
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, user, router])

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
      <main className="min-h-screen bg-surface flex items-center justify-center">
        <CircleNotch className="w-8 h-8 animate-spin text-muted-foreground" />
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <h1 className="text-xl font-bold text-foreground mb-6">설정</h1>

        {/* 다크모드 */}
        <section className="bg-card rounded-2xl overflow-hidden mb-4">
          <h2 className="text-sm font-semibold text-foreground-muted px-4 pt-4 pb-2">표시</h2>
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-3">테마</p>
            <div className="flex gap-2">
              {(
                [
                  { value: 'light' as Theme, label: '라이트', icon: Sun },
                  { value: 'dark' as Theme, label: '다크', icon: Moon },
                  { value: 'system' as Theme, label: '시스템', icon: Devices },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-colors ${
                    theme === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-subtle bg-surface hover:bg-surface-hover text-foreground-soft'
                  }`}
                >
                  <Icon className="w-5 h-5" weight={theme === value ? 'fill' : 'regular'} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              시스템: 기기 설정(라이트/다크)을 따릅니다.
            </p>
          </div>
        </section>

        {/* 알림 설정 */}
        <section className="bg-card rounded-2xl overflow-hidden mb-4">
          <h2 className="text-sm font-semibold text-foreground-muted px-4 pt-4 pb-2">알림</h2>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
            <span className="text-foreground font-medium">전체 알림</span>
            <Switch
              checked={notificationOn}
              onCheckedChange={toggleNotification}
              aria-label="전체 알림"
            />
          </div>
          <p className="text-xs text-muted-foreground px-4 pb-4">(추후) 알림 시간대, 메시지 톤 설정</p>
        </section>

        {/* 계정 */}
        <section className="bg-card rounded-2xl overflow-hidden mb-4">
          <h2 className="text-sm font-semibold text-foreground-muted px-4 pt-4 pb-2">계정</h2>
          <div className="px-4 py-3 border-t border-border-subtle">
            <p className="text-sm text-muted-foreground">로그인된 이메일</p>
            <p className="text-foreground font-medium mt-0.5">{user.email || '-'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-4 py-3 text-left text-destructive font-medium hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors border-t border-border-subtle"
          >
            {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
          </button>
        </section>

        {/* 브랜드 스토리 */}
        <section className="bg-card rounded-2xl overflow-hidden mb-4">
          <h2 className="text-sm font-semibold text-foreground-muted px-4 pt-4 pb-2">브랜드 스토리</h2>
          <button
            type="button"
            onClick={() => setIsBrandStoryOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 border-t border-border-subtle hover:bg-surface-hover transition-colors"
            aria-haspopup="dialog"
            aria-expanded={isBrandStoryOpen}
          >
            <div className="flex flex-col items-start">
              <span className="text-foreground font-medium">토리치가 궁금하다면</span>
              <span className="text-sm text-muted-foreground mt-0.5">
                이름에 담긴 의미와 우리가 추구하는 방향을 소개해요.
              </span>
            </div>
            <span className="ml-3 text-foreground-subtle text-lg" aria-hidden="true">
              ›
            </span>
          </button>
        </section>

        {/* 브랜드 스토리 바텀시트 */}
        {isBrandStoryOpen && (
          <div
            className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="토리치 브랜드 스토리"
            onClick={() => setIsBrandStoryOpen(false)}
          >
            <div
              className="bg-card rounded-t-3xl max-h-[80vh] max-w-md mx-auto w-full shadow-xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mt-3 mb-3 h-1 w-10 rounded-full bg-surface-strong shrink-0" />
              <div className="flex-1 overflow-y-auto scrollbar-thin px-6 pb-4 pt-1 min-h-0">
                <div className="mb-4">
                  <div className="relative w-full">
                    <Image
                      src="/images/torich-squirrel.png"
                      alt="도토리를 모으는 토리치 람쥐 일러스트"
                      width={368}
                      height={460}
                      className="w-full h-auto rounded-xl"
                      priority
                    />
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  토리치(Torich)는 &quot;(도)토리 + 리치&quot;의 합성어예요.
                </h2>
                <div className="space-y-3 text-sm leading-relaxed text-foreground-soft">
                  <p>
                    도토리를 조금씩 모으듯, 작은 투자와 저축이 쌓여 언젠가 &quot;리치&quot;한 삶으로 이어진다는 믿음에서
                    시작된 이름이에요. 한 번에 큰 결심을 요구하기보다는, 오늘 할 수 있는 가장 작고 부드러운 한 걸음을
                    도와주는 투자 동반자를 지향합니다.
                  </p>
                  <p>
                    토리치는 어려운 전문 용어보다 &quot;적립식 투자&quot;를 쉽게 시작하고, 꾸준히 이어갈 수 있게 도와주는
                    서비스예요. 캘린더와 그래프, 목표 금액과 투자 기록을 통해 &quot;나는 얼마나 잘 쌓아가고 있는가&quot;를
                    한눈에 확인할 수 있도록 설계했어요.
                  </p>
                  <div className="pt-1">
                    <p className="text-foreground font-medium mb-1">우리가 사용자에게 바라는 것</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>단기 수익보다, 내가 원하는 삶의 속도와 방향을 먼저 떠올리기</li>
                      <li>완벽한 투자자가 되기보다, 꾸준한 투자자가 되기</li>
                      <li>숫자에 쫓기지 않고, 숫자를 통해 마음이 편안해지는 경험을 쌓기</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="shrink-0 px-6 pb-6 pt-4 bg-card rounded-b-3xl">
                <Button
                  type="button"
                  onClick={() => setIsBrandStoryOpen(false)}
                  size="lg"
                  className="w-full"
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 앱 정보 */}
        <section className="bg-card rounded-2xl overflow-hidden">
          <h2 className="text-sm font-semibold text-foreground-muted px-4 pt-4 pb-2">앱 정보</h2>
          <div className="px-4 py-3 border-t border-border-subtle flex justify-between items-center">
            <span className="text-foreground">버전</span>
            <span className="text-muted-foreground text-sm">1.0.0</span>
          </div>
          <a
            href="mailto:support@torich.app"
            className="block px-4 py-3 text-foreground font-medium hover:bg-surface-hover border-t border-border-subtle"
          >
            문의하기
          </a>
          <a
            href="#"
            className="block px-4 py-3 text-foreground-muted text-sm hover:bg-surface-hover border-t border-border-subtle"
          >
            이용약관
          </a>
          <a
            href="#"
            className="block px-4 py-3 text-foreground-muted text-sm hover:bg-surface-hover border-t border-border-subtle"
          >
            개인정보처리방침
          </a>
        </section>
      </div>
    </main>
  )
}

