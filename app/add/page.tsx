'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  CircleNotch,
  Info,
  X,
  CalendarBlank,
  CaretDown,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { createClient } from '@/utils/supabase/client'
import { formatCurrency } from '@/lib/utils'
import InvestmentDaysPickerSheet from '@/app/components/InvestmentDaysPickerSheet'
import { useStockSearch, type SearchResult } from '@/app/hooks/useStockSearch'
import { useManualInput } from '@/app/hooks/useManualInput'
import { useRateEditor } from '@/app/hooks/useRateEditor'
import { useAddInvestmentForm } from '@/app/hooks/useAddInvestmentForm'
import ManualInputModal from '@/app/components/ManualInputModal'
import RateHelpModal from '@/app/components/RateHelpModal'
import StockSearchInput from '@/app/components/StockSearchInput'
import RateDisplay from '@/app/components/RateDisplay'
import InvestmentPreviewCard from '@/app/components/InvestmentPreviewCard'
import AmountInput from '@/app/components/AmountInput'
import PeriodInput from '@/app/components/PeriodInput'
import { calculateFinalAmount } from '@/app/utils/finance'
// import { sendGAEvent } from '@next/third-parties/google'

export default function AddInvestmentPage() {
  const router = useRouter()
  const {
    stockName,
    setStockName,
    monthlyAmount,
    period,
    startDate,
    setStartDate,
    investmentDays,
    setInvestmentDays,
    isSubmitting,
    setIsSubmitting,
    userId,
    handleAmountChange,
    adjustAmount,
    handlePeriodChange,
    adjustPeriod,
  } = useAddInvestmentForm()

  const {
    isManualModalOpen,
    setIsManualModalOpen,
    manualStockName,
    setManualStockName,
    manualRate,
    setManualRate,
    isManualInput,
    setIsManualInput,
    handleManualConfirm,
    closeAndReset: closeManualModal,
  } = useManualInput()

  const {
    isSearching,
    searchResults,
    showDropdown,
    setShowDropdown,
    selectedStock,
    setSelectedStock,
    market,
    setMarket,
    annualRate,
    setAnnualRate,
    originalSystemRate,
    setOriginalSystemRate,
    isRateLoading,
    rateFetchFailed,
    setRateFetchFailed,
    handleSelectStock,
    resetSearch,
  } = useStockSearch(stockName, isManualInput)

  const { isRateEditing, editingRate, startEditing, confirmEdit, cancelEdit, handleRateChange } = useRateEditor()

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)
  const [isDaysPickerOpen, setIsDaysPickerOpen] = useState<boolean>(false)
  const [isRateHelpModalOpen, setIsRateHelpModalOpen] = useState<boolean>(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    if (!stockName.trim()) {
      alert('종목명을 입력해주세요.')
      return
    }
    if (!monthlyAmount || parseInt(monthlyAmount) <= 0) {
      alert('월 투자액을 입력해주세요.')
      return
    }
    if (!period || parseInt(period) <= 0) {
      alert('투자 기간을 입력해주세요.')
      return
    }
    if (!userId) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }
    if (investmentDays.length === 0) {
      alert('매월 투자일을 선택해주세요. 알림을 받을 날짜를 선택하면 투자 일정을 쉽게 관리할 수 있어요.')
      return
    } 
    try {
      setIsSubmitting(true)

      const supabase = createClient()
      // 콤마 제거 후 숫자로 변환하고 만원 단위로 처리 (원 단위로 변환)
      const monthlyAmountInWon = parseInt(monthlyAmount.replace(/,/g, '')) * 10000
      const periodYearsNum = parseInt(period)
      // 검색으로 선택한 수익률 또는 기본값(10%) 사용
      const finalAmount = calculateFinalAmount(monthlyAmountInWon, periodYearsNum, annualRate)

      // is_custom_rate 판별: 직접 입력했거나, 시스템 값을 수정한 경우 true
      const isCustomRate = isManualInput || (originalSystemRate !== null && annualRate !== originalSystemRate)

      // symbol 결정: 검색을 통해 선택한 경우 selectedStock.symbol, 직접 입력은 null
      const stockSymbol = !isManualInput && selectedStock?.symbol ? selectedStock.symbol : null

      // Supabase에 데이터 저장 (만원 단위를 원 단위로 변환하여 저장)
      const { error } = await supabase
        .from('records')
        .insert({
          user_id: userId,
          title: stockName.trim(),
          symbol: stockSymbol, // 주식 심볼 (검색 선택 시만 저장)
          monthly_amount: monthlyAmountInWon,
          period_years: periodYearsNum,
          annual_rate: annualRate, // 실제 조회된 수익률 저장
          final_amount: finalAmount,
          start_date: startDate.toISOString().split('T')[0], // 투자 시작일
          investment_days: investmentDays.length > 0 ? investmentDays : null, // 매월 투자일
          is_custom_rate: isCustomRate, // 직접 입력 여부
        })

      if (error) {
        console.error('저장 오류:', error)
        alert('저장에 실패했습니다. 다시 시도해주세요.')
        return
      }

      // 저장 완료 이벤트 전송
      // sendGAEvent('event', 'click_add_investment_complete')

      // 성공 시 메인으로 이동
      router.refresh()
      router.push('/')
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarketChange = (newMarket: 'KR' | 'US'): void => {
    if (market !== newMarket) {
      setMarket(newMarket)
      setStockName('')
      resetSearch()
      setIsManualInput(false)
      cancelEdit()
    }
  }

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
            onClick={() => handleMarketChange('KR')}
            className={`py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              market === 'KR'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground-soft'
            }`}
          >
            🇰🇷 국내 주식
          </button>
          <button
            type="button"
            onClick={() => handleMarketChange('US')}
            className={`py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              market === 'US'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground-soft'
            }`}
          >
            🇺🇸 미국 주식
          </button>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {/* 종목명 입력 (검색 기능 포함) */}
          <div>
            <StockSearchInput
              stockName={stockName}
              onStockNameChange={(value) => {
                setIsManualInput(false) // 사용자가 다시 타이핑하면 검색 모드로 전환
                setStockName(value)
                setSelectedStock(null) // 입력 변경 시 선택 초기화
                setAnnualRate(10) // 기본값으로 리셋
                setOriginalSystemRate(null) // 원본 수익률 리셋
                cancelEdit() // 수정 모드 종료
              }}
              market={market}
              isSearching={isSearching}
              searchResults={searchResults}
              showDropdown={showDropdown}
              onSelectStock={(stock) => {
                setStockName(stock.name)
                void handleSelectStock(stock)
              }}
              onManualInputClick={() => {
                setIsManualModalOpen(true)
                setManualStockName(stockName)
                setShowDropdown(false)
              }}
              onDropdownClose={() => setShowDropdown(false)}
            />
            
            <RateDisplay
              isRateLoading={isRateLoading}
              rateFetchFailed={rateFetchFailed}
              isRateEditing={isRateEditing}
              isManualInput={isManualInput}
              stockName={stockName}
              selectedStock={selectedStock}
              annualRate={annualRate}
              originalSystemRate={originalSystemRate}
              editingRate={editingRate}
              onStartEditing={() => startEditing(annualRate)}
              onConfirmEdit={() => {
                if (originalSystemRate !== null) {
                  confirmEdit((newRate: number) => {
                    setAnnualRate(newRate)
                    setRateFetchFailed(false)
                  })
                } else {
                  confirmEdit((newRate: number) => setAnnualRate(newRate))
                }
              }}
              onCancelEdit={cancelEdit}
              onRateChange={handleRateChange}
              onRateHelpClick={() => setIsRateHelpModalOpen(true)}
            />
          </div>

          {/* 월 투자액 입력 (만원 단위) */}
          <AmountInput
            value={monthlyAmount}
            onChange={handleAmountChange}
            onAdjust={adjustAmount}
          />

          {/* 투자 기간 입력 */}
          <PeriodInput
            value={period}
            onChange={handlePeriodChange}
            onAdjust={adjustPeriod}
          />

          {/* 투자 시작일 입력 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground-soft px-1">
              투자 시작일
            </label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between font-normal bg-card rounded-2xl h-12 px-4 text-foreground border-border-subtle hover:bg-surface"
                >
                  {startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  <CaretDown className="w-5 h-5 text-foreground-subtle" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] overflow-hidden p-0"
                align="center"
              >
                <Calendar
                  mode="single"
                  selected={startDate}
                  className="mx-auto"
                  onSelect={(date) => {
                    if (date) {
                      setStartDate(date)
                      setIsDatePickerOpen(false)
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

            {investmentDays.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {[...investmentDays].sort((a, b) => a - b).map((day) => (
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
              onClick={() => setIsDaysPickerOpen(true)}
              className="w-full justify-between bg-card rounded-xl h-11 px-4 text-sm text-foreground border-border-subtle hover:bg-surface"
            >
              <span>
                {investmentDays.length > 0
                  ? `${[...investmentDays].sort((a, b) => a - b).join(', ')}일 선택됨`
                  : '날짜 선택하기'}
              </span>
              <CalendarBlank className="w-4 h-4 text-foreground-subtle" />
            </Button>
          </div>
        </form>

        <InvestmentPreviewCard
          stockName={stockName}
          monthlyAmount={monthlyAmount}
          period={period}
          annualRate={annualRate}
          isRateLoading={isRateLoading}
        />

        {/* 저장하기 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-surface-dark text-white font-medium rounded-xl py-4 hover:bg-surface-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
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
      {isDaysPickerOpen && (
        <InvestmentDaysPickerSheet
          days={investmentDays}
          onClose={() => setIsDaysPickerOpen(false)}
          onApply={(days) => {
            setInvestmentDays(days)
            setIsDaysPickerOpen(false)
          }}
        />
      )}
      
      <ManualInputModal
        isOpen={isManualModalOpen}
        onClose={closeManualModal}
        stockName={manualStockName}
        onStockNameChange={setManualStockName}
        rate={manualRate}
        onRateChange={setManualRate}
        onConfirm={() => {
          handleManualConfirm({
            onConfirm: (name: string, rate: number) => {
              setIsManualInput(true)
              setStockName(name)
              setAnnualRate(rate)
              setSelectedStock(null)
              setOriginalSystemRate(null)
              setRateFetchFailed(false)
              cancelEdit()
            },
          })
        }}
        onRateHelpClick={() => setIsRateHelpModalOpen(true)}
      />

      <RateHelpModal
        isOpen={isRateHelpModalOpen}
        onClose={() => setIsRateHelpModalOpen(false)}
      />
    </main>
  )
}