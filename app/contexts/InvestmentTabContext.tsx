'use client'

import { createContext, useContext, useRef, useState, ReactNode } from 'react'

export type TabType = 'overview' | 'info' | 'history'

interface InvestmentTabContextType {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  overviewRef: React.RefObject<HTMLElement | null>
  infoRef: React.RefObject<HTMLElement | null>
  historyRef: React.RefObject<HTMLElement | null>
  titleRef: React.RefObject<HTMLDivElement | null>
  handleTabClick: (tab: TabType) => void
}

const InvestmentTabContext = createContext<InvestmentTabContextType | undefined>(undefined)

interface InvestmentTabProviderProps {
  children: ReactNode
  initialTab?: TabType
}

export function InvestmentTabProvider({ 
  children, 
  initialTab = 'overview' 
}: InvestmentTabProviderProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const overviewRef = useRef<HTMLElement>(null)
  const infoRef = useRef<HTMLElement>(null)
  const historyRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab)
    const container = scrollContainerRef.current
    if (!container) return

    const target =
      tab === 'overview'
        ? overviewRef.current
        : tab === 'info'
          ? infoRef.current
          : historyRef.current

    if (!target) return

    const headerAndTabsHeight = 52 + 40
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const currentScrollTop = container.scrollTop
    const offset = targetRect.top - containerRect.top + currentScrollTop - headerAndTabsHeight

    container.scrollTo({ top: offset, behavior: 'smooth' })
  }

  const value = {
    activeTab,
    setActiveTab,
    scrollContainerRef,
    overviewRef,
    infoRef,
    historyRef,
    titleRef,
    handleTabClick,
  }

  return (
    <InvestmentTabContext.Provider value={value}>
      {children}
    </InvestmentTabContext.Provider>
  )
}

export function useInvestmentTabContext() {
  const context = useContext(InvestmentTabContext)
  if (context === undefined) {
    throw new Error('useInvestmentTabContext must be used within an InvestmentTabProvider')
  }
  return context
}
