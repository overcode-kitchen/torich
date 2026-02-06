'use client'

import { CircleNotch, Info } from '@phosphor-icons/react'
import { type SearchResult } from '@/app/hooks/useStockSearch'

interface RateDisplayProps {
  // 상태
  isRateLoading: boolean
  rateFetchFailed: boolean
  isRateEditing: boolean
  isManualInput: boolean
  stockName: string
  selectedStock: SearchResult | null
  
  // 수익률 값
  annualRate: number
  originalSystemRate: number | null
  editingRate: string
  
  // 핸들러
  onStartEditing: () => void
  onConfirmEdit: () => void
  onCancelEdit: () => void
  onRateChange: (value: string) => void
  onRateHelpClick: () => void
}

export default function RateDisplay({
  isRateLoading,
  rateFetchFailed,
  isRateEditing,
  isManualInput,
  stockName,
  selectedStock,
  annualRate,
  originalSystemRate,
  editingRate,
  onStartEditing,
  onConfirmEdit,
  onCancelEdit,
  onRateChange,
  onRateHelpClick,
}: RateDisplayProps) {
  // 선택된 종목 수익률 안내 (로딩/실패/편집/표시 모드)
  if (!isManualInput && (selectedStock || isRateLoading)) {
    if (isRateLoading) {
      return (
        <div className="flex items-center gap-2">
          <CircleNotch className="w-4 h-4 animate-spin text-brand-600" />
          <span className="text-sm text-muted-foreground">수익률을 분석하고 있어요...</span>
        </div>
      )
    }

    if (rateFetchFailed) {
      return (
        <div className="text-sm font-medium flex items-center gap-1 flex-wrap">
          <span className="text-amber-600">⚠️</span>
          <span className="text-amber-600">
            데이터를 불러오지 못해 기본 수익률({annualRate}%)로 설정했어요.
          </span>
          <button
            type="button"
            onClick={onStartEditing}
            className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full hover:bg-amber-200 transition-colors ml-1"
          >
            수정
          </button>
        </div>
      )
    }

    if (isRateEditing) {
      return (
        <div className="flex items-center gap-2 bg-surface-hover rounded-xl p-3">
          <span className="text-sm text-foreground-muted">연 수익률</span>
          <input
            type="text"
            value={editingRate}
            onChange={(e) => onRateChange(e.target.value)}
            className="w-16 text-center bg-card border border-border rounded-lg px-2 py-1 text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="10"
            autoFocus
          />
          <span className="text-sm text-foreground-muted">%</span>
          <button
            type="button"
            onClick={onConfirmEdit}
            className="px-3 py-1 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            확인
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-3 py-1 bg-surface-strong text-foreground-soft text-sm font-medium rounded-lg hover:bg-surface-strong-hover transition-colors"
          >
            취소
          </button>
        </div>
      )
    }

    return (
      <div className="text-sm font-medium flex items-center gap-1 flex-wrap">
        {originalSystemRate !== null && annualRate !== originalSystemRate ? (
          // 사용자가 수정한 경우
          <>
            <span className="text-purple-600">✏️</span>
            <span className="text-purple-600">
              수익률 {annualRate}%가 적용됩니다
            </span>
            <span className="text-xs text-foreground-subtle ml-1">
              (시스템: {originalSystemRate}%)
            </span>
          </>
        ) : (
          // 시스템 수익률 그대로
          <>
            <span className="text-brand-600">📊</span>
            <span className="text-brand-600">
              지난 10년 평균 수익률 {annualRate}%가 적용되었어요!
            </span>
          </>
        )}
        <button
          type="button"
          onClick={onRateHelpClick}
          className="p-1 flex items-center justify-center bg-transparent text-foreground-subtle hover:text-foreground-muted hover:bg-secondary rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="수익률 계산 방식 안내"
        >
          <Info className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onStartEditing}
          className="px-2 py-0.5 bg-secondary text-foreground-muted text-xs font-medium rounded-full hover:bg-surface-strong transition-colors ml-1"
        >
          수정
        </button>
      </div>
    )
  }

  // 직접 입력 종목 수익률 안내
  if (isManualInput && stockName) {
    if (isRateEditing) {
      return (
        <div className="flex items-center gap-2 bg-surface-hover rounded-xl p-3">
          <span className="text-sm text-foreground-muted">연 수익률</span>
          <input
            type="text"
            value={editingRate}
            onChange={(e) => onRateChange(e.target.value)}
            className="w-16 text-center bg-card border border-border rounded-lg px-2 py-1 text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="10"
            autoFocus
          />
          <span className="text-sm text-foreground-muted">%</span>
          <button
            type="button"
            onClick={onConfirmEdit}
            className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            확인
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-3 py-1 bg-surface-strong text-foreground-soft text-sm font-medium rounded-lg hover:bg-surface-strong-hover transition-colors"
          >
            취소
          </button>
        </div>
      )
    }

    return (
      <div className="text-sm text-purple-600 font-medium flex items-center gap-1">
        <span>✏️</span>
        <span>직접 입력한 수익률 {annualRate}%가 적용됩니다</span>
        <button
          type="button"
          onClick={onStartEditing}
          className="px-2 py-0.5 bg-secondary text-foreground-muted text-xs font-medium rounded-full hover:bg-surface-strong transition-colors ml-1"
        >
          수정
        </button>
      </div>
    )
  }

  return null
}
