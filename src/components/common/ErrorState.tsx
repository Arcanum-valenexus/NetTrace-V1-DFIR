import React from 'react';
import { NetTraceLogo } from './NetTraceLogo';
import { AlertOctagon, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Incident Processing Exception",
  message = "An unexpected error occurred while parsing the network forensic docket or PCAP stream. Please verify the file integrity or try reloading the workbench.",
  code = "ERR_NETTRACE_404_PARSER",
  onRetry,
  onGoHome
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 bg-[#070a12] font-mono-code">
      <div className="max-w-md w-full bg-slate-900 border border-red-900/60 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Faded Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo and Error Badge */}
        <div className="relative z-10 flex flex-col items-center space-y-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
            <NetTraceLogo variant="icon" size={64} />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-red-950/80 border border-red-800/80 text-red-300 rounded-full text-xs font-bold">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>{code}</span>
          </div>
        </div>

        {/* Error Details */}
        <div className="relative z-10 space-y-2">
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">{message}</p>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex items-center justify-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Action</span>
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Command Center</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
