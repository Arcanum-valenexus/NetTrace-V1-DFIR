import React, { useState, useEffect } from 'react';
import { Clock, Globe } from 'lucide-react';

export type TimezoneMode = 'UTC' | 'IST' | 'LOCAL';

export const LiveSystemClock: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());
  const [tzMode, setTzMode] = useState<TimezoneMode>('UTC');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time according to timezone mode
  const getTimeString = (date: Date, mode: TimezoneMode) => {
    let timeZone: string | undefined;
    if (mode === 'UTC') timeZone = 'UTC';
    else if (mode === 'IST') timeZone = 'Asia/Kolkata';
    else timeZone = undefined; // Local browser time

    const dayStr = date.toLocaleDateString('en-US', { timeZone, weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { timeZone, day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { timeZone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return {
      formattedDate: `${dayStr}, ${dateStr}`,
      formattedTime: timeStr
    };
  };

  const { formattedDate, formattedTime } = getTimeString(now, tzMode);

  return (
    <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono-code shadow-inner">
      {/* LIVE Indicator */}
      <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-[10px] text-emerald-400 font-bold shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>LIVE</span>
      </div>

      {/* Clock Icon & Display */}
      <div className="flex items-center space-x-2 text-slate-200">
        <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="text-slate-400 text-[11px] hidden sm:inline">{formattedDate}</span>
        <span className="font-bold text-cyan-300 font-mono-code tracking-wider text-xs">{formattedTime}</span>
      </div>

      {/* Timezone Switcher */}
      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-bold">
        {(['UTC', 'IST', 'LOCAL'] as TimezoneMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setTzMode(mode)}
            title={`Switch clock view to ${mode}`}
            className={`px-1.5 py-0.5 rounded transition-all ${
              tzMode === mode 
                ? 'bg-cyan-600 text-slate-950 font-extrabold shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
};
