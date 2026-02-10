'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAddInvestmentData } from './useAddInvestmentData'
import { useAddInvestmentCalculations } from './useAddInvestmentCalculations'
import { useAddInvestmentUI } from './useAddInvestmentUI'
import { useStockSearch } from './useStockSearch'
import { useManualInput } from './useManualInput'
import { useRateEditor } from './useRateEditor'
import { validateInvestmentForm, validateAndHandleError } from '@/app/utils/validation'

export interface UseAddInvestmentFormReturn {
  // 기본 폼 상태
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
  userId: string | null

  // 입력 처리
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  adjustAmount: (delta: number) => void
  handlePeriodChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  adjustPeriod: (delta: number) => void

  // 주식 검색 관련
  isSearching: boolean
  searchResults: any[]
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
  handleSelectStock: (stock: any) => Promise<void>
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

export function useAddInvestmentForm(): UseAddInvestmentFormReturn {
  const router = useRouter()

  // 기존 훅들 사용
  const stockSearch = useStockSearch('', false)
  const manualInput = useManualInput()
  const rateEditor = useRateEditor()
  
  // 새로운 분리된 훅들
  const data = useAddInvestmentData()
  const ui = useAddInvestmentUI({
    stockSearch,
    manualInput,
    rateEditor,
  })
  
  const calculations = useAddInvestmentCalculations({
    monthlyAmount: ui.monthlyAmount,
    setMonthlyAmount: ui.setMonthlyAmount,
    period: ui.period,
    setPeriod: ui.setPeriod,
  })

  // 주식 검색 훅에 stockName 전달
  const updatedStockSearch = useStockSearch(ui.stockName, manualInput.isManualInput)

  // 폼 제출 처리
  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    // 유효성 검사
    const validation = validateInvestmentForm({
      stockName: ui.stockName,
      monthlyAmount: ui.monthlyAmount,
      period: ui.period,
      userId: data.userId,
      investmentDays: ui.investmentDays,
    })

    const isValid = validateAndHandleError(
      validation,
      (message) => alert(message),
      () => router.push('/login')
    )

    if (!isValid) return

    // 데이터 제출
    await data.handleSubmit({
      stockName: ui.stockName,
      monthlyAmount: ui.monthlyAmount,
      period: ui.period,
      startDate: ui.startDate,
      investmentDays: ui.investmentDays,
      annualRate: updatedStockSearch.annualRate,
      isManualInput: manualInput.isManualInput,
      originalSystemRate: updatedStockSearch.originalSystemRate,
      selectedStock: updatedStockSearch.selectedStock,
    })
  }, [ui, data, updatedStockSearch, manualInput.isManualInput, router])

  return {
    // 기본 폼 상태
    stockName: ui.stockName,
    setStockName: ui.setStockName,
    monthlyAmount: ui.monthlyAmount,
    period: ui.period,
    startDate: ui.startDate,
    setStartDate: ui.setStartDate,
    investmentDays: ui.investmentDays,
    setInvestmentDays: ui.setInvestmentDays,

    // 제출 상태
    isSubmitting: data.isSubmitting,
    userId: data.userId,

    // 입력 처리
    handleAmountChange: calculations.handleAmountChange,
    adjustAmount: calculations.adjustAmount,
    handlePeriodChange: calculations.handlePeriodChange,
    adjustPeriod: calculations.adjustPeriod,

    // 주식 검색 관련 (업데이트된 훅 사용)
    ...updatedStockSearch,

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
    handleMarketChange: ui.handleMarketChange,
  }
}
