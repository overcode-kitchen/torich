'use client'

import { useCallback, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Investment } from '@/app/types/investment'
import type { RecordUpdateResult } from './types/useInvestments'

export interface UseInvestmentsUpdateReturn {
  updateInvestment: (id: string, data: Partial<Investment>) => Promise<void>
  isUpdating: boolean
  setIsUpdating: (updating: boolean) => void
}

export function useInvestmentsUpdate(
  userId: string | undefined,
  records: Investment[],
  setRecords: (records: Investment[] | ((prev: Investment[]) => Investment[])) => void
): UseInvestmentsUpdateReturn {
  const supabase = useMemo(() => createClient(), [])
  const [isUpdating, setIsUpdating] = useState<boolean>(false)

  const updateInvestment = useCallback(
    async (id: string, data: Partial<Investment>): Promise<void> => {
      if (!userId) return

      setIsUpdating(true)
      const prevRecords: Investment[] = records

      setRecords((current: Investment[]): Investment[] =>
        current.map((r: Investment): Investment => (r.id === id ? { ...r, ...data } : r)),
      )

      try {
        const result: RecordUpdateResult = await supabase
          .from('records')
          .update(data)
          .eq('id', id)
          .select('*')
          .single()

        if (result.error) throw result.error

        if (result.data) {
          setRecords((current: Investment[]): Investment[] =>
            current.map((r: Investment): Investment => (r.id === id ? result.data! : r)),
          )
        }
      } catch (error) {
        setRecords(prevRecords)
        throw error
      } finally {
        setIsUpdating(false)
      }
    },
    [records, supabase, userId, setRecords],
  )

  return {
    updateInvestment,
    isUpdating,
    setIsUpdating,
  }
}
