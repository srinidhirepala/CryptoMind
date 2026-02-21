'use client';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { formatUSD } from '@/lib/utils';
import type { ChartDataPoint } from '@/types';

interface PortfolioChartProps {
    data: ChartDataPoint[];
    totalValue: number;
}

// Custom tooltip
function CustomTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: Array<{ payload: ChartDataPoint }>;
}) {
    if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
            <div className="glass-card px-4 py-3 shadow-card border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white font-semibold text-sm">{item.name}</span>
                </div>
                <p className="text-slate-300 text-sm">{formatUSD(item.value)}</p>
                <p className="text-slate-500 text-xs">{item.percent.toFixed(1)}% of portfolio</p>
            </div>
        );
    }
    return null;
}

// Custom legend
function CustomLegend({ payload }: { payload?: Array<{ color: string; value: string; payload: ChartDataPoint }> }) {
    if (!payload) return null;
    return (
        <ul className="flex flex-col gap-2 mt-2">
            {payload.map((entry) => (
                <li key={entry.value} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-300 text-sm font-medium">{entry.value}</span>
                    </div>
                    <span className="text-slate-500 text-xs">{entry.payload.percent.toFixed(1)}%</span>
                </li>
            ))}
        </ul>
    );
}

// Custom center label
function CenterLabel({ cx, cy, totalValue }: { cx: number; cy: number; totalValue: number }) {
    return (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-current">
            <tspan x={cx} y={cy - 10} fontSize="12" fill="#94a3b8">Total Value</tspan>
            <tspan x={cx} y={cy + 12} fontSize="18" fontWeight="800" fill="#f8fafc">
                {formatUSD(totalValue)}
            </tspan>
        </text>
    );
}

export default function PortfolioChart({ data, totalValue }: PortfolioChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[280px]">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-slate-400 text-sm">No portfolio data to display</p>
            </div>
        );
    }

    // Limit to top 6 + "Others"
    const TOP_N = 6;
    let chartData = [...data];
    if (chartData.length > TOP_N) {
        const top = chartData.slice(0, TOP_N);
        const others = chartData.slice(TOP_N);
        const othersValue = others.reduce((sum, d) => sum + d.value, 0);
        const othersPercent = others.reduce((sum, d) => sum + d.percent, 0);
        chartData = [
            ...top,
            {
                name: 'Others',
                value: othersValue,
                color: '#475569',
                percent: othersPercent,
            },
        ];
    }

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Asset Distribution
            </h3>

            <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Pie Chart */}
                <div className="w-full lg:w-[280px] h-[260px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={115}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        opacity={0.9}
                                        style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            {/* Center text via foreignObject isn't reliable in recharts; use a static overlay instead */}
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend + Total */}
                <div className="flex-1 w-full lg:w-auto">
                    <div className="mb-4 p-4 rounded-xl bg-navy-800/50 border border-slate-700/30">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Portfolio</p>
                        <p className="text-3xl font-black text-white counter">{formatUSD(totalValue)}</p>
                    </div>
                    <CustomLegend payload={chartData.map((d) => ({ color: d.color, value: d.name, payload: d }))} />
                </div>
            </div>
        </div>
    );
}

// Skeleton loader
export function PortfolioChartSkeleton() {
    return (
        <div className="glass-card p-6">
            <div className="w-40 h-5 rounded shimmer mb-6" />
            <div className="flex items-center gap-6">
                <div className="w-[260px] h-[260px] rounded-full shimmer flex-shrink-0" />
                <div className="flex-1 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shimmer" />
                            <div className="flex-1 h-3 rounded shimmer" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
