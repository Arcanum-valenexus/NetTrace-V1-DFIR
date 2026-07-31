import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-800 rounded w-1/3" />
            <div className="w-8 h-8 bg-slate-800 rounded-lg" />
          </div>
          <div className="h-8 bg-slate-800 rounded w-1/2" />
          <div className="h-3 bg-slate-800 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse space-y-3">
      <div className="h-6 bg-slate-800 rounded w-1/4" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-10 bg-slate-950/80 rounded border border-slate-800/60 w-full" />
        ))}
      </div>
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse space-y-4">
      <div className="h-6 bg-slate-800 rounded w-1/3" />
      <div className="h-24 bg-slate-950 rounded border border-slate-800" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 bg-slate-800 rounded" />
        <div className="h-12 bg-slate-800 rounded" />
      </div>
    </div>
  );
};
