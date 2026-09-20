import React from 'react';
import { SearchX, RotateCcw, UploadCloud, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  title,
  description,
  icon: Icon = SearchX,
  actionText = 'Reset Filters',
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div
      id={id || 'empty-state-view'}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center backdrop-blur-sm"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 shadow-inner">
        <Icon className="h-7 w-7 text-zinc-400" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-zinc-100 font-display">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-400 leading-relaxed">{description}</p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-medium text-white transition-colors border border-zinc-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {actionText}
          </button>
        )}

        {onSecondaryAction && secondaryActionText && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 px-4 py-2 text-xs font-medium transition-colors"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};
