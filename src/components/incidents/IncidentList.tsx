import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Filter, 
  Plus, 
  Search, 
  ArrowUpRight, 
  Clock, 
  User, 
  Tag, 
  CheckCircle,
  AlertTriangle,
  Flame,
  ChevronRight
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { SeverityLevel, IncidentStatus } from '../../types';

export const IncidentList: React.FC<{ onOpenNewIncident: () => void }> = ({ onOpenNewIncident }) => {
  const { 
    incidents, 
    setSelectedIncidentId, 
    setActiveTab, 
    updateIncidentStatus,
    updateIncidentSeverity,
    globalSearch
  } = useInvestigation();

  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredIncidents = incidents.filter(inc => {
    const matchesSeverity = severityFilter === 'All' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'All' || inc.status === statusFilter;
    const searchLower = globalSearch.toLowerCase();
    const matchesSearch = !globalSearch || 
      inc.title.toLowerCase().includes(searchLower) ||
      inc.incidentNumber.toLowerCase().includes(searchLower) ||
      inc.category.toLowerCase().includes(searchLower) ||
      inc.summary.toLowerCase().includes(searchLower);

    return matchesSeverity && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & New Incident Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono-code flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <span>Incidents Queue & Triage Desk</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage active security incidents, assign analysts, track kill chains, and launch deep forensics
          </p>
        </div>

        <button
          onClick={onOpenNewIncident}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono-code font-bold flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition-all shrink-0 border border-cyan-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Investigation Case</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-md font-mono-code text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-semibold">Queue Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Severity Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-500 px-2">Severity:</span>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  severityFilter === sev
                    ? 'bg-cyan-900/80 text-cyan-300 border border-cyan-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-500 px-2">Status:</span>
            {['All', 'Open', 'Investigating', 'Contained', 'Closed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-800 text-slate-100 border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIncidents.map((inc) => (
          <div
            key={inc.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition-all relative group"
          >
            {/* Top Row: Severity & Incident ID */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code font-bold text-cyan-400">
                  {inc.incidentNumber}
                </span>

                <div className="flex items-center space-x-2">
                  <select
                    value={inc.severity}
                    onChange={(e) => updateIncidentSeverity(inc.id, e.target.value as SeverityLevel)}
                    className={`px-2 py-0.5 text-[10px] font-mono-code font-bold rounded border focus:outline-none cursor-pointer ${
                      inc.severity === 'Critical' ? 'bg-red-950 text-red-400 border-red-800' :
                      inc.severity === 'High' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                      'bg-blue-950 text-blue-400 border-blue-800'
                    }`}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <select
                    value={inc.status}
                    onChange={(e) => updateIncidentStatus(inc.id, e.target.value as IncidentStatus)}
                    className="px-2 py-0.5 text-[10px] font-mono-code bg-slate-950 text-slate-300 border border-slate-700 rounded focus:outline-none cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Contained">Contained</option>
                    <option value="Mitigated">Mitigated</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Title & Summary */}
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono-code line-clamp-2 group-hover:text-cyan-300 transition-colors">
                  {inc.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3">
                  {inc.summary}
                </p>
              </div>

              {/* Category & Incident Stage Badge */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5 font-mono-code text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Category:</span>
                  <span className="text-cyan-300 font-semibold">{inc.category}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Stage:</span>
                  <span className="text-amber-400 font-semibold">{inc.currentStage}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Metadata & Launch Button */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400">
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>{inc.assignedAnalyst}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{inc.createdAt.substring(0, 10)}</span>
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedIncidentId(inc.id);
                  setActiveTab('workbench');
                }}
                className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 rounded-xl text-xs font-mono-code font-bold text-cyan-300 flex items-center justify-center space-x-2 transition-all shadow-md"
              >
                <span>OPEN INVESTIGATION WORKBENCH</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
