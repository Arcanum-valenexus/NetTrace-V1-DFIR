import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';

export const ToastNotification: React.FC = () => {
  const { toast } = useInvestigation();

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-fadeIn font-mono-code">
      <div className={`p-4 rounded-xl border shadow-2xl flex items-center justify-between space-x-3 backdrop-blur-lg ${
        isError 
          ? 'bg-red-950/95 border-red-700 text-red-200 shadow-red-950/50' 
          : isInfo 
            ? 'bg-cyan-950/95 border-cyan-700 text-cyan-200 shadow-cyan-950/50'
            : 'bg-emerald-950/95 border-emerald-700 text-emerald-200 shadow-emerald-950/50'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="shrink-0">
            {isError ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : isInfo ? (
              <Info className="w-5 h-5 text-cyan-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold font-sans tracking-wide">
              {toast.message}
            </p>
            <p className="text-[10px] opacity-75 font-mono-code">
              NetTrace Security Control Center
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
