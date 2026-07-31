import React, { useEffect, useRef } from 'react';
import { 
  Network,
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Search, 
  FileText, 
  Lock, 
  Users, 
  CheckCircle2, 
  Activity, 
  Cpu, 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Layers, 
  BarChart3, 
  ShieldAlert,
  Terminal,
  Fingerprint,
  Archive,
  Workflow
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { NetTraceLogo } from '../common/NetTraceLogo';

// Interactive Network Visualization Canvas Component for Hero
const InteractiveHeroCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate network nodes
    const nodeCount = 35;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      label: string;
    }> = [];

    const labels = ['192.168.1.100', '185.220.101.5', 'SYN_SENT', 'DNS_QUERY', 'HTTP/POST', 'SHA-256', 'TLSv1.3', 'C2_BEACON'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.5 + 1.5,
        color: i % 4 === 0 ? '#ef4444' : i % 3 === 0 ? '#a855f7' : '#06b6d4',
        label: labels[i % labels.length]
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Pulse animation timer
    let pulseProgress = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pulseProgress += 0.02;

      // Update positions & draw lines
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];

        nodeA.x += nodeA.vx;
        nodeA.y += nodeA.vy;

        if (nodeA.x < 0 || nodeA.x > canvas.width) nodeA.vx *= -1;
        if (nodeA.y < 0 || nodeA.y > canvas.height) nodeA.vy *= -1;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const opacity = (1 - dist / 130) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Animated Packet Pulse traveling along line
            if (i % 3 === 0) {
              const pulsePos = (Math.sin(pulseProgress + i) + 1) / 2;
              const px = nodeA.x + dx * pulsePos;
              const py = nodeA.y + dy * pulsePos;
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fillStyle = nodeA.color;
              ctx.fill();
            }
          }
        }

        // Draw node dot
        const distMouse = Math.sqrt((mouseX - nodeA.x) ** 2 + (mouseY - nodeA.y) ** 2);
        const isNearMouse = distMouse < 100;

        ctx.beginPath();
        ctx.arc(nodeA.x, nodeA.y, isNearMouse ? nodeA.radius + 2 : nodeA.radius, 0, Math.PI * 2);
        ctx.fillStyle = isNearMouse ? '#ffffff' : nodeA.color;
        ctx.shadowColor = nodeA.color;
        ctx.shadowBlur = isNearMouse ? 12 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw text label on select key nodes
        if (i % 6 === 0 || isNearMouse) {
          ctx.font = '9px monospace';
          ctx.fillStyle = isNearMouse ? '#38bdf8' : 'rgba(148, 163, 184, 0.7)';
          ctx.fillText(nodeA.label, nodeA.x + 6, nodeA.y + 3);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-auto z-0 opacity-60" 
    />
  );
};

