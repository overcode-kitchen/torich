'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputWithUnitSize = 'sm' | 'md' | 'lg'

const sizeStyles = {
  sm: {
    input: 'pl-2 pr-1.5 py-1.5 text-sm',
    unit: 'pl-1 pr-1.5 py-1.5 text-xs',
  },
  md: {
    input: 'pl-3 pr-2 py-2 text-sm',
    unit: 'pl-1 pr-2 py-2 text-sm',
  },
  lg: {
    input: 'pl-4 pr-3 py-3 text-base',
    unit: 'pl-1.5 pr-3 py-3 text-sm',
  },
} as const

export interface InputWithUnitProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'size'> {
  /** 입력값 오른쪽에 고정 표시되는 단위 (만원, 년, % 등) */
  unit: string
  /** 패딩·텍스트 크기 변형 (sm / md / lg) */
  size?: InputWithUnitSize
  /** 래퍼 div에 줄 Tailwind 클래스 */
  wrapperClassName?: string
  /** input에 줄 Tailwind 클래스 (기본 스타일 덮어쓰기용) */
  inputClassName?: string
  /** 단위 span에 줄 Tailwind 클래스 */
  unitClassName?: string
}

/**
 * Input Group 패턴: 입력과 단위를 형제로 두어 겹침 없이 표시.
 * 단위는 입력 필드 우측에 고정 너비로 배치되며, 숫자와 단위 사이에 자연스러운 간격 유지.
 * size로 sm / md / lg 패딩·텍스트 변형 사용 가능.
 */
const InputWithUnit = React.forwardRef<HTMLInputElement, InputWithUnitProps>(
  (
    {
      unit,
      size = 'md',
      wrapperClassName = '',
      inputClassName = '',
      unitClassName = '',
      ...inputProps
    },
    ref
  ) => {
    const s = sizeStyles[size]
    return (
      <div
        className={cn(
          'flex items-center w-full rounded-lg border border-border bg-surface overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent',
          wrapperClassName
        )}
      >
        <input
          ref={ref}
          type="text"
          className={cn(
            'flex-1 min-w-0 bg-transparent border-0 text-right text-foreground font-semibold placeholder:text-foreground-subtle focus:outline-none',
            s.input,
            inputClassName
          )}
          {...inputProps}
        />
        <span
          className={cn(
            'flex-shrink-0 text-muted-foreground font-medium',
            s.unit,
            unitClassName
          )}
        >
          {unit}
        </span>
      </div>
    )
  }
)

InputWithUnit.displayName = 'InputWithUnit'

export { InputWithUnit }
