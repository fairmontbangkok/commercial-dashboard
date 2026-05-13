import { cn } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  delta?: number;
  deltaUnit?: 'pct' | 'pp' | 'abs' | 'currency';
  deltaContext?: string;
  spark?: number[];
}

function formatDelta(delta: number, unit: string): string {
  const sign = delta > 0 ? '+' : '';
  if (unit === 'pct') return `${sign}${delta.toFixed(1)}%`;
  if (unit === 'pp') return `${sign}${delta.toFixed(1)}pp`;
  if (unit === 'currency') return `${sign}฿${delta.toLocaleString()}`;
  return `${sign}${delta.toLocaleString()}`;
}

export function KPICard({ label, value, delta, deltaUnit = 'pct', deltaContext, spark }: KPICardProps) {
  const deltaPositive = delta && delta > 0;
  const deltaNegative = delta && delta < 0;

  return (
    <div className="bg-surface border border-ink-08 rounded-lg p-6 transition-shadow duration-200 hover:shadow-md">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-50 mb-3">
        {label}
      </div>
      <div className="text-3xl font-bold tracking-tight tabular leading-none mb-2">{value}</div>
      {delta !== undefined && (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span
            className={cn(
              'inline-flex items-center gap-0.5',
              deltaPositive && 'text-signal-positive',
              deltaNegative && 'text-signal-negative',
              !deltaPositive && !deltaNegative && 'text-ink-50'
            )}
          >
            {deltaPositive && <ArrowUp className="w-3 h-3" />}
            {deltaNegative && <ArrowDown className="w-3 h-3" />}
            {formatDelta(delta, deltaUnit)}
          </span>
          {deltaContext && <span className="text-[11px] text-ink-50">{deltaContext}</span>}
        </div>
      )}
      {spark && spark.length > 0 && (
        <div className="mt-3 h-9">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark.map((v, i) => ({ i, v }))}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="hsl(var(--ink))"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
