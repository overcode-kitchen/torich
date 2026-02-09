'use client'

import { useState } from 'react'

export interface UseModalStateReturn {
  isDatePickerOpen: boolean
  setIsDatePickerOpen: (open: boolean) => void
  isDaysPickerOpen: boolean
  setIsDaysPickerOpen: (open: boolean) => void
  isRateHelpModalOpen: boolean
  setIsRateHelpModalOpen: (open: boolean) => void
}

export function useModalState(): UseModalStateReturn {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)
  const [isDaysPickerOpen, setIsDaysPickerOpen] = useState<boolean>(false)
  const [isRateHelpModalOpen, setIsRateHelpModalOpen] = useState<boolean>(false)

  return {
    isDatePickerOpen,
    setIsDatePickerOpen,
    isDaysPickerOpen,
    setIsDaysPickerOpen,
    isRateHelpModalOpen,
    setIsRateHelpModalOpen,
  }
}
