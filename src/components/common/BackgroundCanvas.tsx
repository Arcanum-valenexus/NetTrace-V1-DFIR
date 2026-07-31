import React from 'react';

export const AnimatedGrid: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 opacity-[0.08] animate-grid-pan pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}
    />
  );
};

export const MovingNetworkLines: React.FC = () => {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none">
      <defs>
        <linearGradient id="netGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
        </linearGradient>

        <linearGradient id="netGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
        </linearGradient>

        <radialGradient id="glowPoint" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Network Stream Path 1 */}
      <path 
        d="M 50 120 Q 300 220, 600 120 T 1100 350 T 1600 180" 
        fill="none" 
        stroke="url(#netGrad1)" 
        strokeWidth="1.5" 
        strokeDasharray="12 8"
        className="animate-dash-flow"
      />

      {/* Network Stream Path 2 */}
      <path 
        d="M 100 500 Q 500 350, 900 650 T 1700 550" 
        fill="none" 
        stroke="url(#netGrad2)" 
        strokeWidth="1.2" 
        strokeDasharray="16 10"
        className="animate-dash-flow-fast"
      />

      {/* Secondary Dynamic Node Connector */}
      <path 
        d="M 200 800 Q 700 600, 1200 850" 
        fill="none" 
        stroke="url(#netGrad1)" 
        strokeWidth="1" 
        strokeDasharray="8 6"
        className="animate-dash-flow"
      />

      {/* Pulse Nodes at Intersections */}
      <circle cx="600" cy="120" r="4" fill="#06b6d4" className="animate-ping opacity-75" />
      <circle cx="1100" cy="350" r="3" fill="#3b82f6" className="animate-pulse" />
      <circle cx="900" cy="650" r="4" fill="#10b981" className="animate-ping opacity-60" />
    </svg>
  );
};

export const BackgroundCanvas: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Dark Ambient Gradient Core */}
      <div className="absolute inset-0 bg-[#070a12]" />

      {/* Animated Cyber Grid */}
      <AnimatedGrid />

      {/* Radial Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] animate-pulse-glow" />
      <div className="absolute top-[40%] right-[15%] w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px]" />

      {/* Moving Network SVG Overlay */}
      <MovingNetworkLines />
    </div>
  );
};
