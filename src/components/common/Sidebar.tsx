import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Workflow, 
  Network, 
  Fingerprint, 
  Archive, 
  FileCheck2, 
  Sliders, 
  User
} from 'lucide-react';
import { useInvestigation, ActiveTab } from '../../context/InvestigationContext';
import { Tooltip } from './Tooltip';
import { NetTraceLogo } from './NetTraceLogo';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, incidents } = useInvestigation();

  const openIncidentsCount = incidents.filter(i => i.status === 'Open' || i.status === 'Investigating').length;

  const navItems: { 
    id: ActiveTab; 
    label: string; 
    icon: React.FC<{ className?: string }>; 
    badge?: number;
    tooltip: string;
  }[] = [
    { 
      id: 'dashboard', 
      label: 'Command Center', 
      icon: LayoutDashboard,
      tooltip: 'Overview of security operations, threat trends, and active cases.'
    },
    { 
      id: 'incidents', 
      label: 'Investigation Cases', 
      icon: ShieldAlert, 
      badge: openIncidentsCount,
      tooltip: 'Triage and manage cybersecurity incident dockets.'
    },
    { 
      id: 'workbench', 
      label: 'Incident Workbench', 
      icon: Workflow,
      tooltip: 'Deep forensic workspace for timeline correlation & host isolation.'
    },
    { 
      id: 'pcap', 
      label: 'Packet Analyzer', 
      icon: Network,
      tooltip: 'Inspect uploaded network traffic frame-by-frame (DPI PCAP).'
    },
    { 
      id: 'ioc', 
      label: 'IOC Detection', 
      icon: Fingerprint,
      tooltip: 'Extract Indicators of Compromise (IPs, hashes, domain names).'
    },
    { 
      id: 'evidence', 
      label: 'Evidence Vault', 
      icon: Archive,
      tooltip: 'Secure storage for forensic evidence with SHA-256 verification.'
    },
    { 
      id: 'reports', 
      label: 'Forensic Reports', 
      icon: FileCheck2,
      tooltip: 'Generate standardized DFIR investigation reports.'
    },
    { 
      id: 'profile', 
      label: 'User Profile', 
      icon: User,
      tooltip: 'Manage investigator credentials and team permissions.'
    },
    { 
      id: 'settings', 
      label: 'Platform Settings', 
      icon: Sliders,
      tooltip: 'Configure platform preferences, theme, and notifications.'
    },
  ];

  return (
    <aside className="w-64 bg-[#080c16] border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex font-sans selection:bg-cyan-500 selection:text-black">
      {/* Navigation Menu */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono-code font-bold text-slate-500 uppercase tracking-wider">
          NetTrace Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Tooltip key={item.id} content={item.tooltip} position="right" className="w-full">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono-code font-bold transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  isActive 
                    ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-700/60 shadow-md shadow-cyan-950/40 translate-x-0.5' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono-code ${
                    isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* System Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#050810] text-[11px] font-mono-code text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <NetTraceLogo variant="icon" size={18} />
            <span className="font-bold text-slate-300">NetTrace V1.0</span>
          </div>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
