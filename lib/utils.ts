import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 금액을 만원 단위로 포맷팅하는 함수
 * @param amount - 원 단위 금액 (number) 또는 만원 단위 금액 (string)
 * @returns "XX,XXX만원" 형식의 문자열
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount) || numAmount === 0) {
    return '0만원'
  }
  
  // 만원 단위로 변환 (예: 150000 -> 15만원, 1500000 -> 150만원)
  const manWon = numAmount / 10000
  
  // 천 단위 구분 기호 추가
  return `${manWon.toLocaleString('ko-KR')}만원`
}