export const LandingPage: React.FC = () => {
  const { setAppFlowStage, loginUser } = useInvestigation();

  const handleLaunchDemo = () => {
    loginUser('alex.mercer@nettrace.security');
  };

  const handleOpenLogin = () => {
    setAppFlowStage('login');
  };

  const handleOpenRegister = () => {
    setAppFlowStage('register');
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-[#070a12]/95 backdrop-blur-md border-b border-slate-800/80 px-6 md:px-8 py-3.5 shadow-2xl">
        <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-6">
          {/* LEFT SECTION: BRANDING (24-32px padding from browser edge) */}
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => setAppFlowStage('landing')}>
            <NetTraceLogo variant="full" size={44} showTagline={true} />
          </div>

          {/* CENTER SECTION: NAVIGATION (Perfectly centered with animated hover underlines) */}
          <nav className="hidden lg:flex items-center justify-center space-x-8 xl:space-x-10 text-xs font-sans">
            <a 
              href="#features" 
              className="relative py-1 text-slate-300 hover:text-cyan-400 transition-colors duration-200 group font-semibold tracking-wide"
            >
              <span>Features</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300 ease-out" />
            </a>
            <a 
              href="#workflow" 
              className="relative py-1 text-slate-300 hover:text-cyan-400 transition-colors duration-200 group font-semibold tracking-wide"
            >
              <span>How It Works</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300 ease-out" />
            </a>
            <a 
              href="#target-users" 
              className="relative py-1 text-slate-300 hover:text-cyan-400 transition-colors duration-200 group font-semibold tracking-wide"
            >
              <span>Target Users</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300 ease-out" />
            </a>
            <a 
              href="#preview" 
              className="relative py-1 text-slate-300 hover:text-cyan-400 transition-colors duration-200 group font-semibold tracking-wide"
            >
              <span>Platform Preview</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300 ease-out" />
            </a>
          </nav>

          {/* RIGHT SECTION: AUTHENTICATION BUTTONS (24-32px padding from browser edge) */}
          <div className="flex items-center space-x-3 font-sans text-xs shrink-0">
            <button
              onClick={handleOpenLogin}
              className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl font-semibold transition-all shadow-md hover:shadow-cyan-950/40"
            >
              Log In
            </button>
            <button
              onClick={handleOpenRegister}
              className="px-4.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl font-bold transition-all shadow-lg shadow-cyan-600/30 transform hover:scale-102"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH INTERACTIVE NETWORK CANVAS */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden min-h-[520px] flex items-center justify-center">
        {/* Interactive Network Node Visualizer */}
        <InteractiveHeroCanvas />

        {/* Glow Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10 pointer-events-none">
          {/* Hero Official Logo Banner */}
          <div className="flex flex-col items-center justify-center space-y-3 pointer-events-auto">
            <div className="p-3 bg-slate-950/90 border border-cyan-500/60 rounded-3xl shadow-2xl shadow-cyan-500/20 backdrop-blur-md transform hover:scale-105 transition-all">
              <NetTraceLogo variant="icon" size={72} />
            </div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-700/60 text-cyan-300 text-xs font-sans font-semibold backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Generation DFIR & PCAP Forensics Engine</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 font-heading leading-tight">
            Trace Every Packet. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Reveal Every Attack.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans">
            NetTrace is the all-in-one Network Forensics & Incident Reconstruction Platform built for DFIR analysts, cybersecurity learners, SOC responders, and engineering teams to analyze PCAP streams, extract IOCs, rebuild timelines, and publish forensic reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 font-sans text-xs pointer-events-auto">
            <button
              onClick={handleOpenLogin}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl shadow-xl shadow-cyan-500/30 flex items-center justify-center space-x-2 text-sm transition-all transform hover:scale-105 border border-cyan-300"
            >
              <span>LAUNCH COMMAND CENTER</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded-2xl font-bold flex items-center justify-center space-x-2 text-sm transition-all backdrop-blur-md"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Explore Interactive Demo</span>
            </button>
          </div>

          {/* Quick Metrics Badge */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pointer-events-auto font-sans">
            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl text-center backdrop-blur-md">
              <span className="block text-2xl font-bold font-heading text-cyan-400">100%</span>
              <span className="text-xs text-slate-400 font-sans">Packet Deep Inspection</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl text-center backdrop-blur-md">
              <span className="block text-2xl font-bold font-heading text-purple-400">0.2s</span>
              <span className="text-xs text-slate-400 font-sans">Automated IOC Parsing</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl text-center backdrop-blur-md">
              <span className="block text-2xl font-bold font-heading text-emerald-400">DFIR</span>
              <span className="text-xs text-slate-400 font-sans">Standardized PDF Reports</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl text-center backdrop-blur-md">
              <span className="block text-2xl font-bold font-heading text-amber-400">Beginner</span>
              <span className="text-xs text-slate-400 font-sans">Friendly Onboarding</span>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM PREVIEW MOCKUP */}
      <section id="preview" className="py-12 px-6 max-w-6xl mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 px-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-heading text-slate-300 ml-2">NetTrace Workbench — PCAP Stream Correlator</span>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
              Active Session: ransomware_stager.pcap
            </span>
          </div>

          {/* Interactive Preview Content Card */}
          <div className="bg-[#0b0f19] p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 font-heading">
                <span>Packet Stream</span>
                <Network className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-cyan-300 font-bold text-sm font-sans">28 Packets Analyzed</p>
              <p className="text-slate-500 text-[11px] font-sans">HTTP, DNS, TCP Payload Inspection active</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 font-heading">
                <span>Threat Detections</span>
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-red-400 font-bold text-sm font-sans">C2 Reverse Shell Signal</p>
              <p className="text-slate-500 text-[11px] font-sans">Flagged <span className="font-mono">185.220.101.5</span> Outbound Beacon</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 font-heading">
                <span>Forensic Report</span>
                <FileText className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-bold text-sm font-sans">DFIR Report Ready</p>
              <p className="text-slate-500 text-[11px] font-sans"><span className="font-mono">INC-2026-8842</span> Docket Complete</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-100">
            Core Incident Investigation Capabilities
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto font-sans">
            Everything required to dissect network payloads, track threat actors, and document incident response evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-cyan-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-heading text-slate-100 text-sm">Deep Packet Inspection (DPI)</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Analyze TCP, UDP, DNS, HTTP, SMB streams packet by packet with ASCII/Hex payload views and threat flag alerts.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-purple-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-heading text-slate-100 text-sm">Automated IOC Extraction</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Parse raw log files or PCAP streams to extract IP addresses, malicious domains, URLs, and file checksums instantly.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-heading text-slate-100 text-sm">Timeline Reconstruction</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Reconstruct complete incident timelines from Initial Access to Impact with automated log correlation.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Archive className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-heading text-slate-100 text-sm">Evidence Vault & Chain of Custody</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Store disk images, PCAPs, and memory dumps with SHA-256 verification and immutable audit logs.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-blue-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-heading text-slate-100 text-sm">Standardized DFIR Reports</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Generate executive-ready digital forensics reports complete with timelines, IOC lists, containment steps, and digital signatures.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-red-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-heading text-slate-100 text-sm">Host Containment & Isolation</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Isolate compromised workstations and domain controllers directly from the incident workbench.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / WORKFLOW */}
      <section id="workflow" className="py-16 px-6 max-w-7xl mx-auto w-full bg-slate-900/40 border-y border-slate-800">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-100">
            How NetTrace Works
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto font-sans">
            Step-by-step incident reconstruction lifecycle for cybersecurity investigators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold text-xs flex items-center justify-center font-sans">1</span>
            <h4 className="font-bold font-heading text-slate-100 text-sm">Ingest Traffic & Logs</h4>
            <p className="text-slate-400 text-xs font-sans">Upload PCAP files or connect firewall and EDR syslog feeds.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold text-xs flex items-center justify-center font-sans">2</span>
            <h4 className="font-bold font-heading text-slate-100 text-sm">Deep Packet Analysis</h4>
            <p className="text-slate-400 text-xs font-sans">PyShark and DPI engines inspect packet payloads and flags for malicious patterns.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold text-xs flex items-center justify-center font-sans">3</span>
            <h4 className="font-bold font-heading text-slate-100 text-sm">Extract IOCs & Timeline</h4>
            <p className="text-slate-400 text-xs font-sans">Correlate IP addresses, threat scores, and build an incident lifecycle timeline.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold text-xs flex items-center justify-center font-sans">4</span>
            <h4 className="font-bold font-heading text-slate-100 text-sm">Publish DFIR Report</h4>
            <p className="text-slate-400 text-xs font-sans">Export digitally signed forensic reports ready for executives and legal counsel.</p>
          </div>
        </div>
      </section>

      {/* TARGET USERS */}
      <section id="target-users" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-100">
            Designed for Every Cybersecurity Professional
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto font-sans">
            From university students learning packet analysis to lead DFIR investigators handling enterprise ransomware response.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center font-sans">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <GraduationCap className="w-6 h-6 text-cyan-400 mx-auto" />
            <h5 className="font-bold font-heading text-xs text-slate-200">Students & Learners</h5>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <Briefcase className="w-6 h-6 text-purple-400 mx-auto" />
            <h5 className="font-bold font-heading text-xs text-slate-200">DFIR Analysts</h5>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <ShieldAlert className="w-6 h-6 text-red-400 mx-auto" />
            <h5 className="font-bold font-heading text-xs text-slate-200">SOC Teams</h5>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <Building2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <h5 className="font-bold font-heading text-xs text-slate-200">Colleges & Labs</h5>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <Cpu className="w-6 h-6 text-blue-400 mx-auto" />
            <h5 className="font-bold font-heading text-xs text-slate-200">Security Engineers</h5>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full text-center">
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-800/80 p-10 rounded-3xl space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-100">
            Ready to Investigate Cyber Attacks with NetTrace?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-sans">
            Launch the NetTrace Command Station to experience real-time PCAP packet analysis and forensic incident reconstruction.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 font-sans text-xs">
            <button
              onClick={handleOpenLogin}
              className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl shadow-lg transition-all"
            >
              Sign In to Command Center
            </button>
            <button
              onClick={handleOpenRegister}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl font-bold transition-all"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-[#05070d] py-8 px-6 font-sans text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <NetTraceLogo variant="horizontal" size={28} />
            <span>•</span>
            <span className="flex items-center space-x-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Status: <strong className="text-emerald-400">Online</strong></span>
            </span>
          </div>

          <p className="text-slate-600 text-center md:text-right font-sans">
            Network Forensics & Incident Reconstruction Platform • All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
