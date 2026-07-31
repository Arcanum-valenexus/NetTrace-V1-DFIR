import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Search, 
  HelpCircle, 
  Terminal, 
  ShieldAlert, 
  Network, 
  Fingerprint, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Zap
} from 'lucide-react';

interface HelpDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDocumentationModal: React.FC<HelpDocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeTopic, setActiveTopic] = useState<'quickstart' | 'pcap' | 'containment' | 'ioc' | 'shortcuts'>('quickstart');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl relative font-mono-code overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/80 flex items-center justify-center text-cyan-400 shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100 font-sans">
                  Help & Documentation Center
                </h2>
                <span className="px-2 py-0.5 text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-bold">
                  DFIR Knowledge Base
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Enterprise Incident Response Playbooks, PCAP Wire Inspection & NetTrace V1.0 Manual
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation, playbooks, keyboard shortcuts, or protocols..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Content Body: Sidebar Topics + Topic Details */}
        <div className="flex-1 flex overflow-hidden">
          {/* Topics Sidebar */}
          <div className="w-64 bg-slate-950 border-r border-slate-800 p-3 space-y-1.5 overflow-y-auto text-xs">
            {[
              { id: 'quickstart', label: '1. Platform Quickstart', icon: Network },
              { id: 'pcap', label: '2. PCAP Packet Inspection', icon: Terminal },
              { id: 'containment', label: '3. Emergency Containment', icon: Zap },
              { id: 'ioc', label: '4. IOC Detection', icon: Fingerprint },
              { id: 'shortcuts', label: '5. Keyboard Shortcuts', icon: FileText }
            ].map((topic) => {
              const Icon = topic.icon;
              const isActive = activeTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id as any)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                    isActive 
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-bold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{topic.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              );
            })}
          </div>

          {/* Topic Detail View */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300 font-sans">
            {activeTopic === 'quickstart' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <span>Platform Overview & Architecture</span>
                </h3>
                <p className="leading-relaxed">
                  NetTrace V1.0 is a full-spectrum Digital Forensics and Incident Response (DFIR) platform designed to trace malicious network activity, reconstruct multi-stage cyber attacks, and execute automated host containment.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-code pt-2">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-cyan-400 block mb-1">Incident Workbench</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Track incident response stages, correlate timeline events, and manage analyst investigation notes.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-purple-400 block mb-1">DPI PCAP Inspector</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Inspect raw packet streams, decode Hex/ASCII payloads, and extract embedded malware binaries.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTopic === 'pcap' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Deep Packet Inspection (DPI) & Payload Decoding</span>
                </h3>
                <p className="leading-relaxed">
                  The PCAP Packet Analyzer processes full packet captures (`.pcap`, `.pcapng`) to uncover malicious command-and-control (C2) beacons, unencrypted credentials, and exfiltrated payloads.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>Use <strong>Wireshark Display Filters</strong> (e.g., <code>ip.addr == 185.220.101.5</code> or <code>tcp.port == 443</code>).</li>
                  <li>Click any frame row to inspect raw Hex and ASCII stream bytes.</li>
                  <li>Extract embedded files directly into the Digital Evidence Locker with SHA-256 validation.</li>
                </ul>
              </div>
            )}

            {activeTopic === 'containment' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <Zap className="w-4 h-4 text-red-400" />
                  <span>Emergency Host Containment Playbook</span>
                </h3>
                <p className="leading-relaxed">
                  In the event of an active ransomware outbreak or unauthorized domain controller access, click <strong>Emergency Containment</strong> in the top header bar.
                </p>
                <div className="bg-red-950/40 border border-red-800/80 p-3 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-red-300 block">Containment Automation Sequence:</span>
                  <ol className="list-decimal pl-5 space-y-1 text-red-200">
                    <li>Select target host asset (e.g. <code>DC-01.corp.internal</code>).</li>
                    <li>Validate containment actions (Host NIC Isolation, C2 IP Blocking, AD Session Revocation).</li>
                    <li>Review confirmation alert before execution.</li>
                    <li>Monitor real-time progress sequence and automatic timeline update.</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTopic === 'ioc' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <Fingerprint className="w-4 h-4 text-purple-400" />
                  <span>IOC Detection Engine & Regex Parsing</span>
                </h3>
                <p className="leading-relaxed">
                  The IOC Detection Engine allows analysts to parse raw EVTX log files, extract IPv4 addresses, SHA-256 file hashes, and C2 domain names using high-performance regex engines.
                </p>
              </div>
            )}

            {activeTopic === 'shortcuts' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Command Center Keyboard Shortcuts</span>
                </h3>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono-code text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Global Search</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300">Ctrl + K</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">New Incident Docket</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300">Ctrl + N</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Trigger Emergency Containment</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-red-300">Ctrl + Shift + E</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Switch to DPI PCAP Inspector</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300">Ctrl + 4</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
