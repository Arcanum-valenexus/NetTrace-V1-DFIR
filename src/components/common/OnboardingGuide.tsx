import React, { useState } from 'react';
import { Sparkles, Plus, Network, Workflow, FileText, CheckCircle, X, ChevronRight } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';

export const OnboardingGuide: React.FC<{ onOpenNewIncident: () => void }> = ({ onOpenNewIncident }) => {
  const { setActiveTab, beginnerMode, toggleBeginnerMode } = useInvestigation();
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (!beginnerMode || dismissed) return null;

  const steps = [
    {
      id: 'step-1',
      title: '1. Create Investigation',
      desc: 'Open a new case docket with incident metadata & severity rating.',
      actionLabel: 'Create Case',
      icon: Plus,
      onClick: onOpenNewIncident
    },
    {
      id: 'step-2',
      title: '2. Upload PCAP',
      desc: 'Ingest raw network packet captures for automated PyShark inspection.',
      actionLabel: 'Upload PCAP',
      icon: Network,
      onClick: () => setActiveTab('pcap')
    },
    {
      id: 'step-3',
      title: '3. Analyze Packets',
      desc: 'Inspect TCP/HTTP stream payloads, flags, and suspicious C2 signals.',
      actionLabel: 'View Packets',
      icon: Sparkles,
      onClick: () => setActiveTab('pcap')
    },
    {
      id: 'step-4',
      title: '4. Review Timeline',
      desc: 'Track the attack lifecycle from Initial Access to Ransomware execution.',
      actionLabel: 'View Timeline',
      icon: Workflow,
      onClick: () => setActiveTab('workbench')
    },
    {
      id: 'step-5',
      title: '5. Generate Report',
      desc: 'Export executive-ready DFIR report complete with IOC hashes & signatures.',
      actionLabel: 'Generate DFIR Report',
      icon: FileText,
      onClick: () => setActiveTab('reports')
    }
  ];

  return (
    <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90 border border-cyan-700/60 p-5 rounded-2xl shadow-xl relative space-y-4">
      {/* Top Banner Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-900 border border-cyan-600 flex items-center justify-center text-cyan-300">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm font-mono-code flex items-center space-x-2">
              <span>Welcome to NetTrace Onboarding Guide</span>
              <span className="px-2 py-0.5 text-[10px] bg-cyan-900 text-cyan-200 border border-cyan-700 rounded-full font-bold">
                Beginner Mode Active
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Follow these 5 simple steps to conduct your first network incident investigation:
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleBeginnerMode}
            className="text-[11px] font-mono-code text-slate-400 hover:text-cyan-300 underline"
          >
            Disable Beginner Mode
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 Guided Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div 
              key={s.id}
              className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-2 hover:border-cyan-500/60 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code font-bold text-cyan-300">{s.title}</span>
                  <Icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  {s.desc}
                </p>
              </div>

              <button
                onClick={s.onClick}
                className="w-full mt-2 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-700/60 rounded-lg text-[11px] font-mono-code font-bold flex items-center justify-center space-x-1 transition-all"
              >
                <span>{s.actionLabel}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
