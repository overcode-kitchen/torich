'use client'

import { useState, useEffect } from 'react'
import { Investment } from '@/app/types/investment'
import { InvestmentTabProvider, useInvestmentTabContext } from '@/app/contexts/InvestmentTabContext'
import { useInvestmentData } from '@/app/hooks/useInvestmentData'
import { useInvestmentActions } from '@/app/hooks/useInvestmentActions'
import { useScrollHeader } from '@/app/hooks/useScrollHeader'
import { InvestmentView } from '@/app/components/InvestmentView'
import { InvestmentEditView } from '@/app/components/InvestmentEditView'
import DeleteConfirmModal from '@/app/components/DeleteConfirmModal'
import { formatCurrency } from '@/lib/utils'
import type { RateSuggestion } from '@/app/components/InvestmentEditSheet'

interface InvestmentDetailViewProps {
  item: Investment
  onBack: () => void
  onUpdate: (data: { monthly_amount: number; period_years: number; annual_rate: number; investment_days?: number[] }) => Promise<void>
  onDelete: () => Promise<void>
  calculateFutureValue: (monthlyAmount: number, T: number, P: number, R: number) => number
}

function InternalInvestmentDetailView({
  item,
  onBack,
  onUpdate,
  onDelete,
  calculateFutureValue,
}: InvestmentDetailViewProps) {
  // Context
  const {
    activeTab,
    scrollContainerRef,
    overviewRef,
    infoRef,
    historyRef,
    titleRef,
    handleTabClick,
  } = useInvestmentTabContext()

  const { showStickyTitle } = useScrollHeader(titleRef)

  // UI 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDaysPickerOpen, setIsDaysPickerOpen] = useState(false)

  // 데이터 훅
  const investmentData = useInvestmentData({
    item,
    isEditMode,
    calculateFutureValue,
  })

  // API 액션 훅
  const { isDeleting, isUpdating, handleUpdate, handleDelete } = useInvestmentActions({
    onUpdate,
    onDelete,
  })

  // 수정 모드 진입 시 초기화
  useEffect(() => {
    if (isEditMode) {
      investmentData.initializeFromItem(item)
      setIsDaysPickerOpen(false)
    }
  }, [isEditMode, item, investmentData.initializeFromItem])

  // 저장 핸들러
  const handleSave = async () => {
    const monthlyAmountInWon = parseInt(investmentData.editMonthlyAmount.replace(/,/g, '') || '0') * 10000
    const periodYears = parseInt(investmentData.editPeriodYears || '0')
    const annualRate = parseFloat(investmentData.editAnnualRate || '0')

    if (monthlyAmountInWon <= 0 || periodYears <= 0 || annualRate <= 0) {
      alert('모든 값을 올바르게 입력해주세요.')
      return
    }

    await handleUpdate({
      monthly_amount: monthlyAmountInWon,
      period_years: periodYears,
      annual_rate: annualRate,
      investment_days: investmentData.editInvestmentDays.length > 0 ? investmentData.editInvestmentDays : undefined,
    })
    setIsEditMode(false)
  }

  // 취소 핸들러
  const handleCancel = () => {
    setIsEditMode(false)
  }

  // 수정 모드 진입
  const handleEdit = () => {
    setIsEditMode(true)
  }

  // 삭제 모달 열기
  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }


  // 공통 props
  const originalRate = item.annual_rate || 10
  const formatRate = (rate: number) => rate.toFixed(2).replace(/\.?0+$/, '')
  const rateSuggestions: RateSuggestion[] = [
    { label: '⚡️ 10년 평균 {rate}', rate: originalRate },
  ]
  const isCustomRate = !!item.is_custom_rate

  const infoSectionProps = {
    item,
    editMonthlyAmount: investmentData.editMonthlyAmount,
    setEditMonthlyAmount: investmentData.setEditMonthlyAmount,
    editPeriodYears: investmentData.editPeriodYears,
    setEditPeriodYears: investmentData.setEditPeriodYears,
    editAnnualRate: investmentData.editAnnualRate,
    setEditAnnualRate: investmentData.setEditAnnualRate,
    editInvestmentDays: investmentData.editInvestmentDays,
    setEditInvestmentDays: investmentData.setEditInvestmentDays,
    setIsDaysPickerOpen: setIsDaysPickerOpen,
    handleNumericInput: investmentData.handleNumericInput,
    handleRateInput: investmentData.handleRateInput,
    displayAnnualRate: investmentData.displayAnnualRate,
    totalPrincipal: investmentData.totalPrincipal,
    calculatedProfit: investmentData.calculatedProfit,
    calculatedFutureValue: investmentData.calculatedFutureValue,
    originalRate,
    isRateManuallyEdited: investmentData.isRateManuallyEdited,
    setIsRateManuallyEdited: investmentData.setIsRateManuallyEdited,
    formatRate,
    rateSuggestions,
    isCustomRate,
  }

  return (
    <div ref={scrollContainerRef} className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-md mx-auto">
        {isEditMode ? (
          <InvestmentEditView
            {...infoSectionProps}
            isEditMode={true}
            isUpdating={isUpdating}
            isDaysPickerOpen={isDaysPickerOpen}
            setIsDaysPickerOpen={setIsDaysPickerOpen}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <InvestmentView
            item={item}
            onBack={onBack}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            notificationOn={investmentData.notificationOn}
            toggleNotification={investmentData.toggleNotification}
            progress={investmentData.progress}
            completed={investmentData.completed}
            startDate={investmentData.startDate}
            endDate={investmentData.endDate}
            nextPaymentDate={investmentData.nextPaymentDate}
            paymentHistory={investmentData.paymentHistory}
            hasMorePaymentHistory={investmentData.hasMorePaymentHistory}
            loadMore={investmentData.loadMore}
            infoSectionProps={infoSectionProps}
            overviewRef={overviewRef as any}
            infoRef={infoRef as any}
            historyRef={historyRef as any}
            showStickyTitle={showStickyTitle}
            titleRef={titleRef as any}
          />
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}

// InvestmentDetailViewWithProvider로 감싸서 내보내기
export default function InvestmentDetailView(props: InvestmentDetailViewProps) {
  return (
    <InvestmentTabProvider>
      <InternalInvestmentDetailView {...props} />
    </InvestmentTabProvider>
  )
}
