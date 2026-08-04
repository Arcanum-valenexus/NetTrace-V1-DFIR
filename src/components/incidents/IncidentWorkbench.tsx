import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  CheckSquare, 
  Terminal, 
  Plus, 
  Server, 
  FileText, 
  Lock, 
  Activity, 
  Layers, 
  AlertTriangle,
  ChevronRight,
  Send,
  Zap,
  CheckCircle2,
  ListTodo,
  Network,
  Fingerprint,
  Archive,
  FileCheck2,
  Info,
  ExternalLink
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { EmptyState } from '../common/EmptyState';

type WorkbenchTab = 'overview' | 'timeline' | 'evidence' | 'packets' | 'iocs' | 'notes' | 'report';

export const IncidentWorkbench: React.FC = () => {
  const { 
    selectedIncident, 
    addTimelineEvent, 
    addAnalystNote, 
    toggleChecklistTask, 
    isolateAsset,
    generateReportForIncident,
    setActiveTab,
    setIsContainmentModalOpen,
    pcapSession,
    iocs,
    evidence,
    reports,
    showToast
  } = useInvestigation();

  const [activeSubTab, setActiveSubTab] = useState<WorkbenchTab>('overview');

  // Form states for adding timeline event
  const [showAddEvent, setShowAddEvent] = useState<boolean>(false);
  const [eventSource, setEventSource] = useState<'PCAP Analysis' | 'EDR Log' | 'Active Directory' | 'Firewall' | 'Analyst Note'>('EDR Log');
  const [eventType, setEventType] = useState<string>('');
  const [eventDesc, setEventDesc] = useState<string>('');
  const [eventRawLog, setEventRawLog] = useState<string>('');

  // Form state for adding note
  const [newNoteText, setNewNoteText] = useState<string>('');

  if (!selectedIncident) {
    return (
      <div className="p-8 text-center text-slate-400 font-sans max-w-xl mx-auto my-12">
        <EmptyState
          icon={ShieldAlert}
          title="No Incident Selected"
          description="Please choose an incident case from the Incident Queue to launch the DFIR Workbench."
          actionLabel="View Incident Queue"
          onAction={() => setActiveTab('incidents')}
        />
      </div>
    );
  }

  const handleAddTimelineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventType || !eventDesc) return;

    addTimelineEvent(selectedIncident.id, {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      source: eventSource,
      eventType,
      description: eventDesc,
      severity: 'High',
      rawLog: eventRawLog || undefined
    });

    showToast(`Appended timeline event: ${eventType}`, 'success');
    setEventType('');
    setEventDesc('');
    setEventRawLog('');
    setShowAddEvent(false);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addAnalystNote(selectedIncident.id, newNoteText);
    showToast('Analyst investigation note recorded', 'success');
    setNewNoteText('');
  };

  const handleGenerateReport = () => {
    generateReportForIncident(selectedIncident.id);
    showToast('Forensic Report generated for this incident case', 'success');
    setActiveTab('reports');
  };

  // Filter correlated packets, IOCs, and evidence for this incident
  const incidentPackets = pcapSession.packets.filter(p => 
    selectedIncident.impactedAssets.some(a => a.ipAddress === p.srcIp || a.ipAddress === p.destIp)
  );
  
  const incidentIocs = iocs.slice(0, 4);
  const incidentEvidence = evidence.filter(e => e.incidentId === selectedIncident.id);
  const incidentReport = reports.find(r => r.incidentId === selectedIncident.id);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Workbench Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 md:p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-3 py-1 rounded-lg border border-cyan-800">
                {selectedIncident.incidentNumber}
              </span>
              <span className={`px-2.5 py-1 text-xs font-bold font-sans rounded ${
                selectedIncident.severity === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                selectedIncident.severity === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-blue-950 text-blue-400 border border-blue-800'
              }`}>
                {selectedIncident.severity} Severity
              </span>
              <span className="px-2.5 py-1 text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded font-sans">
                Status: {selectedIncident.status}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-slate-100 mt-2 font-heading">
              {selectedIncident.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              {selectedIncident.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-sans">
            <button
              onClick={() => setIsContainmentModalOpen(true)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-red-600/30 transition-all border border-red-400 font-sans"
            >
              <Zap className="w-4 h-4 animate-pulse" />
              <span>Isolate Host</span>
            </button>

            <button
              onClick={handleGenerateReport}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/30 transition-all border border-cyan-400 font-sans"
            >
              <FileText className="w-4 h-4" />
              <span>Generate DFIR Report</span>
            </button>
          </div>
        </div>

        {/* 7 Core Workbench Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs border-b border-slate-800 font-sans font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'timeline', label: `Timeline (${selectedIncident.timeline.length})`, icon: Clock },
            { id: 'evidence', label: `Evidence (${incidentEvidence.length})`, icon: Archive },
            { id: 'packets', label: `Packets (${incidentPackets.length})`, icon: Network },
            { id: 'iocs', label: `IOCs (${incidentIocs.length})`, icon: Fingerprint },
            { id: 'notes', label: `Notes (${selectedIncident.notes.length})`, icon: ListTodo },
            { id: 'report', label: 'Report', icon: FileCheck2 },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as WorkbenchTab)}
                className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all whitespace-nowrap font-sans ${
                  isActive 
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-medium'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Details & Impacted Assets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Case Metadata & Attack Vector</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[11px]">Inferred Attack Vector:</span>
                  <span className="text-cyan-300 font-bold">{selectedIncident.attackVector}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[11px]">Lead Assigned Analyst:</span>
                  <span className="text-slate-200 font-bold">{selectedIncident.assignedAnalyst}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[11px]">Case Created Timestamp:</span>
                  <span className="text-slate-300">{selectedIncident.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Impacted Host Assets */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Impacted Assets & Containment Controls</span>
              </h2>

              <div className="space-y-2">
                {selectedIncident.impactedAssets.map((asset) => (
                  <div 
                    key={asset.id} 
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-100">{asset.hostname}</p>
                      <p className="text-[10px] text-slate-400">{asset.ipAddress} • {asset.os}</p>
                    </div>

                    <button
                      onClick={() => isolateAsset(selectedIncident.id, asset.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                        asset.status === 'Isolated' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                          : 'bg-red-950 text-red-400 border border-red-800 hover:bg-red-900'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{asset.status === 'Isolated' ? 'Host Isolated' : 'Isolate Host'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIMELINE */}
      {activeSubTab === 'timeline' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Forensic Chronological Attack Timeline</span>
              </h2>
              <p className="text-xs text-slate-400">Complete sequence of events from alert trigger to case containment</p>
            </div>

            <button
              onClick={() => setShowAddEvent(!showAddEvent)}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Log Manual Event</span>
            </button>
          </div>

          {/* Add Event Form */}
          {showAddEvent && (
            <form onSubmit={handleAddTimelineSubmit} className="bg-slate-950 border border-cyan-800 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-cyan-300 uppercase">Log New Forensic Timeline Artifact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Log Source</label>
                  <select
                    value={eventSource}
                    onChange={(e: any) => setEventSource(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="PCAP Analysis">PCAP Analysis</option>
                    <option value="EDR Log">EDR Log</option>
                    <option value="Active Directory">Active Directory</option>
                    <option value="Firewall">Firewall</option>
                    <option value="Analyst Note">Analyst Note</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Event Type / Headline</label>
                  <input
                    type="text"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    placeholder="e.g. LSASS Memory Dump Initiated"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Detailed Description</label>
                <textarea
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  rows={2}
                  placeholder="Explain event details and evidence findings..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Save Event
                </button>
              </div>
            </form>
          )}

          {/* Timeline List */}
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800 pt-2">
            {selectedIncident.timeline.map((evt) => (
              <div key={evt.id} className="relative pl-8 space-y-1">
                <div className={`absolute left-2 top-1.5 w-3 h-3 rounded-full border-2 bg-slate-900 ${
                  evt.severity === 'Critical' ? 'border-red-500 bg-red-500/20' : 'border-cyan-500 bg-cyan-500/20'
                }`} />
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-bold text-slate-100">{evt.eventType}</span>
                  <span className="px-2 py-0.5 bg-slate-950 text-slate-400 rounded text-[10px] border border-slate-800">{evt.source}</span>
                  <span className="text-[10px] text-slate-500">{evt.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300">{evt.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE */}
      {activeSubTab === 'evidence' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Archive className="w-4 h-4 text-emerald-400" />
              <span>Correlated Digital Evidence Artifacts</span>
            </h2>
            <button
              onClick={() => setActiveTab('evidence')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-bold"
            >
              <span>Open Full Evidence Vault</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {incidentEvidence.map(item => (
              <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-emerald-300">{item.name}</p>
                  <p className="text-[10px] text-slate-400">SHA-256: {item.hashSha256.slice(0, 32)}...</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold">
                  VERIFIED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PACKETS */}
      {activeSubTab === 'packets' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Correlated PCAP Traffic Packets</span>
            </h2>
            <button
              onClick={() => setActiveTab('pcap')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-bold"
            >
              <span>Launch Full Wireshark PCAP Engine</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Frame</th>
                  <th className="p-3">Source IP</th>
                  <th className="p-3">Destination IP</th>
                  <th className="p-3">Protocol</th>
                  <th className="p-3">Threat Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {incidentPackets.slice(0, 6).map(pkt => (
                  <tr key={pkt.packetNo} className="hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-cyan-400">#{pkt.packetNo}</td>
                    <td className="p-3 text-slate-200">{pkt.srcIp}:{pkt.srcPort}</td>
                    <td className="p-3 text-slate-200">{pkt.destIp}:{pkt.destPort}</td>
                    <td className="p-3 text-slate-300">{pkt.protocol}</td>
                    <td className="p-3">
                      {pkt.threatRating ? (
                        <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded text-[10px] font-bold">
                          {pkt.threatRating}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: IOCS */}
      {activeSubTab === 'iocs' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Fingerprint className="w-4 h-4 text-purple-400" />
              <span>Extracted Indicators of Compromise (IOCs)</span>
            </h2>
            <button
              onClick={() => setActiveTab('ioc')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1 font-bold"
            >
              <span>View IOC Detection Engine</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incidentIocs.map(ioc => (
              <div key={ioc.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 text-xs truncate">{ioc.value}</span>
                  <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded text-[10px] font-bold">
                    Score: {ioc.threatScore}/100
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{ioc.category} • {ioc.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: NOTES & PLAYBOOK */}
      {activeSubTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analyst Notes */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Investigator Log Notes</span>
            </h2>

            <form onSubmit={handleAddNoteSubmit} className="space-y-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write investigator notes or observations..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Note</span>
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedIncident.notes.map(note => (
                <div key={note.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>{note.author}</span>
                    <span>{note.timestamp}</span>
                  </div>
                  <p className="text-slate-300">{note.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DFIR Response Playbook Checklist */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>NIST SP 800-61 Incident Response Checklist</span>
            </h2>

            <div className="space-y-2">
              {selectedIncident.containmentChecklist.map(task => (
                <div 
                  key={task.id}
                  onClick={() => toggleChecklistTask(selectedIncident.id, task.id)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all text-xs ${
                    task.completed 
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 line-through' 
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                    task.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                  }`}>
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span>{task.task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: REPORT */}
      {activeSubTab === 'report' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span>DFIR Forensics Technical Report Preview</span>
            </h2>

            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Full Export & PDF Studio</span>
            </button>
          </div>

          {incidentReport ? (
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-300">{incidentReport.incidentTitle}</span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold text-[10px]">
                  {incidentReport.status}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{incidentReport.executiveSummary}</p>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="Report Not Yet Compiled"
              description="Compile a comprehensive DFIR technical report for this active case."
              actionLabel="Compile Report Now"
              onAction={handleGenerateReport}
            />
          )}
        </div>
      )}
    </div>
  );
};
