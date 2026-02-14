'use client'

import { useRouter } from 'next/navigation'
import { useAddInvestmentForm } from '@/app/hooks/useAddInvestmentForm'
import { useModalState } from '@/app/hooks/useModalState'
import AddInvestmentView from '@/app/components/AddInvestmentView'

export default function AddInvestmentPage() {
  const router = useRouter()
  const form = useAddInvestmentForm()
  const modals = useModalState()

  return (
    <AddInvestmentView
      form={form}
      modals={modals}
      onBack={() => router.back()}
    />
  )
}