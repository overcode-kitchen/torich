'use client'

import { useEffect } from 'react'
import { Investment } from '@/app/types/investment'
import { InvestmentTabProvider, useInvestmentTabContext } from '@/app/contexts/InvestmentTabContext'
import { useScrollHeader } from '@/app/hooks/useScrollHeader'
import { useInvestmentDetailUI } from '@/app/hooks/useInvestmentDetailUI'
import { useInvestmentDetailHandlers } from '@/app/hooks/useInvestmentDetailHandlers'
import { InvestmentView } from '@/app/components/InvestmentView'
import { InvestmentEditView } from '@/app/components/InvestmentEditView'
import DeleteConfirmModal from '@/app/components/DeleteConfirmModal'
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

  // UI 상태 훅
  const {
    showDeleteModal,
    setShowDeleteModal,
    isEditMode,
    setIsEditMode,
    isDaysPickerOpen,
    setIsDaysPickerOpen,
  } = useInvestmentDetailUI()

  // 핸들러 훅
  const {
    investmentData,
    isDeleting,
    isUpdating,
    handleSave,
    handleCancel,
    handleEdit,
    handleDeleteClick,
    handleDelete,
  } = useInvestmentDetailHandlers({
    item,
    onUpdate,
    onDelete,
    calculateFutureValue,
    isEditMode,
    setIsEditMode,
    setIsDaysPickerOpen,
  })

  // 수정 모드 진입 시 초기화
  useEffect(() => {
    if (isEditMode) {
      investmentData.initializeFromItem(item)
      setIsDaysPickerOpen(false)
    }
  }, [isEditMode, item, investmentData.initializeFromItem])

  // 삭제 모달 열기 핸들러
  const handleDeleteModalOpen = () => {
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
            onDelete={handleDeleteModalOpen}
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
