'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useAssetGrowthChart } from '@/app/hooks/useAssetGrowthChart'
import { useChartColors } from '@/app/hooks/useChartColors'
import AssetGrowthChartTooltip from '@/app/components/AssetGrowthChartTooltip'
import { RenderProfitBarLabel, RenderPrincipalLabel } from '@/app/components/AssetGrowthChartLabels'

type AssetGrowthChartProps = {
  investments: any[]
  selectedYear: number
}

export default function AssetGrowthChart({
  investments,
  selectedYear,
}: AssetGrowthChartProps) {
  const chartColors = useChartColors()
  const {
    barData,
    currentData,
    selectedBar,
    setSelectedBar,
    handleBarClick,
    hasData,
  } = useAssetGrowthChart({ investments, selectedYear })

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-foreground-subtle">
        <p className="text-sm">투자를 추가하면 차트가 표시됩니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 토리 메시지 */}
      {currentData && currentData.profit > 0 && (
        <div className="bg-muted-darker rounded-xl px-4 py-3">
          <p className="text-sm text-foreground-soft">
            🐿️ <span className="font-medium">토리:</span> "복리 효과로{' '}
            <span className="font-bold text-foreground">+{formatCurrency(currentData.profit)}</span>
            이 자라났어요"
          </p>
        </div>
      )}

      {/* 스택형 막대 차트 */}
      <div className="h-[240px] -ml-4 -mr-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            margin={{ top: 28, right: 12, left: 0, bottom: 8 }}
            barCategoryGap="20%"
            barGap={4}
            onClick={handleBarClick}
          >
            <defs>
              <linearGradient id="barProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.profit} stopOpacity={1} />
                <stop offset="100%" stopColor={chartColors.profitDark} stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis
              dataKey="label"
              stroke={chartColors.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={(v) => {
                if (v >= 100000000) return `${(v / 100000000).toFixed(1)}억`
                if (v >= 10000) return `${Math.floor(v / 10000)}만`
                return `${v}`
              }}
              stroke={chartColors.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip content={<AssetGrowthChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />

            {/* 원금 (하단) - 연한 그린 틴트 */}
            <Bar
              dataKey="principal"
              stackId="a"
              fill={chartColors.principal}
              radius={[0, 0, 0, 0]}
              isAnimationActive
              animationDuration={600}
              animationEasing="ease-out"
              label={<RenderPrincipalLabel chartColors={chartColors} />}
            />

            {/* 수익 (상단, The Gap) */}
            <Bar
              dataKey="profit"
              stackId="a"
              fill="url(#barProfit)"
              radius={[4, 4, 0, 0]}
              isAnimationActive
              animationDuration={600}
              animationEasing="ease-out"
              label={<RenderProfitBarLabel chartColors={chartColors} />}
            >
              {barData.map((entry, index) => (
                <Cell
                  key={`profit-${index}`}
                  fill="url(#barProfit)"
                  stroke={selectedBar?.month === entry.month ? chartColors.profitDark : 'transparent'}
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 막대 클릭 시 상세 정보 */}
      {selectedBar && (
        <div className="bg-surface rounded-xl px-4 py-3 border border-border-subtle">
          <p className="text-xs text-muted-foreground mb-1.5">{selectedBar.label} 상세</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-foreground-soft">
              원금 <strong className="text-foreground">{formatCurrency(selectedBar.principal)}</strong>
            </span>
            <span className="text-foreground-soft font-semibold">
              수익 +{formatCurrency(selectedBar.profit)} (
              {selectedBar.total > 0
                ? ((selectedBar.profit / selectedBar.total) * 100).toFixed(1)
                : 0}
              %)
            </span>
          </div>
        </div>
      )}

      {/* 범례 */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.principal, border: `1px solid ${chartColors.principalText}` }}></span>
          <span className="text-foreground-muted">원금</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.profit }}></span>
          <span className="text-foreground-muted">수익금 (The Gap)</span>
        </div>
      </div>

      {/* 하단 요약 */}
      {currentData && (
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-5">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">원금</p>
              <p className="text-base font-semibold text-foreground">
                {formatCurrency(currentData.principal)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">수익금</p>
              <p className="text-base font-bold text-foreground">
                +{formatCurrency(currentData.profit)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
