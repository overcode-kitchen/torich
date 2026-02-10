'use client'

import { Investment } from '@/app/types/investment'
import { useNotificationToggle } from '@/app/hooks/useNotificationToggle'
import { useInvestmentDetailEdit } from '@/app/hooks/useInvestmentDetailEdit'
import { useInvestmentCalculations } from '@/app/hooks/useInvestmentCalculations'
import { getPaymentHistoryFromStart } from '@/app/utils/payment-history'
import { usePaymentPagination } from '@/app/hooks/usePaymentPagination'

interface UseInvestmentDataProps {
  item: Investment
  isEditMode: boolean
  calculateFutureValue: (monthlyAmount: number, T: number, P: number, R: number) => number
}

interface UseInvestmentDataReturn {
  // 알림
  notificationOn: boolean
  toggleNotification: () => void

  // 수정 폼
  editMonthlyAmount: string
  setEditMonthlyAmount: (value: string) => void
  editPeriodYears: string
  setEditPeriodYears: (value: string) => void
  editAnnualRate: string
  setEditAnnualRate: (value: string) => void
  editInvestmentDays: number[]
  setEditInvestmentDays: (days: number[] | ((prev: number[]) => number[])) => void
  isRateManuallyEdited: boolean
  setIsRateManuallyEdited: (edited: boolean) => void
  handleNumericInput: (value: string, setter: (v: string) => void) => void
  handleRateInput: (value: string) => void
  initializeFromItem: (item: Investment) => void

  // 계산된 값
  startDate: Date
  displayMonthlyAmount: number
  displayPeriodYears: number
  displayAnnualRate: number
  endDate: Date
  calculatedFutureValue: number
  totalPrincipal: number
  calculatedProfit: number
  progress: number
  completed: boolean
  nextPaymentDate: Date | null

  // 납입 기록
  paymentHistory: Array<{ monthLabel: string; yearMonth: string; completed: boolean }>
  hasMorePaymentHistory: boolean
  loadMore: () => void
}

export function useInvestmentData({
  item,
  isEditMode,
  calculateFutureValue,
}: UseInvestmentDataProps): UseInvestmentDataReturn {
  // 알림 훅
  const { notificationOn, toggleNotification } = useNotificationToggle(item.id)

  // 수정 폼 훅
  const {
    editMonthlyAmount, setEditMonthlyAmount,
    editPeriodYears, setEditPeriodYears,
    editAnnualRate, setEditAnnualRate,
    editInvestmentDays, setEditInvestmentDays,
    isRateManuallyEdited, setIsRateManuallyEdited,
    handleNumericInput, handleRateInput,
    initializeFromItem,
  } = useInvestmentDetailEdit()

  // 계산 훅
  const {
    startDate,
    displayMonthlyAmount,
    displayPeriodYears,
    displayAnnualRate,
    endDate,
    calculatedFutureValue,
    totalPrincipal,
    calculatedProfit,
    progress,
    completed,
    nextPaymentDate,
  } = useInvestmentCalculations({
    item,
    isEditMode,
    editMonthlyAmount,
    editPeriodYears,
    editAnnualRate,
    editInvestmentDays,
    calculateFutureValue,
  })

  // 납입 기록
  const fullPaymentHistory = getPaymentHistoryFromStart(
    item.id,
    item.investment_days ?? undefined,
    item.start_date ?? item.created_at ?? undefined,
    item.period_years
  )

  const { paymentHistory, hasMorePaymentHistory, loadMore } = usePaymentPagination(
    fullPaymentHistory,
    item.id
  )

  return {
    // 알림
    notificationOn,
    toggleNotification,

    // 수정 폼
    editMonthlyAmount,
    setEditMonthlyAmount,
    editPeriodYears,
    setEditPeriodYears,
    editAnnualRate,
    setEditAnnualRate,
    editInvestmentDays,
    setEditInvestmentDays,
    isRateManuallyEdited,
    setIsRateManuallyEdited,
    handleNumericInput,
    handleRateInput,
    initializeFromItem,

    // 계산된 값
    startDate,
    displayMonthlyAmount,
    displayPeriodYears,
    displayAnnualRate,
    endDate,
    calculatedFutureValue,
    totalPrincipal,
    calculatedProfit,
    progress,
    completed,
    nextPaymentDate,

    // 납입 기록
    paymentHistory,
    hasMorePaymentHistory,
    loadMore,
  }
}
