'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAddInvestmentData } from './useAddInvestmentData'
import { validateInvestmentForm, validateAndHandleError } from '@/app/utils/validation'

export interface UseAddInvestmentSubmitProps {
  stockName: string
  monthlyAmount: string
  period: string
  startDate: Date
  investmentDays: number[]
  annualRate: number
  isManualInput: boolean
  originalSystemRate: number | null
  selectedStock: any
}

export interface UseAddInvestmentSubmitReturn {
  handleSubmit: (e: React.FormEvent) => Promise<void>
  isSubmitting: boolean
  userId: string | null
}

export function useAddInvestmentSubmit({
  stockName,
  monthlyAmount,
  period,
  startDate,
  investmentDays,
  annualRate,
  isManualInput,
  originalSystemRate,
  selectedStock,
}: UseAddInvestmentSubmitProps): UseAddInvestmentSubmitReturn {
  const router = useRouter()
  const { isSubmitting, userId, handleSubmit: submitData } = useAddInvestmentData()

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    // 유효성 검사
    const validation = validateInvestmentForm({
      stockName,
      monthlyAmount,
      period,
      userId,
      investmentDays,
    })

    const isValid = validateAndHandleError(
      validation,
      (message) => alert(message),
      () => router.push('/login')
    )

    if (!isValid) return

    // 데이터 제출
    await submitData({
      stockName,
      monthlyAmount,
      period,
      startDate,
      investmentDays,
      annualRate,
      isManualInput,
      originalSystemRate,
      selectedStock,
    })
  }, [
    stockName,
    monthlyAmount,
    period,
    startDate,
    investmentDays,
    annualRate,
    isManualInput,
    originalSystemRate,
    selectedStock,
    userId,
    router,
    submitData,
  ])

  return {
    handleSubmit,
    isSubmitting,
    userId,
  }
}
