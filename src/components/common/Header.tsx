import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Zap, 
  Plus, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronDown,
  Building2,
  Mail,
  Sparkles,
  ShieldAlert,
  HardDrive,
  Terminal,
  Fingerprint,
  FileText
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { LiveSystemClock } from './LiveSystemClock';
import { Tooltip } from './Tooltip';
import { LogoutModal } from './LogoutModal';
import { HelpDocumentationModal } from './HelpDocumentationModal';
import { NetTraceLogo } from './NetTraceLogo';
import { BrandAssetsModal } from './BrandAssetsModal';

export const Header: React.FC<{ onOpenNewIncident: () => void }> = ({ onOpenNewIncident }) => {
  const { 
    globalSearch, 
    setGlobalSearch, 
    setIsContainmentModalOpen, 
    setActiveTab,
    userProfile,
    incidents,
    pcapSession,
    iocs,
    evidence,
    reports,
    setSelectedIncidentId,
    setSelectedPacket,
    showToast
  } = useInvestigation();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isBrandAssetsOpen, setIsBrandAssetsOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        // keep globalSearch text or close popover
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = globalSearch.trim().toLowerCase();
  
  const matchedIncidents = query ? incidents.filter(i => 
    i.id.toLowerCase().includes(query) ||
    i.incidentNumber.toLowerCase().includes(query) ||
    i.title.toLowerCase().includes(query) ||
    i.summary.toLowerCase().includes(query) ||
    i.assignedAnalyst.toLowerCase().includes(query) ||
    (i.reporter && i.reporter.toLowerCase().includes(query)) ||
    i.category.toLowerCase().includes(query) ||
    i.status.toLowerCase().includes(query) ||
    i.notes.some(n => n.content.toLowerCase().includes(query)) ||
    i.timeline.some(t => t.description.toLowerCase().includes(query))
  ) : [];

  const matchedEvidence = query ? evidence.filter(e => 
    e.id.toLowerCase().includes(query) ||
    e.name.toLowerCase().includes(query) ||
    e.category.toLowerCase().includes(query) ||
    e.uploadedBy.toLowerCase().includes(query) ||
    e.hashSha256.toLowerCase().includes(query) ||
    e.hashMd5.toLowerCase().includes(query) ||
    e.storagePath.toLowerCase().includes(query) ||
    e.chainOfCustody.some(c => c.notes.toLowerCase().includes(query))
  ) : [];

  const matchedPackets = query ? pcapSession.packets.filter(p => 
    p.packetNo.toString().includes(query) ||
    p.protocol.toLowerCase().includes(query) ||
    p.srcIp.toLowerCase().includes(query) ||
    p.destIp.toLowerCase().includes(query) ||
    p.info.toLowerCase().includes(query) ||
    p.threatRating.toLowerCase().includes(query) ||
    p.asciiStream.toLowerCase().includes(query)
  ) : [];

  const matchedIocs = query ? iocs.filter(ioc => 
    ioc.id.toLowerCase().includes(query) ||
    ioc.value.toLowerCase().includes(query) ||
    ioc.type.toLowerCase().includes(query) ||
    ioc.category.toLowerCase().includes(query) ||
    ioc.description.toLowerCase().includes(query)
  ) : [];

  const matchedReports = query ? reports.filter(r => 
    r.id.toLowerCase().includes(query) ||
    r.incidentTitle.toLowerCase().includes(query) ||
    r.generatedBy.toLowerCase().includes(query) ||
    r.executiveSummary.toLowerCase().includes(query) ||
    r.status.toLowerCase().includes(query)
  ) : [];

  const totalMatches = matchedIncidents.length + matchedEvidence.length + matchedPackets.length + matchedIocs.length + matchedReports.length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="bg-[#070a12]/95 border-b border-slate-800/90 px-6 md:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-40 backdrop-blur-md gap-3 shadow-xl">
        {/* 1. BRANDING LAYOUT */}
        <div className="flex items-center space-x-3.5 shrink-0">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="w-11 h-11 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-center cursor-pointer shrink-0 hover:scale-105 transition-all shadow-lg shadow-cyan-950/60"
            title="Return to Command Center"
          >
            <NetTraceLogo variant="icon" size={38} />
          </div>

          <div className="flex flex-col justify-center py-0.5">
            {/* Line 1: Product Name & Version */}
            <div className="flex items-center space-x-2.5 leading-none">
              <span 
                onClick={() => setActiveTab('dashboard')}
                className="font-black text-white text-xl tracking-wider font-mono-code uppercase cursor-pointer hover:text-cyan-200 transition-colors"
              >
                NET<span className="text-cyan-400">TRACE</span>
              </span>
              <Tooltip content="Click to view NetTrace V1.0 Brand Assets Suite & Logo Exports" position="bottom" align="left">
                <button
                  onClick={() => setIsBrandAssetsOpen(true)}
                  className="px-2 py-0.5 text-[10px] font-mono-code bg-cyan-950 text-cyan-300 border border-cyan-700/80 rounded-md font-extrabold tracking-wide hover:bg-cyan-900 transition-colors flex items-center space-x-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  <span>V1.0</span>
                </button>
              </Tooltip>
            </div>

            {/* Line 2: Platform Description */}
            <p className="text-[11px] text-slate-400 font-sans leading-tight mt-1 hidden sm:block">
              Network Forensics & Incident Reconstruction Platform
            </p>

            {/* Line 3: Tagline */}
            <p className="text-[10px] text-cyan-400 font-medium font-sans leading-tight mt-0.5 hidden md:block tracking-wide">
              Trace Every Packet. Reveal Every Attack.
            </p>
          </div>
        </div>

        {/* 2. CENTER GLOBAL SEARCH BAR */}
        <div ref={searchRef} className="flex-1 max-w-sm lg:max-w-md mx-4 hidden lg:flex items-center relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search IOCs, Packets, IP addresses, Incidents..."
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 transition-all font-mono-code shadow-inner"
              aria-label="Global search across network incidents and IOCs"
            />
            {globalSearch && (
              <button 
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 focus:outline-none"
              >
                ×
              </button>
            )}
          </div>

          {/* GLOBAL SEARCH RESULTS DROPDOWN POPOVER */}
          {query.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono-code text-slate-400">
                  Global Search Results ({totalMatches} match{totalMatches !== 1 ? 'es' : ''})
                </span>
                <button 
                  onClick={() => setGlobalSearch('')}
                  className="text-[11px] text-slate-500 hover:text-slate-300 font-mono-code"
                >
                  ESC / Clear
                </button>
              </div>

              {totalMatches === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-sans">
                  No records matching <span className="font-mono-code text-cyan-400">"{globalSearch}"</span> across Incidents, Evidence, Packets, IOCs, or Reports.
                </div>
              ) : (
                <div className="p-2 space-y-3 font-sans text-xs">
                  {/* INCIDENTS */}
                  {matchedIncidents.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-mono-code text-cyan-400 flex items-center space-x-1.5 uppercase font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Incidents ({matchedIncidents.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {matchedIncidents.slice(0, 4).map(inc => (
                          <div
                            key={inc.id}
                            onClick={() => {
                              setSelectedIncidentId(inc.id);
                              setActiveTab('workbench');
                              setGlobalSearch('');
                              showToast(`Loaded Incident ${inc.incidentNumber}`, 'info');
                            }}
                            className="p-2 hover:bg-slate-800/80 rounded-xl cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-slate-700"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono-code font-bold text-cyan-300 text-xs">{inc.incidentNumber}</span>
                                <span className="text-slate-200 font-semibold">{inc.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{inc.summary}</p>
                            </div>
                            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                              {inc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* IOCS */}
                  {matchedIocs.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-mono-code text-purple-400 flex items-center space-x-1.5 uppercase font-bold">
                        <Fingerprint className="w-3.5 h-3.5" />
                        <span>IOC Intelligence ({matchedIocs.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {matchedIocs.slice(0, 4).map(ioc => (
                          <div
                            key={ioc.id}
                            onClick={() => {
                              setActiveTab('ioc');
                              setGlobalSearch('');
                              showToast(`Navigated to IOC: ${ioc.value}`, 'info');
                            }}
                            className="p-2 hover:bg-slate-800/80 rounded-xl cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-slate-700"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-mono-code text-purple-300 font-bold">{ioc.value}</span>
                              <span className="text-slate-400 text-[11px] font-sans">({ioc.type})</span>
                            </div>
                            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300">
                              {ioc.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PACKETS */}
                  {matchedPackets.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-mono-code text-emerald-400 flex items-center space-x-1.5 uppercase font-bold">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>PCAP Packets ({matchedPackets.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {matchedPackets.slice(0, 4).map(pkt => (
                          <div
                            key={pkt.id}
                            onClick={() => {
                              setSelectedPacket(pkt);
                              setActiveTab('pcap');
                              setGlobalSearch('');
                              showToast(`Opened Packet #${pkt.packetNo} (${pkt.protocol})`, 'info');
                            }}
                            className="p-2 hover:bg-slate-800/80 rounded-xl cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-slate-700"
                          >
                            <div className="flex items-center space-x-2 font-mono-code text-xs">
                              <span className="text-emerald-400 font-bold">#{pkt.packetNo}</span>
                              <span className="text-slate-300">{pkt.srcIp} → {pkt.destIp}</span>
                              <span className="text-slate-400 text-[11px]">({pkt.protocol})</span>
                            </div>
                            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                              {pkt.threatRating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EVIDENCE */}
                  {matchedEvidence.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-mono-code text-amber-400 flex items-center space-x-1.5 uppercase font-bold">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Evidence Artifacts ({matchedEvidence.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {matchedEvidence.slice(0, 3).map(ev => (
                          <div
                            key={ev.id}
                            onClick={() => {
                              setActiveTab('evidence');
                              setGlobalSearch('');
                              showToast(`Opened Evidence Locker for ${ev.name}`, 'info');
                            }}
                            className="p-2 hover:bg-slate-800/80 rounded-xl cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-slate-700"
                          >
                            <div>
                              <span className="font-semibold text-slate-200">{ev.name}</span>
                              <p className="text-[10px] font-mono-code text-slate-400 truncate max-w-xs">{ev.hashSha256}</p>
                            </div>
                            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                              {ev.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REPORTS */}
                  {matchedReports.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-mono-code text-blue-400 flex items-center space-x-1.5 uppercase font-bold">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Forensic Reports ({matchedReports.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {matchedReports.slice(0, 3).map(rep => (
                          <div
                            key={rep.id}
                            onClick={() => {
                              setActiveTab('reports');
                              setGlobalSearch('');
                              showToast(`Opened Forensic Report: ${rep.id.toUpperCase()}`, 'info');
                            }}
                            className="p-2 hover:bg-slate-800/80 rounded-xl cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-slate-700"
                          >
                            <div>
                              <span className="font-semibold text-slate-200">{rep.incidentTitle}</span>
                              <p className="text-[10px] text-slate-400">Report ID: {rep.id}</p>
                            </div>
                            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                              {rep.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. RIGHT CONTROLS: LIVE CLOCK, EMERGENCY CONTAINMENT, NEW INCIDENT & PROFILE */}
        <div className="flex items-center space-x-3">
          {/* Real-time System Clock */}
          <div className="hidden md:flex items-center">
            <LiveSystemClock />
          </div>

          {/* Emergency Containment Button */}
          <Tooltip 
            content="Immediately isolates infected target host to prevent attack spread."
            position="bottom"
            align="center"
          >
            <button
              onClick={() => setIsContainmentModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all border border-red-400 animate-pulse font-mono-code focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emergency Containment</span>
            </button>
          </Tooltip>

          {/* New Incident Button */}
          <Tooltip 
            content="Create a new DFIR incident docket for triage."
            position="bottom"
            align="center"
          >
            <button
              onClick={() => {
                onOpenNewIncident();
                setActiveTab('incidents');
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl text-xs font-extrabold font-mono-code shadow-lg shadow-cyan-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Incident</span>
            </button>
          </Tooltip>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative flex items-center border-l border-slate-800/80 pl-3" ref={profileMenuRef}>
            <Tooltip 
              content={`Logged in as ${userProfile.fullName} (${userProfile.role})`}
              position="bottom"
              align="right"
            >
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center space-x-2 p-1 rounded-xl transition-all border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  isProfileMenuOpen 
                    ? 'bg-slate-900 border-cyan-500/60' 
                    : 'bg-transparent border-transparent hover:bg-slate-900/60'
                }`}
              >
                {userProfile.avatarUrl ? (
                  <img 
                    src={userProfile.avatarUrl} 
                    alt={userProfile.fullName} 
                    className="w-8 h-8 rounded-xl object-cover border border-cyan-500/60 shadow-md"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-700/80 flex items-center justify-center text-cyan-300 font-extrabold text-xs font-mono-code shadow-md">
                    {getInitials(userProfile.fullName)}
                  </div>
                )}
                
                <div className="hidden xl:flex flex-col text-left font-mono-code leading-tight">
                  <span className="text-xs font-bold text-slate-100">{userProfile.fullName}</span>
                  <span className="text-[10px] text-slate-400 font-sans">{userProfile.role}</span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>
            </Tooltip>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn font-mono-code space-y-1">
                {/* User Info Card */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    {userProfile.avatarUrl ? (
                      <img 
                        src={userProfile.avatarUrl} 
                        alt={userProfile.fullName} 
                        className="w-9 h-9 rounded-xl object-cover border border-cyan-500/60"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-700/80 flex items-center justify-center text-cyan-300 font-extrabold text-xs">
                        {getInitials(userProfile.fullName)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-100 font-sans truncate">{userProfile.fullName}</p>
                      <p className="text-[10px] text-cyan-400 font-mono-code truncate">{userProfile.role}</p>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5 font-sans">
                    <div className="flex items-center space-x-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{userProfile.email}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{userProfile.organization}</span>
                    </div>
                  </div>
                </div>

                {/* Dropdown Navigation Actions */}
                <div className="pt-1 space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center space-x-2.5 transition-colors font-sans"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center space-x-2.5 transition-colors font-sans"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsHelpModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center space-x-2.5 transition-colors font-sans"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>Help & Documentation</span>
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setIsLogoutModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-red-950/60 text-red-400 flex items-center space-x-2.5 transition-colors font-sans font-bold"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
      />

      {/* Help & Documentation Modal */}
      <HelpDocumentationModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />

      {/* NetTrace V1.0 Brand Assets & Logo Suite Modal */}
      <BrandAssetsModal
        isOpen={isBrandAssetsOpen}
        onClose={() => setIsBrandAssetsOpen(false)}
      />
    </>
  );
};
