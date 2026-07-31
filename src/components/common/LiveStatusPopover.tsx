import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  HardDrive, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  ChevronDown 
} from 'lucide-react';
import { Tooltip } from './Tooltip';

export const LiveStatusPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastSync, setLastSync] = useState('Just now');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSync('Just now');
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="relative font-mono-code" ref={popoverRef}>
      {/* Compact Live Status Indicator Button */}
      <Tooltip content="Click to inspect real-time SOC backend, DB & API health telemetry.">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-mono-code transition-all border shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
            isOpen 
              ? 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300' 
              : 'bg-slate-950/90 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Status: <strong className="text-emerald-400 font-extrabold">Live</strong></span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
        </button>
      </Tooltip>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 animate-fadeIn space-y-3.5">
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-100 font-sans">System Telemetry</span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>100% Operational</span>
            </span>
          </div>

          {/* Telemetry Items */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-slate-300">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Backend Status</span>
              </div>
              <span className="text-emerald-400 font-bold text-[11px]">Operational (99.99%)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-slate-300">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>Database Status</span>
              </div>
              <span className="text-emerald-400 font-bold text-[11px]">Connected</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Storage Status</span>
              </div>
              <span className="text-emerald-400 font-bold text-[11px]">Encrypted S3 Active</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-slate-300">
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Last Synchronization</span>
              </div>
              <span className="text-cyan-300 font-bold text-[11px]">{lastSync}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="flex items-center space-x-2 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>API Health</span>
              </div>
              <span className="text-emerald-400 font-bold text-[11px]">FastAPI Normal (14ms)</span>
            </div>
          </div>

          {/* Refresh Action */}
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>DPI Engine v1.0.4</span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center space-x-1 transition-all focus:outline-none"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
