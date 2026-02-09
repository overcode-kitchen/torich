interface UndoToastSectionProps {
  pendingUndo: boolean
  handleUndo: () => void
}

export function UndoToastSection({ pendingUndo, handleUndo }: UndoToastSectionProps) {
  if (!pendingUndo) return null

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-xl bg-surface-dark text-white px-4 py-3 shadow-lg"
      role="status"
    >
      <span className="text-sm font-medium">완료됨</span>
      <button
        type="button"
        onClick={handleUndo}
        className="text-sm font-semibold text-brand-300 hover:text-brand-200 transition-colors"
      >
        되돌리기
      </button>
    </div>
  )
}
