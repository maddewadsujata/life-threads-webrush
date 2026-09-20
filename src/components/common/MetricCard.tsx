import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
  trend?: string;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = '#06b6d4',
  trend,
  onClick,
  className,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md transition-all duration-300',
        'hover:border-zinc-700/80 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-black/40',
        onClick && 'cursor-pointer active:scale-[0.99]',
        className
      )}
    >
      {/* Subtle accent line on top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              {value}
            </span>
            {trend && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-zinc-500 line-clamp-1">{subtitle}</p>}
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/50 text-zinc-300 transition-colors group-hover:border-zinc-700 group-hover:text-white"
          style={{ color: accentColor }}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};
