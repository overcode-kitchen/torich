'use client'

import { Bell, BellSlash, CalendarBlank, ArrowLeft, DotsThreeVertical } from '@phosphor-icons/react'
import { formatCurrency } from '@/lib/utils'
import { formatFullDate, formatNextPaymentDate } from '@/app/utils/date'
import { ProgressSection } from '@/app/components/InvestmentDetailSections/ProgressSection'
import { InfoSection } from '@/app/components/InvestmentDetailSections/InfoSection'
import { PaymentHistorySection } from '@/app/components/InvestmentDetailSections/PaymentHistorySection'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import type { Investment } from '@/app/types/investment'
import type { InfoSectionProps } from '@/app/components/InvestmentDetailSections/types'

interface InvestmentViewProps {
  item: Investment
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  notificationOn: boolean
  toggleNotification: () => void
  progress: number
  completed: boolean
  startDate: Date
  endDate: Date
  nextPaymentDate: Date | null
  paymentHistory: Array<{ monthLabel: string; yearMonth: string; completed: boolean }>
  hasMorePaymentHistory: boolean
  loadMore: () => void
  infoSectionProps: Omit<InfoSectionProps, 'isEditMode' | 'infoRef'>
  overviewRef: React.RefObject<HTMLElement>
  infoRef: React.RefObject<HTMLElement>
  historyRef: React.RefObject<HTMLElement>
  showStickyTitle: boolean
  titleRef: React.RefObject<HTMLDivElement>
}

export function InvestmentView({
  item,
  onBack,
  onEdit,
  onDelete,
  notificationOn,
  toggleNotification,
  progress,
  completed,
  startDate,
  endDate,
  nextPaymentDate,
  paymentHistory,
  hasMorePaymentHistory,
  loadMore,
  infoSectionProps,
  overviewRef,
  infoRef,
  historyRef,
  showStickyTitle,
  titleRef,
}: InvestmentViewProps) {
  const originalRate = item.annual_rate || 10
  const formatRate = (rate: number) => rate.toFixed(2).replace(/\.?0+$/, '')

  return (
    <>
      {/* 헤더 */}
      <header className="h-[52px] flex items-center justify-between px-6 bg-background sticky top-0 z-10 border-b border-border-subtle-lighter">
        <button
          onClick={onBack}
          className="p-2 text-foreground hover:text-foreground transition-colors -ml-1"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6" weight="regular" />
        </button>
        {showStickyTitle && (
          <h1 className="flex-1 text-center text-base font-semibold tracking-tight text-foreground truncate mx-2">
            {item.title}
          </h1>
        )}
        {!showStickyTitle && <div className="flex-1" />}

        <div className="flex items-center -mr-1">
          <button
            type="button"
            onClick={toggleNotification}
            className="p-2 text-foreground hover:text-foreground transition-colors"
            aria-label={notificationOn ? '알림 끄기' : '알림 켜기'}
          >
            {notificationOn ? (
              <Bell className="w-6 h-6" weight="regular" />
            ) : (
              <BellSlash className="w-6 h-6 text-muted-foreground" weight="regular" />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-foreground hover:text-foreground transition-colors"
                aria-label="메뉴"
              >
                <DotsThreeVertical className="w-6 h-6" weight="regular" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[140px]">
              <DropdownMenuItem onClick={onEdit}>
                수정하기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                삭제하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 콘텐츠 */}
      <div className="max-w-md mx-auto px-6 pb-12">
        {/* 종목명 & 상태 + 다음 투자일 */}
        <section ref={overviewRef} className="py-6 space-y-4">
          <div ref={titleRef}>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
              {item.title}
            </h2>
            {completed && (
              <p className="text-sm font-medium text-green-600">
                목표 달성! 🎉
              </p>
            )}
          </div>

          {/* 섹션 내비게이션 탭 */}
          <div className="sticky top-[52px] z-10 -mx-6 px-6 bg-background border-b border-border-subtle-lighter">
            <div className="flex gap-6">
              <button
                type="button"
                className="py-3 text-sm font-medium transition-colors border-b-2 border-foreground text-foreground"
              >
                개요
              </button>
              <button
                type="button"
                className="py-3 text-sm font-medium transition-colors border-b-2 border-transparent text-foreground-subtle hover:text-foreground-soft"
              >
                투자 정보
              </button>
              <button
                type="button"
                className="py-3 text-sm font-medium transition-colors border-b-2 border-transparent text-foreground-subtle hover:text-foreground-soft"
              >
                납입 기록
              </button>
            </div>
          </div>

          {nextPaymentDate && (
            <Alert className="mt-1 border-none bg-primary/10 text-foreground px-4 py-3 rounded-2xl">
              <CalendarBlank className="w-5 h-5 text-primary" />
              <div className="flex items-baseline justify-between gap-4 col-start-2 w-full">
                <div>
                  <AlertTitle className="text-sm font-medium text-foreground-soft">
                    다음 투자일
                  </AlertTitle>
                  <AlertDescription className="mt-0.5 text-base font-semibold text-primary">
                    {formatNextPaymentDate(nextPaymentDate)}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </section>

        {/* 진행률 */}
        <ProgressSection
          progress={progress}
          completed={completed}
          startDate={startDate}
          endDate={endDate}
        />

        <div className="divide-y divide-border-subtle-lighter">
          <InfoSection
            {...infoSectionProps}
            isEditMode={false}
            infoRef={infoRef as any}
            setIsDaysPickerOpen={() => {}}
          />

          {paymentHistory.length > 0 && (
            <PaymentHistorySection
              item={item}
              paymentHistory={paymentHistory}
              hasMorePaymentHistory={hasMorePaymentHistory}
              loadMore={loadMore}
              historyRef={historyRef}
            />
          )}
        </div>
      </div>
    </>
  )
}
