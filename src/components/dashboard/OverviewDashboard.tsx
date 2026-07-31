import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Network, 
  Fingerprint, 
  FileText, 
  Activity, 
  ArrowUpRight, 
  ChevronRight,
  User,
  Clock,
  FileCheck2,
  Play,
  HardDrive,
  FileCode,
  FileImage,
  Database,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  File
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { CardSkeleton, TableSkeleton } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { Tooltip } from '../common/Tooltip';
import { JargonBadge } from '../common/JargonBadge';

// Helper to format byte sizes
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Helper to format timestamps gracefully
function formatTimestamp(dateStr?: string): string {
  if (!dateStr) return 'Today • 10:35 AM';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const isToday = new Date().toDateString() === d.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Today • ${timeStr}` : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${timeStr}`;
  } catch {
    return dateStr;
  }
}

// Helper for Evidence Category icon & display name
function getEvidenceCategoryMeta(category: string) {
  switch (category) {
    case 'PCAP Trace':
      return { label: 'PCAP', icon: Network, color: 'text-cyan-400 bg-cyan-950/80 border-cyan-800' };
    case 'Memory Dump':
      return { label: 'Memory Dump', icon: HardDrive, color: 'text-purple-400 bg-purple-950/80 border-purple-800' };
    case 'Event Log':
      return { label: 'EVTX Log', icon: FileCode, color: 'text-amber-400 bg-amber-950/80 border-amber-800' };
    case 'Disk Image':
      return { label: 'Image', icon: FileImage, color: 'text-blue-400 bg-blue-950/80 border-blue-800' };
    default:
      return { label: category || 'Artifact', icon: File, color: 'text-slate-400 bg-slate-950 border-slate-800' };
  }
}

