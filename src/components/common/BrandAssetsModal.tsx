import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Sun, 
  Moon, 
  Layers, 
  ShieldCheck, 
  Maximize2, 
  Code2, 
  CheckCircle2, 
  Sparkles,
  Search,
  Activity,
  Box
} from 'lucide-react';
import { NetTraceLogo } from './NetTraceLogo';

interface BrandAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandAssetsModal: React.FC<BrandAssetsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'variants' | 'modes' | 'svg' | 'specs'>('variants');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const svgCodeString = `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shieldBorderGrad" x1="20" y1="15" x2="180" y2="185" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00F0FF" />
      <stop offset="50%" stop-color="#00A2FF" />
      <stop offset="100%" stop-color="#0052FF" />
    </linearGradient>
    <linearGradient id="shieldBgGrad" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0A1226" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>
    <linearGradient id="nMainGrad" x1="60" y1="45" x2="140" y2="145" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="35%" stop-color="#E0F7FF" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>
    <linearGradient id="nStemGrad" x1="60" y1="45" x2="80" y2="145" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00F0FF" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="glassFrameGrad" x1="115" y1="105" x2="180" y2="175" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="50%" stop-color="#00F0FF" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="lensBgGrad" x1="120" y1="110" x2="155" y2="145" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#031A30" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#082B4C" stop-opacity="0.98" />
    </linearGradient>
  </defs>

  <!-- Packets -->
  <g class="packets">
    <rect x="4" y="68" width="12" height="10" rx="2" fill="#00F0FF" opacity="0.9" />
    <rect x="18" y="84" width="16" height="10" rx="2" fill="#00F0FF" opacity="0.95" />
    <rect x="8" y="102" width="14" height="10" rx="2" fill="#0284C7" opacity="0.85" />
    <rect x="22" y="118" width="12" height="10" rx="2" fill="#0284C7" opacity="0.9" />
  </g>

  <!-- Shield -->
  <path d="M 100,16 C 146,16 176,26 176,68 C 176,124 132,168 100,185 C 68,168 24,124 24,68 C 24,26 54,16 100,16 Z" fill="url(#shieldBorderGrad)" />
  <path d="M 100,23 C 141,23 168,32 168,70 C 168,120 127,159 100,174 C 73,159 32,120 32,70 C 32,32 59,23 100,23 Z" fill="url(#shieldBgGrad)" />

  <!-- Dominant N -->
  <path d="M 64,48 L 84,48 L 84,142 L 64,142 Z" fill="url(#nStemGrad)" />
  <path d="M 64,48 L 84,48 L 136,132 L 136,142 L 116,142 L 64,58 Z" fill="url(#nMainGrad)" />
  <path d="M 116,48 L 136,48 L 136,142 L 116,142 Z" fill="url(#nStemGrad)" />

  <!-- Packet Pulse Waveform -->
  <path d="M 50,154 L 68,154 L 73,144 L 78,162 L 85,134 L 92,158 L 98,150 L 105,154 L 125,154" stroke="#00F0FF" stroke-width="2.5" stroke-linecap="round" fill="none" />

  <!-- Reduced Magnifying Glass (15% Smaller) -->
  <g class="magnifying-glass">
    <line x1="152" y1="148" x2="178" y2="174" stroke="url(#glassFrameGrad)" stroke-width="7" stroke-linecap="round" />
    <circle cx="136" cy="130" r="24" fill="none" stroke="url(#glassFrameGrad)" stroke-width="4.5" />
    <circle cx="136" cy="130" r="20" fill="url(#lensBgGrad)" stroke="#00F0FF" stroke-width="1" stroke-opacity="0.4" />
    
    <!-- 3 Simplified Network Nodes -->
    <line x1="128" y1="123" x2="145" y2="121" stroke="#00F0FF" stroke-width="1.5" opacity="0.8" />
    <line x1="145" y1="121" x2="138" y2="138" stroke="#00F0FF" stroke-width="1.5" opacity="0.8" />
    <line x1="138" y1="138" x2="128" y2="123" stroke="#00F0FF" stroke-width="1.5" opacity="0.8" />
    <circle cx="128" cy="123" r="2.8" fill="#FFFFFF" />
    <circle cx="145" cy="121" r="2.8" fill="#00F0FF" />
    <circle cx="138" cy="138" r="2.8" fill="#FFFFFF" />
  </g>
</svg>`;

  const handleCopySvg = () => {
    navigator.clipboard.writeText(svgCodeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgCodeString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NetTrace_V2_Logo.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans selection:bg-cyan-500 selection:text-black overflow-y-auto">
      <div className="bg-[#080d1a] border border-slate-800 rounded-2xl w-full max-w-5xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold font-mono-code text-white">NetTrace Version 1.0 Brand Assets Suite</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono-code bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md font-bold">
                  Official Release
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enterprise SaaS brand design reference, vector specifications, and production-ready exports.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('variants')}
              className={`px-3.5 py-2 text-xs font-mono-code font-bold rounded-t-xl transition-all border-t border-x ${
                activeTab === 'variants'
                  ? 'bg-[#080d1a] text-cyan-300 border-slate-800 border-b-transparent'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              1. Logo Deliverable Variants
            </button>
            <button
              onClick={() => setActiveTab('modes')}
              className={`px-3.5 py-2 text-xs font-mono-code font-bold rounded-t-xl transition-all border-t border-x ${
                activeTab === 'modes'
                  ? 'bg-[#080d1a] text-cyan-300 border-slate-800 border-b-transparent'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              2. Dark & Light Modes
            </button>
            <button
              onClick={() => setActiveTab('svg')}
              className={`px-3.5 py-2 text-xs font-mono-code font-bold rounded-t-xl transition-all border-t border-x ${
                activeTab === 'svg'
                  ? 'bg-[#080d1a] text-cyan-300 border-slate-800 border-b-transparent'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              3. Raw SVG Vector Code
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-3.5 py-2 text-xs font-mono-code font-bold rounded-t-xl transition-all border-t border-x ${
                activeTab === 'specs'
                  ? 'bg-[#080d1a] text-cyan-300 border-slate-800 border-b-transparent'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              4. Refinement Specs
            </button>
          </div>

          <div className="flex items-center space-x-2 pb-2">
            <button
              onClick={handleCopySvg}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded-xl text-xs font-mono-code font-bold flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy SVG'}</span>
            </button>
            <button
              onClick={handleDownloadSvg}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono-code font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download SVG</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 font-sans">
          {/* TAB 1: ALL DELIVERABLE VARIANTS */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono-code flex items-center justify-between">
                <span>Displaying 8 Core Deliverable Formats for NetTrace V1.0</span>
                <span className="text-cyan-400 font-bold">CrowdStrike / SentinelOne Enterprise Benchmark</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Full Logo */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono-code text-cyan-400 uppercase font-bold tracking-wider">1. Full Logo</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Primary Branding</h3>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-center min-h-[110px]">
                    <NetTraceLogo variant="full" size={42} showTagline={true} />
                  </div>
                  <p className="text-[11px] text-slate-400">Full emblem + logotype + tagline for marketing & top bars.</p>
                </div>

                {/* 2. Icon Only */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono-code text-cyan-400 uppercase font-bold tracking-wider">2. Icon Only</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Standalone Emblem</h3>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-center min-h-[110px]">
                    <NetTraceLogo variant="icon" size={64} />
                  </div>
                  <p className="text-[11px] text-slate-400">Clean shield, dominant N, and 15% scaled down lens.</p>
                </div>

                {/* 3. Horizontal Version */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono-code text-cyan-400 uppercase font-bold tracking-wider">3. Horizontal Layout</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Header & Navigation</h3>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-center min-h-[110px]">
                    <NetTraceLogo variant="horizontal" size={38} />
                  </div>
                  <p className="text-[11px] text-slate-400">Compact horizontal arrangement optimized for top navigation.</p>
                </div>

                {/* 4. App Icon Version */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono-code text-cyan-400 uppercase font-bold tracking-wider">4. App Tile Icon</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">512x512 Desktop/Mobile</h3>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-center min-h-[110px]">
                    <NetTraceLogo variant="appIcon" size={96} />
                  </div>
                  <p className="text-[11px] text-slate-400">Squircle badge for macOS, Linux, and Windows launcher tiles.</p>
                </div>

                {/* 5. Favicon Version */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono-code text-cyan-400 uppercase font-bold tracking-wider">5. Favicon (16-32px)</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Browser Tab Clarity</h3>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-center space-x-4 min-h-[110px]">
                    <div className="flex flex-col items-center space-y-1">
                      <NetTraceLogo variant="favicon" size={16} />
                      <span className="text-[9px] font-mono-code text-slate-400">16px</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <NetTraceLogo variant="favicon" size={32} />
                      <span className="text-[9px] font-mono-code text-slate-400">32px</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <NetTraceLogo variant="favicon" size={48} />
                      <span className="text-[9px] font-mono-code text-slate-400">48px</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">Micro vector rendering preserving shield & N at 16px size.</p>
                </div>

                {/* 6. Light Canvas Version */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono-code text-cyan-400 uppercase font-bold tracking-wider">6. Light Mode Version</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">High Contrast Light</h3>
                  </div>
                  <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center min-h-[110px]">
                    <NetTraceLogo variant="full" theme="light" size={38} />
                  </div>
                  <p className="text-[11px] text-slate-400">Formatted on crisp light slate background with high-contrast logotype.</p>
                </div>

                {/* 7. Dark Canvas Version */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono-code text-cyan-400 uppercase font-bold tracking-wider">7. Dark Mode Version</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Deep Cyber Canvas</h3>
                  </div>
                  <div className="p-4 bg-[#070a12] border border-slate-800 rounded-xl flex items-center justify-center min-h-[110px]">
                    <NetTraceLogo variant="full" theme="dark" size={38} />
                  </div>
                  <p className="text-[11px] text-slate-400">Vibrant electric cyan/blue accents on dark navy background.</p>
                </div>

                {/* 8. Transparent Vector */}
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono-code text-cyan-400 uppercase font-bold tracking-wider">8. Transparent PNG/SVG</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Alpha Background</h3>
                  </div>
                  <div className="p-4 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center min-h-[110px]">
                    <NetTraceLogo variant="icon" size={60} />
                  </div>
                  <p className="text-[11px] text-slate-400">Alpha transparent layer for seamless integration into documents.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DARK & LIGHT MODES INTERACTIVE COMPARISON */}
          {activeTab === 'modes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono-code">Interactive Theme Contrast Tester</h3>
                  <p className="text-xs text-slate-400">Verify brand legibility across light, dark, and enterprise themes.</p>
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                  <button
                    onClick={() => setPreviewTheme('dark')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold flex items-center space-x-1.5 transition-all ${
                      previewTheme === 'dark' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark Theme</span>
                  </button>
                  <button
                    onClick={() => setPreviewTheme('light')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold flex items-center space-x-1.5 transition-all ${
                      previewTheme === 'light' ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'text-slate-400'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light Theme</span>
                  </button>
                </div>
              </div>

              {/* Theme Preview Stage */}
              <div className={`p-8 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center space-y-6 ${
                previewTheme === 'light'
                  ? 'bg-slate-100 border-slate-300 shadow-xl'
                  : 'bg-[#070a12] border-slate-800 shadow-2xl shadow-cyan-950/40'
              }`}>
                <NetTraceLogo variant="full" theme={previewTheme} size={64} showTagline={true} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl pt-4 border-t border-slate-500/20">
                  <div className="flex flex-col items-center p-4 rounded-xl bg-black/5 border border-black/10">
                    <NetTraceLogo variant="icon" theme={previewTheme} size={48} />
                    <span className="text-[10px] font-mono-code mt-2 font-bold opacity-70">Icon Symbol</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-xl bg-black/5 border border-black/10">
                    <NetTraceLogo variant="horizontal" theme={previewTheme} size={36} />
                    <span className="text-[10px] font-mono-code mt-2 font-bold opacity-70">Horizontal Bar</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-xl bg-black/5 border border-black/10">
                    <NetTraceLogo variant="appIcon" theme={previewTheme} size={80} />
                    <span className="text-[10px] font-mono-code mt-2 font-bold opacity-70">512x512 Squircle</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RAW SVG CODE */}
          {activeTab === 'svg' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono-code flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Vector SVG Source Code</span>
                  </h3>
                  <p className="text-xs text-slate-400">Production-ready resolution-independent SVG with inline gradients.</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopySvg}
                    className="px-3 py-1.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-mono-code font-bold flex items-center space-x-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSvg}
                    className="px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono-code font-bold flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download .svg</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto max-h-96">
                <pre className="text-xs font-mono-code text-cyan-300 leading-relaxed">
                  {svgCodeString}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: BRAND REFINEMENT SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white font-mono-code flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Version 1.0 Refinement Checklist & Vector Specifications</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono-code">
                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5">
                    <span className="text-cyan-400 font-bold">1. Reduced Lens Size (-15%)</span>
                    <p className="text-slate-300 text-[11px] font-sans">
                      Magnifying glass radius scaled down by ~15% (`r=24`) to eliminate visual clutter and keep focus centered on the shield.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5">
                    <span className="text-cyan-400 font-bold">2. Dominant "N" Central Geometry</span>
                    <p className="text-slate-300 text-[11px] font-sans">
                      Increased line weight and 3D diagonal facet gradient on the letter "N" for dominant brand recognition.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5">
                    <span className="text-cyan-400 font-bold">3. 3-Node Simplified Network Graph</span>
                    <p className="text-slate-300 text-[11px] font-sans">
                      Reduced internal lens complexity to 3 clean nodes connected by vector lines, preventing blurring at small scales.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5">
                    <span className="text-cyan-400 font-bold">4. 16px/32px Favicon Clarity</span>
                    <p className="text-slate-300 text-[11px] font-sans">
                      Simplified vector paths ensure flawless legibility in browser tabs and micro mobile app icons.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5">
                    <span className="text-cyan-400 font-bold">5. Streamlined Digital Packet Stream</span>
                    <p className="text-slate-300 text-[11px] font-sans">
                      4 crisp rectangular packet blocks streaming into the shield to symbolize deep packet inspection (DPI).
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5">
                    <span className="text-cyan-400 font-bold">6. Precise Pulse Waveform</span>
                    <p className="text-slate-300 text-[11px] font-sans">
                      Subtle EKG-style packet pulse at the shield base indicating real-time live threat monitoring.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs text-slate-400 font-mono-code">
          <span>NetTrace V1.0 Official Brand Guidelines</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
          >
            Close Suite
          </button>
        </div>
      </div>
    </div>
  );
};
