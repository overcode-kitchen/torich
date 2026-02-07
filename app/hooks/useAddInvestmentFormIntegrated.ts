'use client'

import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { validateInvestmentForm } from '@/app/utils/validation'
import { calculateFinalAmount } from '@/app/utils/finance'

// 기존 훅들 import
import { useStockSearch, type SearchResult } from '@/app/hooks/useStockSearch'
import { useManualInput } from '@/app/hooks/useManualInput'
import { useRateEditor } from '@/app/hooks/useRateEditor'

type InputChangeEvent = ChangeEvent<HTMLInputElement>

export interface UseAddInvestmentFormIntegratedReturn {
  // 폼 상태
  stockName: string
  setStockName: (name: string) => void
  monthlyAmount: string
  period: string
  startDate: Date
  setStartDate: (date: Date) => void
  investmentDays: number[]
  setInvestmentDays: (days: number[]) => void

  // 제출 상태
  isSubmitting: boolean
  setIsSubmitting: (submitting: boolean) => void
  userId: string | null

  // 입력 처리
  handleAmountChange: (e: InputChangeEvent) => void
  adjustAmount: (delta: number) => void
  handlePeriodChange: (e: InputChangeEvent) => void
  adjustPeriod: (delta: number) => void

  // 주식 검색 관련
  isSearching: boolean
  searchResults: SearchResult[]
  showDropdown: boolean
  setShowDropdown: (show: boolean) => void
  selectedStock: any
  setSelectedStock: (stock: any) => void
  market: 'KR' | 'US'
  setMarket: (market: 'KR' | 'US') => void
  annualRate: number
  setAnnualRate: (rate: number) => void
  originalSystemRate: number | null
  setOriginalSystemRate: (rate: number | null) => void
  isRateLoading: boolean
  rateFetchFailed: boolean
  setRateFetchFailed: (failed: boolean) => void
  handleSelectStock: (stock: SearchResult) => Promise<void>
  resetSearch: () => void

  // 수동 입력 관련
  isManualModalOpen: boolean
  setIsManualModalOpen: (open: boolean) => void
  manualStockName: string
  setManualStockName: (name: string) => void
  manualRate: string
  setManualRate: (rate: string) => void
  isManualInput: boolean
  setIsManualInput: (manual: boolean) => void
  handleManualConfirm: (callbacks: { onConfirm: (name: string, rate: number) => void }) => void
  closeAndResetManual: () => void

  // 수익률 편집 관련
  isRateEditing: boolean
  editingRate: string
  startEditing: (currentRate: number) => void
  confirmEdit: (onConfirm: (newRate: number) => void) => void
  cancelEdit: () => void
  handleRateChange: (value: string) => void

  // 폼 제출
  handleSubmit: (e: React.FormEvent) => Promise<void>

  // 유틸리티
  handleMarketChange: (newMarket: 'KR' | 'US') => void
}

