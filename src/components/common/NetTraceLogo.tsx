import React from 'react';

export interface NetTraceLogoProps {
  variant?: 'full' | 'icon' | 'horizontal' | 'favicon' | 'appIcon';
  theme?: 'dark' | 'light';
  size?: number | string;
  className?: string;
  showTagline?: boolean;
  monochrome?: boolean;
}

export const NetTraceLogo: React.FC<NetTraceLogoProps> = ({
  variant = 'icon',
  theme = 'dark',
  size,
  className = '',
  showTagline = false,
  monochrome = false
}) => {
  const isLight = theme === 'light';

  // Base SVG Emblem (200x200 viewBox)
  const renderEmblem = (emblemSize: number | string = 40) => (
    <svg
      width={emblemSize}
      height={emblemSize}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${monochrome ? 'opacity-40 grayscale' : ''}`}
    >
      <defs>
        {/* Primary Shield Border Gradient */}
        <linearGradient id={monochrome ? "shieldBorderGradMono" : "shieldBorderGrad"} x1="20" y1="15" x2="180" y2="185" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={monochrome ? "#64748B" : "#00F0FF"} />
          <stop offset="50%" stopColor={monochrome ? "#475569" : "#00A2FF"} />
          <stop offset="100%" stopColor={monochrome ? "#334155" : "#0052FF"} />
        </linearGradient>

        {/* Shield Interior Background Gradient */}
        <linearGradient id={monochrome ? "shieldBgGradMono" : "shieldBgGrad"} x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={monochrome ? "#1E293B" : (isLight ? "#0F172A" : "#0A1226")} />
          <stop offset="100%" stopColor={monochrome ? "#0F172A" : (isLight ? "#020617" : "#030712")} />
        </linearGradient>

        {/* Dominant N Face Gradient */}
        <linearGradient id={monochrome ? "nMainGradMono" : "nMainGrad"} x1="60" y1="45" x2="140" y2="145" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={monochrome ? "#94A3B8" : "#FFFFFF"} />
          <stop offset="35%" stopColor={monochrome ? "#64748B" : "#E0F7FF"} />
          <stop offset="100%" stopColor={monochrome ? "#475569" : "#38BDF8"} />
        </linearGradient>

        {/* Dominant N Left Stem & Depth Gradient */}
        <linearGradient id={monochrome ? "nStemGradMono" : "nStemGrad"} x1="60" y1="45" x2="80" y2="145" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={monochrome ? "#64748B" : "#00F0FF"} />
          <stop offset="100%" stopColor={monochrome ? "#334155" : "#0284C7"} />
        </linearGradient>

        {/* Magnifying Glass Metallic Gradient */}
        <linearGradient id={monochrome ? "glassFrameGradMono" : "glassFrameGrad"} x1="115" y1="105" x2="180" y2="175" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={monochrome ? "#64748B" : "#38BDF8"} />
          <stop offset="50%" stopColor={monochrome ? "#475569" : "#00F0FF"} />
          <stop offset="100%" stopColor={monochrome ? "#334155" : "#0284C7"} />
        </linearGradient>

        {/* Lens Interior Gradient */}
        <linearGradient id={monochrome ? "lensBgGradMono" : "lensBgGrad"} x1="120" y1="110" x2="155" y2="145" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={monochrome ? "#0F172A" : "#031A30"} stopOpacity="0.95" />
          <stop offset="100%" stopColor={monochrome ? "#1E293B" : "#082B4C"} stopOpacity="0.98" />
        </linearGradient>

        {/* Packet Block Gradient */}
        <linearGradient id={monochrome ? "packetGradMono" : "packetGrad"} x1="0" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={monochrome ? "#64748B" : "#00F0FF"} />
          <stop offset="100%" stopColor={monochrome ? "#334155" : "#0284C7"} />
        </linearGradient>
      </defs>

      {/* 1. DIGITAL PACKET BLOCKS (Left Side Streaming) */}
      <g className="packets">
        <rect x="4" y="68" width="12" height="10" rx="2" fill={monochrome ? "url(#packetGradMono)" : "url(#packetGrad)"} opacity="0.9" />
        <line x1="0" y1="73" x2="4" y2="73" stroke={monochrome ? "#64748B" : "#00F0FF"} strokeWidth="1.5" opacity="0.6" />

        <rect x="18" y="84" width="16" height="10" rx="2" fill={monochrome ? "url(#packetGradMono)" : "url(#packetGrad)"} opacity="0.95" />
        <line x1="2" y1="89" x2="18" y2="89" stroke={monochrome ? "#64748B" : "#00F0FF"} strokeWidth="1.5" opacity="0.7" />

        <rect x="8" y="102" width="14" height="10" rx="2" fill={monochrome ? "url(#packetGradMono)" : "url(#packetGrad)"} opacity="0.85" />
        <line x1="0" y1="107" x2="8" y2="107" stroke={monochrome ? "#64748B" : "#00F0FF"} strokeWidth="1.5" opacity="0.5" />

        <rect x="22" y="118" width="12" height="10" rx="2" fill={monochrome ? "url(#packetGradMono)" : "url(#packetGrad)"} opacity="0.9" />
        <line x1="6" y1="123" x2="22" y2="123" stroke={monochrome ? "#64748B" : "#00F0FF"} strokeWidth="1.5" opacity="0.6" />
      </g>

      {/* 2. SHIELD OUTLINE & BODY */}
      {/* Outer Glow / Border */}
      <path
        d="M 100,16 C 146,16 176,26 176,68 C 176,124 132,168 100,185 C 68,168 24,124 24,68 C 24,26 54,16 100,16 Z"
        fill={monochrome ? "url(#shieldBorderGradMono)" : "url(#shieldBorderGrad)"}
      />

      {/* Inner Dark Shield Fill */}
      <path
        d="M 100,23 C 141,23 168,32 168,70 C 168,120 127,159 100,174 C 73,159 32,120 32,70 C 32,32 59,23 100,23 Z"
        fill={monochrome ? "url(#shieldBgGradMono)" : "url(#shieldBgGrad)"}
      />

      {/* Subtle Inner Contour Highlight */}
      <path
        d="M 100,28 C 136,28 160,36 160,70 C 160,112 123,148 100,162 C 77,148 40,112 40,70 C 40,36 64,28 100,28 Z"
        stroke={monochrome ? "#64748B" : "#00F0FF"}
        strokeWidth="1"
        strokeOpacity="0.25"
        fill="none"
      />

      {/* 3. DOMINANT LETTER "N" (Minimal, geometric 3D style) */}
      <g className="dominant-n">
        {/* Left Vertical Bar */}
        <path
          d="M 64,48 L 84,48 L 84,142 L 64,142 Z"
          fill={monochrome ? "url(#nStemGradMono)" : "url(#nStemGrad)"}
        />

        {/* Diagonal Cross Bar */}
        <path
          d="M 64,48 L 84,48 L 136,132 L 136,142 L 116,142 L 64,58 Z"
          fill={monochrome ? "url(#nMainGradMono)" : "url(#nMainGrad)"}
        />

        {/* Right Vertical Bar */}
        <path
          d="M 116,48 L 136,48 L 136,142 L 116,142 Z"
          fill={monochrome ? "url(#nStemGradMono)" : "url(#nStemGrad)"}
        />
      </g>

      {/* 4. PACKET WAVEFORM (Pulse at bottom inside shield) */}
      <path
        d="M 50,154 L 68,154 L 73,144 L 78,162 L 85,134 L 92,158 L 98,150 L 105,154 L 125,154"
        stroke={monochrome ? "#64748B" : "#00F0FF"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.95"
      />

      {/* 5. MAGNIFYING GLASS */}
      <g className="magnifying-glass">
        {/* Handle */}
        <line
          x1="152"
          y1="148"
          x2="178"
          y2="174"
          stroke={monochrome ? "url(#glassFrameGradMono)" : "url(#glassFrameGrad)"}
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Outer Metallic Ring */}
        <circle
          cx="136"
          cy="130"
          r="24"
          fill="none"
          stroke={monochrome ? "url(#glassFrameGradMono)" : "url(#glassFrameGrad)"}
          strokeWidth="4.5"
        />

        {/* Lens Glass Interior */}
        <circle
          cx="136"
          cy="130"
          r="20"
          fill={monochrome ? "url(#lensBgGradMono)" : "url(#lensBgGrad)"}
          stroke={monochrome ? "#64748B" : "#00F0FF"}
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* 3 SIMPLIFIED NETWORK NODES INSIDE LENS */}
        <line x1="128" y1="123" x2="145" y2="121" stroke={monochrome ? "#64748B" : "#00F0FF"} strokeWidth="1.5" opacity="0.8" />
        <line x1="145" y1="121" x2="138" y2="138" stroke={monochrome ? "#64748B" : "#00F0FF"} strokeWidth="1.5" opacity="0.8" />
        <line x1="138" y1="138" x2="128" y2="123" stroke={monochrome ? "#64748B" : "#00F0FF"} strokeWidth="1.5" opacity="0.8" />

        <circle cx="128" cy="123" r="2.8" fill={monochrome ? "#94A3B8" : "#FFFFFF"} stroke={monochrome ? "#64748B" : "#00F0FF"} strokeWidth="1" />
        <circle cx="145" cy="121" r="2.8" fill={monochrome ? "#64748B" : "#00F0FF"} stroke={monochrome ? "#475569" : "#38BDF8"} strokeWidth="1" />
        <circle cx="138" cy="138" r="2.8" fill={monochrome ? "#94A3B8" : "#FFFFFF"} stroke={monochrome ? "#64748B" : "#00F0FF"} strokeWidth="1" />
      </g>
    </svg>
  );

  // Favicon View (Simplified for 16px - 32px clarity)
  if (variant === 'favicon') {
    const favSize = size || 32;
    return (
      <svg
        width={favSize}
        height={favSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="favShield" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#0052FF" />
          </linearGradient>
          <linearGradient id="favBg" x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A1226" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>
        {/* Outer Shield */}
        <path
          d="M 32,5 C 47,5 57,8 57,22 C 57,40 42,54 32,59 C 22,54 7,40 7,22 C 7,8 17,5 32,5 Z"
          fill="url(#favShield)"
        />
        {/* Inner Shield */}
        <path
          d="M 32,8 C 44,8 53,11 53,23 C 53,38 40,50 32,55 C 24,50 11,38 11,23 C 11,11 20,8 32,8 Z"
          fill="url(#favBg)"
        />
        {/* Bold N */}
        <path
          d="M 21,16 L 27,16 L 43,42 L 43,46 L 37,46 L 21,20 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 21,16 L 27,16 L 27,46 L 21,46 Z"
          fill="#00F0FF"
        />
        <path
          d="M 37,16 L 43,16 L 43,46 L 37,46 Z"
          fill="#00F0FF"
        />
        {/* Mini Mag Lens Ring */}
        <circle cx="44" cy="42" r="7" fill="#041528" stroke="#00F0FF" strokeWidth="1.5" />
        <circle cx="42" cy="41" r="1" fill="#FFFFFF" />
        <circle cx="46" cy="43" r="1" fill="#00F0FF" />
      </svg>
    );
  }

  // App Icon View (Squircles 512x512 tile)
  if (variant === 'appIcon') {
    const iconSize = size || 128;
    return (
      <div 
        style={{ width: iconSize, height: iconSize }}
        className={`relative rounded-3xl flex flex-col items-center justify-center p-3 shadow-2xl transition-transform hover:scale-105 ${
          isLight 
            ? 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 border border-slate-300 shadow-slate-400/50 text-slate-900' 
            : 'bg-gradient-to-br from-slate-900 via-[#070b16] to-[#02050e] border border-cyan-500/30 shadow-cyan-950/80 text-white'
        } ${className}`}
      >
        {renderEmblem(typeof iconSize === 'number' ? iconSize * 0.65 : '65%')}
        <div className="mt-1 text-center">
          <p className={`font-extrabold font-mono-code uppercase tracking-wider text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
            NET<span className="text-cyan-400">TRACE</span>
          </p>
          <span className="text-[9px] font-mono-code px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-bold">
            V1.0
          </span>
        </div>
      </div>
    );
  }

  // Full Logo Layout (Emblem + Logotype)
  if (variant === 'full') {
    const emblemSize = size || 44;
    return (
      <div className={`flex items-center space-x-3.5 select-none ${className}`}>
        {renderEmblem(emblemSize)}
        <div className="flex flex-col justify-center py-0.5">
          <div className="flex items-center space-x-2.5 leading-none">
            <span className={`font-black tracking-wider font-mono-code uppercase text-xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
              NET<span className="text-cyan-400">TRACE</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono-code bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-md font-extrabold tracking-wide">
              V1.0
            </span>
          </div>
          <span className={`text-xs font-sans tracking-wide font-medium mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Network Forensics & Incident Reconstruction Platform
          </span>
          <span className="text-[11px] text-cyan-400 font-sans tracking-wide font-medium mt-0.5">
            Trace Every Packet. Reveal Every Attack.
          </span>
        </div>
      </div>
    );
  }

  // Horizontal Compact Version
  if (variant === 'horizontal') {
    const emblemSize = size || 36;
    return (
      <div className={`flex items-center space-x-2.5 select-none ${className}`}>
        {renderEmblem(emblemSize)}
        <div className="flex items-center space-x-2">
          <span className={`font-black tracking-wider font-mono-code uppercase text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
            NET<span className="text-cyan-400">TRACE</span>
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-mono-code bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-extrabold">
            V1.0
          </span>
        </div>
      </div>
    );
  }

  // Default: Icon Only
  return renderEmblem(size || 40);
};
