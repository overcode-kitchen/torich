export interface ValidationResult {
  isValid: boolean
  errorMessage?: string
}

export interface InvestmentFormData {
  stockName: string
  monthlyAmount: string
  period: string
  userId: string | null
  investmentDays: number[]
}

export function validateInvestmentForm(data: InvestmentFormData): ValidationResult {
  if (!data.stockName.trim()) {
    return {
      isValid: false,
      errorMessage: '종목명을 입력해주세요.'
    }
  }

  if (!data.monthlyAmount || parseInt(data.monthlyAmount) <= 0) {
    return {
      isValid: false,
      errorMessage: '월 투자액을 입력해주세요.'
    }
  }

  if (!data.period || parseInt(data.period) <= 0) {
    return {
      isValid: false,
      errorMessage: '투자 기간을 입력해주세요.'
    }
  }

  if (!data.userId) {
    return {
      isValid: false,
      errorMessage: '로그인이 필요합니다.'
    }
  }

  if (data.investmentDays.length === 0) {
    return {
      isValid: false,
      errorMessage: '매월 투자일을 선택해주세요. 알림을 받을 날짜를 선택하면 투자 일정을 쉽게 관리할 수 있어요.'
    }
  }

  return { isValid: true }
}

export function validateManualInput(stockName: string, rate: string): ValidationResult {
  if (!stockName.trim()) {
    return {
      isValid: false,
      errorMessage: '종목 이름을 입력해주세요.'
    }
  }

  const parsedRate = parseFloat(rate)
  if (!rate || Number.isNaN(parsedRate) || parsedRate <= 0) {
    return {
      isValid: false,
      errorMessage: '예상 수익률을 입력해주세요.'
    }
  }

  return { isValid: true }
}
