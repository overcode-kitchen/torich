'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useCompoundChartData } from '@/app/hooks/useCompoundChartData'
import CompoundChartTooltip from '@/app/components/CompoundChartTooltip'
import type { Investment } from '@/app/types/investment'

interface CompoundChartProps {
  investments: Investment[]
  selectedYear: number
  totalMonthlyPayment: number
}

export default function CompoundChart({
  investments,
  selectedYear,
  totalMonthlyPayment,
}: CompoundChartProps) {
  const { chartData, summary, breakEvenPoint, chartColors } = useCompoundChartData({
    investments,
    selectedYear,
    totalMonthlyPayment,
  })

  // 빈 상태
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-foreground-subtle">
        <p className="text-sm">투자를 추가하면 차트가 표시됩니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 차트 영역 */}
      <div className="h-[200px] -ml-4 -mr-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={true} vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={(value) => {
                const dataPoint = chartData.find((d) => d.month === value)
                return dataPoint?.monthLabel || ''
              }}
              stroke={chartColors.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => {
                if (value >= 10000) {
                  return `${Math.floor(value / 10000)}만`
                }
                return `${value}`
              }}
              stroke={chartColors.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CompoundChartTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
              formatter={(value) => <span className="text-xs text-foreground-soft">{value}</span>}
            />
            
            {/* 원금 라인 (회색 점선) */}
            <Line
              type="monotone"
              dataKey="principal"
              stroke={chartColors.principal}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name="원금"
            />
            
            {/* 총 자산 라인 (브랜드 그린 실선) */}
            <Line
              type="monotone"
              dataKey="totalAsset"
              stroke={chartColors.totalAsset}
              strokeWidth={2}
              dot={false}
              name="총 자산"
            />

            {/* 예상 수익 라인 (브랜드 그린, 더 진한 색, 두꺼운 선) - 복리 효과 강조 */}
            <Line
              type="monotone"
              dataKey="profit"
              stroke={chartColors.profit}
              strokeWidth={2.5}
              dot={false}
              name="예상 수익"
            />

            {/* 복리 역전 포인트 마커 */}
            {breakEvenPoint && (
              <ReferenceLine
                x={breakEvenPoint.month}
                stroke={chartColors.breakEven}
                strokeDasharray="2 2"
                strokeWidth={1.5}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 하단 요약 정보 */}
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">원금</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(summary.principal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">예상 수익</p>
            <p className="text-sm font-semibold text-foreground">
              +{formatCurrency(summary.profit)}
            </p>
          </div>
        </div>
        {breakEvenPoint && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">복리 역전</p>
            <p className="text-xs font-semibold text-foreground-soft">
              ⚡ {breakEvenPoint.month}개월
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
