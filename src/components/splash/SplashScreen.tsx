import React, { useEffect, useState } from 'react';
import { Zap, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { NetTraceLogo } from '../common/NetTraceLogo';

export const SplashScreen: React.FC = () => {
  const { setAppFlowStage } = useInvestigation();
  const [progress, setProgress] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  // Smooth loading progress over ~2.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 4;
      });
    }, 90);

    return () => clearInterval(timer);
  }, []);

  const handleNavigate = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setAppFlowStage('landing');
    }, 400);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 h-[100dvh] w-screen bg-[#070a12] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans select-none overflow-hidden transition-opacity duration-500 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-fadeIn'
      }`}
    >
      {/* Background Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Top Header Branding & Skip Intro (Pinned to top edge across full viewport width) */}
      <header className="w-full flex items-center justify-between z-10 shrink-0 px-2 sm:px-6 md:px-10">
        <div className="flex items-center space-x-3">
          <NetTraceLogo variant="horizontal" size={32} />
        </div>

        <button 
          onClick={handleNavigate}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-sans font-medium text-slate-300 hover:text-cyan-400 transition-all flex items-center space-x-2 group shadow-md cursor-pointer"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* Center Group: Single Vertically Centered Unit occupying full available flex height */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 py-4 text-center animate-fadeIn min-h-0">
        <div className="flex flex-col items-center justify-center w-full space-y-4 sm:space-y-6 md:space-y-7 my-auto">
          
          {/* Animated Core Logo Frame */}
          <div 
            className="relative flex items-center justify-center cursor-pointer group shrink-0" 
            onClick={handleNavigate}
          >
            <div className="absolute -inset-4 rounded-full border border-cyan-500/20 animate-ping" />
            <div className="absolute -inset-2 rounded-full border border-cyan-500/40 animate-pulse" />
            <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-950/90 border border-cyan-500/80 shadow-2xl shadow-cyan-500/30 transform group-hover:scale-105 transition-transform">
              <NetTraceLogo variant="icon" size={80} className="sm:w-[96px] sm:h-[96px]" />
            </div>
          </div>

          {/* Product Title & Tagline */}
          <div className="space-y-1.5 sm:space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wider font-heading uppercase">
              NET<span className="text-cyan-400">TRACE</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-bold text-slate-300 font-sans tracking-wide max-w-lg mx-auto">
              Network Forensics & Incident Reconstruction Platform
            </p>
            <p className="text-cyan-400 text-xs sm:text-sm font-semibold tracking-wider italic font-sans">
              Trace Every Packet. Reveal Every Attack.
            </p>
          </div>

          {/* Progress Loading Bar Section */}
          <div className="w-full max-w-md space-y-2 sm:space-y-2.5 font-sans pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1.5 font-sans truncate">
                {progress < 100 ? (
                  <>
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                    <span className="truncate">Initialising Packet Engine & Forensics Vault...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-bold">Engine Loaded & Ready</span>
                  </>
                )}
              </span>
              <span className="text-cyan-400 font-bold font-mono ml-2 shrink-0">{progress}%</span>
            </div>

            <div className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 rounded-full transition-all duration-200 shadow-md shadow-cyan-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Continue Action Button (Immediately below progress bar) */}
          <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 font-sans">
            {progress >= 100 ? (
              <button
                onClick={handleNavigate}
                className="px-7 sm:px-8 py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-cyan-500/30 border border-cyan-300 flex items-center space-x-2.5 transition-all transform hover:scale-105 animate-bounce font-sans tracking-wide cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                <span>CONTINUE TO LANDING PAGE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNavigate}
                className="px-6 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700/80 font-semibold text-xs rounded-xl flex items-center space-x-2 transition-all font-sans cursor-pointer"
              >
                <span>Skip Loading</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Footer Details (Pinned to bottom edge across full viewport width) */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans text-slate-500 z-10 gap-2 border-t border-slate-900/80 pt-3 sm:pt-4 shrink-0 px-2 sm:px-6 md:px-10">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Status: <strong className="text-emerald-400 font-sans">Online</strong></span>
        </div>
        <p className="text-slate-600 font-sans text-center sm:text-right">
          NetTrace V1.0 • Modern Incident Response & Network Forensics
        </p>
      </footer>
    </div>
  );
};


