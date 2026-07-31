import React, { useState } from 'react';
import { ShieldAlert, X, Plus, Sparkles } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { SeverityLevel, IncidentCategory, KillChainStage } from '../../types';

export const NewIncidentModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { addNewIncident, setActiveTab } = useInvestigation();

  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<IncidentCategory>('Ransomware');
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [assignedAnalyst, setAssignedAnalyst] = useState<string>('Alex Mercer');
  const [summary, setSummary] = useState<string>('');
  const [attackVector, setAttackVector] = useState<string>('Phishing Email -> Powershell Exec');
  const [currentStage, setCurrentStage] = useState<KillChainStage>('Execution');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return;

    addNewIncident({
      title,
      category,
      severity,
      assignedAnalyst,
      summary,
      attackVector,
      currentStage,
      status: 'Open'
    });

    onClose();
    setActiveTab('workbench');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono-code">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Create New Investigation Case
            </h3>
            <p className="text-xs text-slate-400">
              Initialize a new incident docket for DFIR triage and PCAP correlation
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 block font-semibold mb-1">Incident Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cobalt Strike C2 Beaconing on HR Workstation"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block font-semibold mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              >
                <option value="Ransomware">Ransomware</option>
                <option value="Data Exfiltration">Data Exfiltration</option>
                <option value="C2 Infrastructure">C2 Infrastructure</option>
                <option value="Phishing / Initial Access">Phishing / Initial Access</option>
                <option value="Lateral Movement">Lateral Movement</option>
                <option value="Privilege Escalation">Privilege Escalation</option>
                <option value="Malware Outbreak">Malware Outbreak</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block font-semibold mb-1">Severity:</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block font-semibold mb-1">Assigned Lead Analyst:</label>
              <input
                type="text"
                value={assignedAnalyst}
                onChange={(e) => setAssignedAnalyst(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 block font-semibold mb-1">Incident Stage:</label>
              <select
                value={currentStage}
                onChange={(e) => setCurrentStage(e.target.value as KillChainStage)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              >
                <option value="Initial Access">Initial Access</option>
                <option value="Execution">Execution</option>
                <option value="Persistence">Persistence</option>
                <option value="Privilege Escalation">Privilege Escalation</option>
                <option value="Command and Control">Command and Control</option>
                <option value="Exfiltration">Exfiltration</option>
                <option value="Impact">Impact</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 block font-semibold mb-1">Inferred Attack Vector:</label>
            <input
              type="text"
              value={attackVector}
              onChange={(e) => setAttackVector(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 block font-semibold mb-1">Executive Summary / Alert Trigger:</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe initial alert findings, host indicators, and impacted scope..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-cyan-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Initialize Case Docket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
