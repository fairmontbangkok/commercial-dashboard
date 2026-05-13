'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Point {
  month: string;
  thisYear: number;
  lastYear: number;
}

interface RevenueTrendProps {
  data: Point[];
  height?: number;
}

export function RevenueTrend({ data, height = 320 }: RevenueTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 0, left: -8, bottom: 0 }}>
        <CartesianGrid stroke="hsl(var(--ink) / 0.08)" strokeDasharray="0" horizontal vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'hsl(var(--ink) / 0.5)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--ink) / 0.5)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `฿${v}M`}
          width={50}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--ink) / 0.15)',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v: number) => `฿${v.toFixed(1)}M`}
        />
        <Legend
          align="right"
          verticalAlign="top"
          iconType="line"
          wrapperStyle={{ fontSize: 11, paddingBottom: 12 }}
        />
        <Line
          name="This year"
          type="monotone"
          dataKey="thisYear"
          stroke="hsl(var(--ink))"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: 'hsl(var(--ink))' }}
        />
        <Line
          name="Last year"
          type="monotone"
          dataKey="lastYear"
          stroke="hsl(var(--ink) / 0.30)"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