export const OverviewDashboard: React.FC<{ onOpenNewIncident: () => void }> = ({ onOpenNewIncident }) => {
  const { 
    incidents, 
    pcapSession, 
    iocs, 
    evidence, 
    reports,
    selectedIncidentId,
    setSelectedIncidentId, 
    setActiveTab,
    userProfile
  } = useInvestigation();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const criticalIncidents = incidents.filter(i => i.severity === 'Critical');
  const highRiskIocs = iocs.filter(i => i.threatScore >= 85);
  
  // Conditional Resume Investigation computation
  const activeCase = useMemo(() => {
    const activeIncidents = incidents.filter(i => {
      const statusLower = (i.status || '').toLowerCase().trim();
      if (['completed', 'closed', 'mitigated', 'archived'].includes(statusLower)) {
        return false;
      }
      const checklist = i.containmentChecklist || [];
      const completedTasks = checklist.filter(t => t.completed).length;
      const progressPercent = checklist.length > 0
        ? Math.round((completedTasks / checklist.length) * 100)
        : 72;

      if (progressPercent >= 100) return false;
      return true;
    });

    if (activeIncidents.length === 0) return null;

    const selectedActive = activeIncidents.find(i => i.id === selectedIncidentId) || activeIncidents[0];
    if (!selectedActive) return null;

    const checklist = selectedActive.containmentChecklist || [];
    const completedTasks = checklist.filter(t => t.completed).length;
    const progressPercent = checklist.length > 0
      ? Math.round((completedTasks / checklist.length) * 100)
      : 72;

    if (progressPercent >= 100) return null;

    const lastOpenedTime = formatTimestamp(selectedActive.updatedAt);

    return {
      ...selectedActive,
      progressPercent,
      lastOpenedTime
    };
  }, [incidents, selectedIncidentId]);

  // Evidence Counts Summary
  const evidenceSummary = useMemo(() => {
    const pcapCount = evidence.filter(e => e.category === 'PCAP Trace').length + (pcapSession ? 1 : 0);
    const memoryCount = evidence.filter(e => e.category === 'Memory Dump').length;
    const eventLogCount = evidence.filter(e => e.category === 'Event Log').length;
    const diskImageCount = evidence.filter(e => e.category === 'Disk Image').length;
    const otherCount = evidence.filter(e => e.category !== 'PCAP Trace' && e.category !== 'Memory Dump' && e.category !== 'Event Log' && e.category !== 'Disk Image').length;

    return [
      { type: 'PCAP Files', count: pcapCount, icon: Network, color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/80' },
      { type: 'Memory Dumps', count: memoryCount, icon: HardDrive, color: 'text-purple-400 bg-purple-950/60 border-purple-800/80' },
      { type: 'Event Logs', count: eventLogCount, icon: FileCode, color: 'text-amber-400 bg-amber-950/60 border-amber-800/80' },
      { type: 'Disk Images', count: diskImageCount, icon: FileImage, color: 'text-blue-400 bg-blue-950/60 border-blue-800/80' },
      { type: 'Other Artifacts', count: otherCount, icon: Database, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80' },
    ];
  }, [evidence, pcapSession]);

  // Chronological Activity Feed
  const chronologicalActivity = useMemo(() => {
    const activities: Array<{
      id: string;
      timestamp: string;
      title: string;
      description: string;
      icon: any;
      iconColor: string;
    }> = [];

    // Add Timeline items from active case
    if (activeCase?.timeline) {
      activeCase.timeline.forEach((tl, idx) => {
        activities.push({
          id: `tl-${tl.id || idx}`,
          timestamp: formatTimestamp(tl.timestamp),
          title: tl.eventType,
          description: tl.description,
          icon: tl.source === 'PCAP Analysis' ? Network : tl.source === 'EDR Log' ? ShieldAlert : Activity,
          iconColor: tl.severity === 'Critical' ? 'text-red-400 bg-red-950 border-red-800' : 'text-cyan-400 bg-cyan-950 border-cyan-800'
        });
      });
    }

    // Add Evidence upload events
    evidence.forEach((ev) => {
      activities.push({
        id: `ev-act-${ev.id}`,
        timestamp: formatTimestamp(ev.uploadedAt),
        title: 'Evidence Uploaded',
        description: `${ev.name} (${formatBytes(ev.sizeBytes)}) uploaded by ${ev.uploadedBy}`,
        icon: HardDrive,
        iconColor: 'text-purple-400 bg-purple-950 border-purple-800'
      });
    });

    // Add Report events
    reports.forEach((rep) => {
      activities.push({
        id: `rep-act-${rep.id}`,
        timestamp: formatTimestamp(rep.generatedAt),
        title: 'Forensic Report Compiled',
        description: `Status: ${rep.status} • Generated by ${rep.generatedBy}`,
        icon: FileCheck2,
        iconColor: 'text-emerald-400 bg-emerald-950 border-emerald-800'
      });
    });

    // Fallback if empty
    if (activities.length === 0) {
      activities.push(
        { id: 'def-1', timestamp: 'Today • 11:20 AM', title: 'Report Generated', description: 'LockBit 3.0 DFIR Executive Report compiled.', icon: FileCheck2, iconColor: 'text-emerald-400 bg-emerald-950 border-emerald-800' },
        { id: 'def-2', timestamp: 'Today • 11:12 AM', title: 'Evidence Tagged', description: 'DC01_lsass_memory_dump.dmp added to vault.', icon: HardDrive, iconColor: 'text-purple-400 bg-purple-950 border-purple-800' },
        { id: 'def-3', timestamp: 'Today • 10:55 AM', title: 'IOCs Extracted', description: 'IP 185.220.101.5 identified with threat score 98.', icon: Fingerprint, iconColor: 'text-cyan-400 bg-cyan-950 border-cyan-800' },
        { id: 'def-4', timestamp: 'Today • 10:47 AM', title: 'Packet Analysis Started', description: 'Deep packet inspection initiated on PCAP capture trace.', icon: Network, iconColor: 'text-blue-400 bg-blue-950 border-blue-800' },
        { id: 'def-5', timestamp: 'Today • 10:40 AM', title: 'PCAP Uploaded', description: 'incident_capture_DC01_10.0.1.5.pcapng (248 KB) added.', icon: Network, iconColor: 'text-cyan-400 bg-cyan-950 border-cyan-800' },
        { id: 'def-6', timestamp: 'Today • 10:35 AM', title: 'Case Created', description: 'Incident dockets INC-2026-8842 opened for investigation.', icon: ShieldAlert, iconColor: 'text-red-400 bg-red-950 border-red-800' }
      );
    }

    return activities.slice(0, 6);
  }, [activeCase, evidence, reports]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans">
        <div className="h-20 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
        <CardSkeleton count={4} />
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-5 md:p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>COMMAND CENTER ONLINE</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Role: {userProfile.role}</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-slate-100 font-heading">
            Welcome back, {userProfile.fullName}
          </h1>

          <div className="text-xs text-slate-300 max-w-2xl leading-relaxed font-sans">
            NetTrace V1.0 Platform Active • {userProfile.organization} • Built for <JargonBadge term="DFIR" customText="DFIR Incident Response" />, <JargonBadge term="Packet" customText="Deep Packet Inspection" />, and <JargonBadge term="IOC" customText="IOC Intelligence" />.
          </div>
        </div>

        {/* DFIR System Status Pill */}
        <div className="flex items-center space-x-3 bg-slate-950/90 p-3 rounded-xl border border-slate-800 text-xs font-sans shrink-0 shadow-inner">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">DFIR Incident Engine</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Status: Online</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Continue Active Investigation Banner (Conditional) */}
      <AnimatePresence mode="wait">
        {activeCase && (
          <motion.div
            key={activeCase.id}
            initial={{ opacity: 0, y: -16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -16, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900/90 border border-cyan-800/60 p-5 rounded-2xl shadow-xl space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-full bg-cyan-500/5 blur-3xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                <div className="space-y-2 flex-1">
                  {/* Top Bar: Pulse Badge & Case ID */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 rounded-lg flex items-center space-x-1.5 font-heading">
                      <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 animate-pulse" />
                      <span>Continue Active Investigation</span>
                    </span>

                    <span className="px-2.5 py-1 text-xs font-mono font-bold bg-red-950/90 text-red-400 border border-red-800/80 rounded-lg shadow-sm">
                      {activeCase.incidentNumber}
                    </span>

                    <span className="px-2.5 py-1 text-[11px] font-mono font-medium text-slate-400 bg-slate-950 border border-slate-800 rounded-lg flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>Last Opened: {activeCase.lastOpenedTime}</span>
                    </span>
                  </div>

                  {/* Investigation Title */}
                  <h2 className="text-base md:text-lg font-bold text-slate-100 font-heading">
                    {activeCase.title}
                  </h2>

                  {/* Stage, Category & Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-sans">
                    <span className="flex items-center space-x-1">
                      <span className="text-slate-400">Stage:</span>
                      <span className="text-cyan-300 font-bold">{activeCase.currentStage}</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center space-x-1">
                      <span className="text-slate-400">Category:</span>
                      <span className="text-purple-300 font-semibold">{activeCase.category}</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center space-x-1">
                      <span className="text-slate-400">Lead Analyst:</span>
                      <span className="text-slate-200 font-medium">{activeCase.assignedAnalyst}</span>
                    </span>
                  </div>
                </div>

                {/* Progress & Resume Action */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                  {/* Progress Bar */}
                  <div className="w-full sm:w-48 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400 font-sans text-xs">Progress:</span>
                      <span className="font-bold text-cyan-300">{activeCase.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${activeCase.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Resume Button */}
                  <Tooltip content="Resume case workbench with full evidence state restored.">
                    <button
                      onClick={() => {
                        setSelectedIncidentId(activeCase.id);
                        setActiveTab('workbench');
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-600/30 border border-cyan-400 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 font-sans cursor-pointer"
                    >
                      <span>Resume Investigation</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {/* Metric 1 */}
        <div 
          onClick={() => setActiveTab('incidents')}
          className="bg-slate-900/90 border border-slate-800 hover:border-red-600/50 p-4 rounded-xl shadow-lg cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Active Incidents
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100 font-heading">
              {incidents.length}
            </span>
            <span className="text-xs text-red-400 font-semibold">
              {criticalIncidents.length} Critical
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Latest: <span className="font-mono">{incidents[0]?.incidentNumber || 'N/A'}</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => setActiveTab('pcap')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-600/50 p-4 rounded-xl shadow-lg cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Analyzed Packets
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100 font-heading">
              {pcapSession.totalPackets}
            </span>
            <span className="text-xs text-cyan-400 font-semibold">
              {pcapSession.suspiciousDetections.length} Anomaly Alerts
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Trace: <span className="font-mono">{pcapSession.filename}</span>
          </p>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => setActiveTab('ioc')}
          className="bg-slate-900/90 border border-slate-800 hover:border-purple-600/50 p-4 rounded-xl shadow-lg cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Tracked IOCs
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Fingerprint className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100 font-heading">
              {iocs.length}
            </span>
            <span className="text-xs text-purple-400 font-semibold">
              {highRiskIocs.length} High Risk
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate font-sans">
            IPs, Hashes, Domains & URLs
          </p>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => setActiveTab('evidence')}
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-600/50 p-4 rounded-xl shadow-lg cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Evidence Vault
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100 font-heading">
              {evidence.length}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              SHA-256 Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate font-sans">
            Memory Dumps, EVTX, Binaries
          </p>
        </div>
      </div>

      {/* 4. Evidence Summary Cards */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 font-heading">
          Evidence Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-sans">
          {evidenceSummary.map((item) => {
            const ItemIcon = item.icon;
            return (
              <div 
                key={item.type}
                onClick={() => setActiveTab('evidence')}
                className="bg-slate-900/90 border border-slate-800 hover:border-cyan-600/50 p-3.5 rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5 flex items-center justify-between group"
              >
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.type}</p>
                  <p className="text-xl font-bold text-slate-100 font-heading mt-0.5">{item.count}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <ItemIcon className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Dual Section: Recent Investigations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        {/* Recent Investigations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-heading flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>Recent Investigation Cases</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">Latest active and closed cybersecurity cases</p>
            </div>
            <button
              onClick={() => setActiveTab('incidents')}
              className="text-xs font-sans text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View All ({incidents.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {incidents.length === 0 ? (
            <EmptyState
              title="No Investigations Found"
              description="Click below to start a new investigation."
              actionLabel="Create Incident"
              onAction={onOpenNewIncident}
            />
          ) : (
            <div className="space-y-2 font-sans">
              {incidents.slice(0, 4).map((inc) => (
                <div 
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncidentId(inc.id);
                    setActiveTab('workbench');
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-cyan-700/60 rounded-xl cursor-pointer transition-all flex items-center justify-between group hover:translate-x-1"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-cyan-400 font-mono">{inc.incidentNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.severity === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                        inc.severity === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors font-sans">
                      {inc.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans">Stage: {inc.currentStage} • Assigned: {inc.assignedAnalyst}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Investigation Activity Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-heading flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Recent Investigation Activity</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">Real-time forensic audit log & analyst operations</p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-1 rounded">
              Chronological Feed
            </span>
          </div>

          <div className="space-y-3 font-sans relative before:absolute before:top-2 before:bottom-2 before:left-4 before:w-0.5 before:bg-slate-800">
            {chronologicalActivity.map((act) => {
              const ActIcon = act.icon;
              return (
                <div key={act.id} className="relative flex items-start space-x-3 pl-2">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 z-10 ${act.iconColor}`}>
                    <ActIcon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 bg-slate-950 border border-slate-800/80 p-2.5 rounded-xl space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 font-heading">{act.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{act.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Recent Uploaded Evidence (Latest 5 Files) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-heading flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span>Recent Uploaded Evidence</span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">Top forensic artifacts, memory dumps, and PCAP traces</p>
          </div>
          <button
            onClick={() => setActiveTab('evidence')}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5 transition-all"
          >
            <span>View All Evidence ({evidence.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {evidence.length === 0 ? (
          <EmptyState
            title="No Evidence Uploaded"
            description="Upload PCAP, memory dumps, or log artifacts into the Evidence Vault."
            actionLabel="Go to Evidence Vault"
            onAction={() => setActiveTab('evidence')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold bg-slate-950/50">
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Upload Date & Time</th>
                  <th className="py-2.5 px-3">File Size</th>
                  <th className="py-2.5 px-3">Uploaded By</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {evidence.slice(0, 5).map((ev) => {
                  const meta = getEvidenceCategoryMeta(ev.category);
                  const IconComp = meta.icon;
                  return (
                    <tr key={ev.id} className="hover:bg-slate-950/70 transition-colors group">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-1.5 rounded-md border ${meta.color} shrink-0`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate max-w-xs">
                            {ev.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {formatTimestamp(ev.uploadedAt)}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-300">
                        {formatBytes(ev.sizeBytes)}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {ev.uploadedBy}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setActiveTab('evidence')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-medium text-[11px] inline-flex items-center space-x-1 border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 8. Latest Generated Reports (Latest 5 Reports) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-heading flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Latest Generated Reports</span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">Official forensics technical & executive signoff documents</p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5 transition-all"
          >
            <span>View All Reports ({reports.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {reports.length === 0 ? (
          <EmptyState
            title="No Reports Generated"
            description="Compile a DFIR report from an active investigation case."
            actionLabel="Go to Reports"
            onAction={() => setActiveTab('reports')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold bg-slate-950/50">
                  <th className="py-2.5 px-3">Report Name</th>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Generated Date</th>
                  <th className="py-2.5 px-3">Generated By</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {reports.slice(0, 5).map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-950/70 transition-colors group">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-xs text-slate-200 group-hover:text-emerald-300 transition-colors truncate max-w-sm">
                          {rep.incidentTitle}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-400 font-bold text-xs">
                      {rep.incidentId ? rep.incidentId.toUpperCase() : 'INC-2026-8842'}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {formatTimestamp(rep.generatedAt)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {rep.generatedBy}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => setActiveTab('reports')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded font-medium text-[11px] inline-flex items-center space-x-1 border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('reports')}
                          className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded font-medium text-[11px] inline-flex items-center space-x-1 border border-emerald-800 transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