export function useAddInvestmentFormIntegrated(): UseAddInvestmentFormIntegratedReturn {
  const router = useRouter()

  // 기본 폼 상태
  const [stockName, setStockName] = useState<string>('')
  const [monthlyAmount, setMonthlyAmount] = useState<string>('')
  const [period, setPeriod] = useState<string>('')
  const [startDate, setStartDate] = useState<Date>(() => new Date())
  const [investmentDays, setInvestmentDays] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [userId, setUserId] = useState<string | null>(null)

  // 기존 훅들 사용
  const stockSearch = useStockSearch(stockName, false)
  const manualInput = useManualInput()
  const rateEditor = useRateEditor()

  // 사용자 정보 가져오기
  useEffect(() => {
    const getUser = async (): Promise<void> => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
      } else {
        router.push('/login')
      }
    }

    void getUser()
  }, [router])

  // 입력 처리 함수들
  const handleAmountChange = (e: InputChangeEvent): void => {
    const value = e.target.value.replace(/[^0-9]/g, '')

    if (value === '') {
      setMonthlyAmount('')
      return
    }

    const formatted = parseInt(value).toLocaleString('ko-KR')
    setMonthlyAmount(formatted)
  }

  const adjustAmount = (delta: number): void => {
    const currentValue = monthlyAmount ? parseInt(monthlyAmount.replace(/,/g, '')) : 0
    const newValue = Math.max(0, currentValue + delta)

    if (newValue === 0) {
      setMonthlyAmount('')
    } else {
      setMonthlyAmount(newValue.toLocaleString('ko-KR'))
    }
  }

  const handlePeriodChange = (e: InputChangeEvent): void => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setPeriod(value)
  }

  const adjustPeriod = (delta: number): void => {
    const currentValue = period ? parseInt(period) : 0
    const newValue = Math.max(1, currentValue + delta)
    setPeriod(String(newValue))
  }

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    // 유효성 검사
    const validation = validateInvestmentForm({
      stockName,
      monthlyAmount,
      period,
      userId,
      investmentDays,
    })

    if (!validation.isValid) {
      alert(validation.errorMessage)
      if (validation.errorMessage?.includes('로그인')) {
        router.push('/login')
      }
      return
    }

    try {
      setIsSubmitting(true)

      const supabase = createClient()
      // 콤마 제거 후 숫자로 변환하고 만원 단위로 처리 (원 단위로 변환)
      const monthlyAmountInWon = parseInt(monthlyAmount.replace(/,/g, '')) * 10000
      const periodYearsNum = parseInt(period)
      // 검색으로 선택한 수익률 또는 기본값(10%) 사용
      const finalAmount = calculateFinalAmount(monthlyAmountInWon, periodYearsNum, stockSearch.annualRate)

      // is_custom_rate 판별: 직접 입력했거나, 시스템 값을 수정한 경우 true
      const isCustomRate = manualInput.isManualInput || (stockSearch.originalSystemRate !== null && stockSearch.annualRate !== stockSearch.originalSystemRate)

      // symbol 결정: 검색을 통해 선택한 경우 selectedStock.symbol, 직접 입력은 null
      const stockSymbol = !manualInput.isManualInput && stockSearch.selectedStock?.symbol ? stockSearch.selectedStock.symbol : null

      // Supabase에 데이터 저장
      const { error } = await supabase
        .from('records')
        .insert({
          user_id: userId,
          title: stockName.trim(),
          symbol: stockSymbol,
          monthly_amount: monthlyAmountInWon,
          period_years: periodYearsNum,
          annual_rate: stockSearch.annualRate,
          final_amount: finalAmount,
          start_date: startDate.toISOString().split('T')[0],
          investment_days: investmentDays.length > 0 ? investmentDays : null,
          is_custom_rate: isCustomRate,
        })

      if (error) {
        console.error('저장 오류:', error)
        alert('저장에 실패했습니다. 다시 시도해주세요.')
        return
      }

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

  // 마켓 변경 처리
  const handleMarketChange = (newMarket: 'KR' | 'US'): void => {
    if (stockSearch.market !== newMarket) {
      stockSearch.setMarket(newMarket)
      setStockName('')
      stockSearch.resetSearch()
      manualInput.setIsManualInput(false)
      rateEditor.cancelEdit()
    }
  }

  return {
    // 폼 상태
    stockName,
    setStockName,
    monthlyAmount,
    period,
    startDate,
    setStartDate,
    investmentDays,
    setInvestmentDays,

    // 제출 상태
    isSubmitting,
    setIsSubmitting,
    userId,

    // 입력 처리
    handleAmountChange,
    adjustAmount,
    handlePeriodChange,
    adjustPeriod,

    // 주식 검색 관련
    ...stockSearch,

    // 수동 입력 관련
    isManualModalOpen: manualInput.isManualModalOpen,
    setIsManualModalOpen: manualInput.setIsManualModalOpen,
    manualStockName: manualInput.manualStockName,
    setManualStockName: manualInput.setManualStockName,
    manualRate: manualInput.manualRate,
    setManualRate: manualInput.setManualRate,
    isManualInput: manualInput.isManualInput,
    setIsManualInput: manualInput.setIsManualInput,
    handleManualConfirm: manualInput.handleManualConfirm,
    closeAndResetManual: manualInput.closeAndReset,

    // 수익률 편집 관련
    isRateEditing: rateEditor.isRateEditing,
    editingRate: rateEditor.editingRate,
    startEditing: rateEditor.startEditing,
    confirmEdit: rateEditor.confirmEdit,
    cancelEdit: rateEditor.cancelEdit,
    handleRateChange: rateEditor.handleRateChange,

    // 폼 제출
    handleSubmit,

    // 유틸리티
    handleMarketChange,
  }
}
