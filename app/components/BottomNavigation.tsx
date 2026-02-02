'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconHome, IconChartBar, IconCalendar, IconSettings } from '@tabler/icons-react'

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: IconHome },
  { href: '/stats', label: '통계', icon: IconChartBar },
  { href: '/calendar', label: '캘린더', icon: IconCalendar },
  { href: '/settings', label: '설정', icon: IconSettings },
] as const

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-coolgray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]"
      aria-label="하단 네비게이션"
    >
      <div className="flex items-stretch justify-around h-16 max-w-md mx-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 gap-0.5 py-2 transition-colors ${
                isActive ? 'text-brand-600' : 'text-coolgray-400'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6 shrink-0" stroke={isActive ? 2 : 1.5} />
              <span className="text-xs font-medium truncate w-full text-center">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
