import React from 'react';
import { NetTraceLogo } from './NetTraceLogo';

interface EmptyStateProps {
  icon?: React.FC<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  useLogo?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  useLogo = true
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 text-center space-y-4 font-mono-code max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center mx-auto shadow-inner p-2.5">
        {Icon && !useLogo ? (
          <Icon className="w-8 h-8 text-slate-500" />
        ) : (
          <NetTraceLogo variant="icon" size={48} monochrome={true} />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md inline-flex items-center space-x-1.5"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

