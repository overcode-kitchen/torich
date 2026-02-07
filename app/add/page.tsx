'use client'

import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  CircleNotch,
  CalendarBlank,
  CaretDown,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import InvestmentDaysPickerSheet from '@/app/components/InvestmentDaysPickerSheet'
import ManualInputModal from '@/app/components/ManualInputModal'
import RateHelpModal from '@/app/components/RateHelpModal'
import StockSearchInput from '@/app/components/StockSearchInput'
import RateDisplay from '@/app/components/RateDisplay'
import InvestmentPreviewCard from '@/app/components/InvestmentPreviewCard'
import AmountInput from '@/app/components/AmountInput'
import PeriodInput from '@/app/components/PeriodInput'
import { useAddInvestmentFormIntegrated } from '@/app/hooks/useAddInvestmentFormIntegrated'
import { useModalState } from '@/app/hooks/useModalState'

export default function AddInvestmentPage() {
  const router = useRouter()
  const form = useAddInvestmentFormIntegrated()
  const modals = useModalState()



  return (
    <main className="min-h-screen bg-surface">
      {/* 뒤로가기 버튼 */}
      <header className="h-[52px] flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-foreground-soft hover:text-foreground transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* 상단 헤더 텍스트 */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-foreground mb-3">
            람쥐씨, 어떤 꿈을 꾸고 계신가요?
          </h1>
          <p className="text-sm text-foreground-subtle whitespace-pre-line">
            매달 꾸준히 모았을 때,{'\n'}10년 뒤 얼마가 될지 바로 보여드릴게요.
          </p>
        </div>

        {/* 마켓 선택 탭 */}
        <div className="grid grid-cols-2 gap-1 bg-secondary p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => form.handleMarketChange('KR')}
            className={`py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              form.market === 'KR'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground-soft'
            }`}
          >
            🇰🇷 국내 주식
          </button>
          <button
            type="button"
            onClick={() => form.handleMarketChange('US')}
            className={`py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              form.market === 'US'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground-soft'
            }`}
          >
            🇺🇸 미국 주식
          </button>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={form.handleSubmit} className="space-y-4 mb-8">
          {/* 종목명 입력 (검색 기능 포함) */}
          <div>
            <StockSearchInput
              stockName={form.stockName}
              onStockNameChange={(value) => {
                form.setIsManualInput(false)
                form.setStockName(value)
                form.setSelectedStock(null)
                form.setAnnualRate(10)
                form.setOriginalSystemRate(null)
                form.cancelEdit()
              }}
              market={form.market}
              isSearching={form.isSearching}
              searchResults={form.searchResults}
              showDropdown={form.showDropdown}
              onSelectStock={(stock) => {
                form.setStockName(stock.name)
                void form.handleSelectStock(stock)
              }}
              onManualInputClick={() => {
                form.setIsManualModalOpen(true)
                form.setManualStockName(form.stockName)
                form.setShowDropdown(false)
              }}
              onDropdownClose={() => form.setShowDropdown(false)}
            />
            
            <RateDisplay
              isRateLoading={form.isRateLoading}
              rateFetchFailed={form.rateFetchFailed}
              isRateEditing={form.isRateEditing}
              isManualInput={form.isManualInput}
              stockName={form.stockName}
              selectedStock={form.selectedStock}
              annualRate={form.annualRate}
              originalSystemRate={form.originalSystemRate}
              editingRate={form.editingRate}
              onStartEditing={() => form.startEditing(form.annualRate)}
              onConfirmEdit={() => {
                if (form.originalSystemRate !== null) {
                  form.confirmEdit((newRate: number) => {
                    form.setAnnualRate(newRate)
                    form.setRateFetchFailed(false)
                  })
                } else {
                  form.confirmEdit((newRate: number) => form.setAnnualRate(newRate))
                }
              }}
              onCancelEdit={form.cancelEdit}
              onRateChange={form.handleRateChange}
              onRateHelpClick={() => modals.setIsRateHelpModalOpen(true)}
            />
          </div>

          {/* 월 투자액 입력 (만원 단위) */}
          <AmountInput
            value={form.monthlyAmount}
            onChange={form.handleAmountChange}
            onAdjust={form.adjustAmount}
          />

          {/* 투자 기간 입력 */}
          <PeriodInput
            value={form.period}
            onChange={form.handlePeriodChange}
            onAdjust={form.adjustPeriod}
          />

          {/* 투자 시작일 입력 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground-soft px-1">
              투자 시작일
            </label>
            <Popover open={modals.isDatePickerOpen} onOpenChange={modals.setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between font-normal bg-card rounded-2xl h-12 px-4 text-foreground border-border-subtle hover:bg-surface"
                >
                  {form.startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  <CaretDown className="w-5 h-5 text-foreground-subtle" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] overflow-hidden p-0"
                align="center"
              >
                <Calendar
                  mode="single"
                  selected={form.startDate}
                  className="mx-auto"
                  onSelect={(date) => {
                    if (date) {
                      form.setStartDate(date)
                      modals.setIsDatePickerOpen(false)
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-foreground-subtle px-1">
              투자를 시작한 날짜를 선택하세요. 기본값은 오늘입니다.
            </p>
          </div>


          {/* 매월 투자일 선택 - 요약 + 바텀 시트 */}
          <div className="rounded-2xl p-4 border border-border-subtle-lighter bg-card space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  매월 투자일
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  선택하면 다가오는 투자·캘린더에 일정이 표시돼요.
                </p>
              </div>
            </div>

            {form.investmentDays.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {[...form.investmentDays].sort((a, b) => a - b).map((day) => (
                  <span
                    key={day}
                    className="inline-flex items-center bg-[var(--brand-accent-bg)] text-[var(--brand-accent-text)] px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {day}일
                  </span>
                ))}
              </div>
            ) : null}

            <Button
              type="button"
              variant="outline"
              onClick={() => modals.setIsDaysPickerOpen(true)}
              className="w-full justify-between bg-card rounded-xl h-11 px-4 text-sm text-foreground border-border-subtle hover:bg-surface"
            >
              <span>
                {form.investmentDays.length > 0
                  ? `${[...form.investmentDays].sort((a, b) => a - b).join(', ')}일 선택됨`
                  : '날짜 선택하기'}
              </span>
              <CalendarBlank className="w-4 h-4 text-foreground-subtle" />
            </Button>
          </div>
        </form>

        <InvestmentPreviewCard
          stockName={form.stockName}
          monthlyAmount={form.monthlyAmount}
          period={form.period}
          annualRate={form.annualRate}
          isRateLoading={form.isRateLoading}
        />

        {/* 저장하기 버튼 */}
        <button
          onClick={form.handleSubmit}
          disabled={form.isSubmitting}
          className="w-full bg-surface-dark text-white font-medium rounded-xl py-4 hover:bg-surface-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {form.isSubmitting ? (
            <>
              <CircleNotch className="w-5 h-5 animate-spin" />
              <span>저장 중...</span>
            </>
          ) : (
            '저장하기'
          )}
        </button>
      </div>

      {/* 매월 투자일 선택 바텀 시트 */}
      {modals.isDaysPickerOpen && (
        <InvestmentDaysPickerSheet
          days={form.investmentDays}
          onClose={() => modals.setIsDaysPickerOpen(false)}
          onApply={(days) => {
            form.setInvestmentDays(days)
            modals.setIsDaysPickerOpen(false)
          }}
        />
      )}
      
      <ManualInputModal
        isOpen={form.isManualModalOpen}
        onClose={form.closeAndResetManual}
        stockName={form.manualStockName}
        onStockNameChange={form.setManualStockName}
        rate={form.manualRate}
        onRateChange={form.setManualRate}
        onConfirm={() => {
          form.handleManualConfirm({
            onConfirm: (name: string, rate: number) => {
              form.setIsManualInput(true)
              form.setStockName(name)
              form.setAnnualRate(rate)
              form.setSelectedStock(null)
              form.setOriginalSystemRate(null)
              form.setRateFetchFailed(false)
              form.cancelEdit()
            },
          })
        }}
        onRateHelpClick={() => modals.setIsRateHelpModalOpen(true)}
      />

      <RateHelpModal
        isOpen={modals.isRateHelpModalOpen}
        onClose={() => modals.setIsRateHelpModalOpen(false)}
      />
    </main>
  )
}