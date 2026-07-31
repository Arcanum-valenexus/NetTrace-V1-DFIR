import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'center' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  align = 'center',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    if (position === 'bottom') {
      if (align === 'right') return 'top-full right-0 mt-2';
      if (align === 'left') return 'top-full left-0 mt-2';
      return 'top-full left-1/2 -translate-x-1/2 mt-2';
    }
    if (position === 'top') {
      if (align === 'right') return 'bottom-full right-0 mb-2';
      if (align === 'left') return 'bottom-full left-0 mb-2';
      return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
    if (position === 'left') return 'right-full top-1/2 -translate-y-1/2 mr-2';
    if (position === 'right') return 'left-full top-1/2 -translate-y-1/2 ml-2';
    return 'top-full left-1/2 -translate-x-1/2 mt-2';
  };

  const getArrowClasses = () => {
    if (position === 'bottom') {
      if (align === 'right') return 'bottom-full right-4 border-b-slate-800 border-x-transparent border-t-transparent';
      if (align === 'left') return 'bottom-full left-4 border-b-slate-800 border-x-transparent border-t-transparent';
      return 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent';
    }
    if (position === 'top') {
      if (align === 'right') return 'top-full right-4 border-t-slate-800 border-x-transparent border-b-transparent';
      if (align === 'left') return 'top-full left-4 border-t-slate-800 border-x-transparent border-b-transparent';
      return 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent';
    }
    if (position === 'left') return 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent';
    if (position === 'right') return 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent';
    return 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent';
  };

  return (
    <div 
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          role="tooltip"
          className={`absolute z-50 pointer-events-none transition-all duration-200 transform scale-100 opacity-100 ${getPositionClasses()}`}
        >
          <div className="bg-slate-900 border border-cyan-800/80 text-slate-100 text-[11px] font-mono-code px-3 py-1.5 rounded-lg shadow-xl shadow-slate-950/80 max-w-xs w-max whitespace-normal leading-relaxed text-center font-normal">
            {content}
          </div>
          <div className={`absolute border-4 w-0 h-0 ${getArrowClasses()}`} />
        </div>
      )}
    </div>
  );
};
