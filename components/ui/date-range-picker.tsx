'use client'

import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CaretDown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  value?: DateRange | undefined
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
  buttonClassName?: string
  disabled?: boolean
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = '기간 선택',
  className,
  buttonClassName,
  disabled = false,
}: DateRangePickerProps) {
  const label =
    value?.from && value?.to
      ? `${format(value.from, 'yyyy.MM.dd', { locale: ko })} - ${format(value.to, 'yyyy.MM.dd', { locale: ko })}`
      : placeholder

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border border-border hover:border-surface-strong-hover',
            buttonClassName
          )}
        >
          {label}
          <CaretDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          locale={ko}
          numberOfMonths={1}
          defaultMonth={value?.from ?? new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}
