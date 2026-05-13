import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

type Severity = 'action' | 'attention' | 'watch' | 'opportunity';

interface InsightCardProps {
  title: string;
  context: string;
  recommendedAction: string;
  severity: Severity;
  category: string;
  detectedAt: Date | string;
  confidence: number;
  impactValue?: number;
  impactUnit?: string;
  onClick?: () => void;
}

const severityStyles: Record<Severity, { label: string; className: string }> = {
  action: { label: 'Action required', className: 'bg-signal-negative text-white' },
  attention: { label: 'Attention', className: 'bg-signal-caution text-white' },
  watch: { label: 'Watch', className: 'bg-ink text-paper' },
  opportunity: { label: 'Opportunity', className: 'bg-signal-positive text-white' },
};

function formatImpact(value?: number, unit?: string): string | null {
  if (!value || !unit) return null;
  if (unit === 'revenue' || unit === 'cost') {
    return `Impact ฿${(value / 1000).toFixed(0)}k`;
  }
  if (unit === 'occupancy_pp') return `Impact ${value.toFixed(1)}pp`;
  if (unit === 'roas') return `Impact ${value.toFixed(1)}x`;
  return null;
}

function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function InsightCard({
  title,
  context,
  recommendedAction,
  severity,
  category,
  detectedAt,
  confidence,
  impactValue,
  impactUnit,
  onClick,
}: InsightCardProps) {
  const sev = severityStyles[severity];
  const impactLabel = formatImpact(impactValue, impactUnit);

  return (
    <article
      onClick={onClick}
      className={cn(
        'border border-ink-08 rounded-lg p-5 sm:p-6',
        'bg-surface transition-colors duration-200',
        'hover:bg-surface-2 hover:border-ink-15 cursor-pointer'
      )}
    >
      <header className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold leading-snug tracking-tight">{title}</h3>
          <p className="text-[11px] uppercase tracking-widest text-ink-50 font-semibold mt-1">
            {category} · {formatTime(detectedAt)} · Confidence {Math.round(confidence * 100)}%
            {impactLabel && <> · {impactLabel}</>}
          </p>
        </div>
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded',
            sev.className
          )}
        >
          {sev.label}
        </span>
      </header>

      <p className="text-sm text-ink-70 leading-relaxed mt-2.5 mb-3.5">{context}</p>

      <div className="flex items-center gap-2 pt-3 border-t border-ink-08 text-[11px] font-semibold uppercase tracking-wider">
        <span>{recommendedAction}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </article>
  );
}
