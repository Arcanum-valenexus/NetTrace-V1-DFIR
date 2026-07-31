import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  X, 
  Zap, 
  Clock, 
  Loader2,
  ChevronRight,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { AssetSelector } from './AssetSelector';
import { Tooltip } from './Tooltip';

interface ContainmentStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed';
  progress: number;
}

export const ContainmentModal: React.FC = () => {
  const { 
    isContainmentModalOpen, 
    setIsContainmentModalOpen, 
    selectedIncident,
    isolateAsset,
    updateIncidentStatus,
    addTimelineEvent,
    addAnalystNote,
    showToast
  } = useInvestigation();

  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [actions, setActions] = useState({
    isolateHost: true,
    blockC2: true,
    disableSession: true,
    preserveEvidence: true,
    notifyTeam: true
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [workflowState, setWorkflowState] = useState<'config' | 'confirm' | 'executing' | 'success'>('config');

  const initialSteps: ContainmentStep[] = [
    { id: '1', label: 'Preparing Containment Environment...', status: 'pending', progress: 0 },
    { id: '2', label: 'Isolating Host NIC (Network Cut)...', status: 'pending', progress: 0 },
    { id: '3', label: 'Blocking C2 IP Gateway Rules...', status: 'pending', progress: 0 },
    { id: '4', label: 'Revoking Sessions & AD Kerberos Tokens...', status: 'pending', progress: 0 },
    { id: '5', label: 'Preserving RAM & Disk Evidence...', status: 'pending', progress: 0 },
    { id: '6', label: 'Updating Timeline & Incident Docket...', status: 'pending', progress: 0 },
    { id: '7', label: 'Completed Containment Protocol', status: 'pending', progress: 0 }
  ];

  const [executionSteps, setExecutionSteps] = useState<ContainmentStep[]>(initialSteps);

  useEffect(() => {
    if (selectedIncident?.impactedAssets[0]?.id) {
      setSelectedAssetId(selectedIncident.impactedAssets[0].id);
    }
    setWorkflowState('config');
    setValidationError(null);
  }, [selectedIncident, isContainmentModalOpen]);

  if (!isContainmentModalOpen) return null;

  const handleValidateAndProceed = () => {
    setValidationError(null);
    if (!selectedAssetId) {
      setValidationError('Please select a target host asset to execute containment.');
      return;
    }

    const hasAnyAction = Object.values(actions).some(v => v);
    if (!hasAnyAction) {
      setValidationError('Please select at least one containment action to execute.');
      return;
    }

    // Proceed to confirmation step
    setWorkflowState('confirm');
  };

  const handleExecuteContainment = () => {
    setWorkflowState('executing');
    setExecutionSteps(initialSteps);

    let currentStepIdx = 0;

    const interval = setInterval(() => {
      if (currentStepIdx >= initialSteps.length) {
        clearInterval(interval);

        setExecutionSteps(initialSteps.map(s => ({ ...s, status: 'completed' as const, progress: 100 })));

        if (selectedIncident) {
          if (selectedAssetId) isolateAsset(selectedIncident.id, selectedAssetId);
          updateIncidentStatus(selectedIncident.id, 'Contained');
          
          const nowUtc = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

          addTimelineEvent(selectedIncident.id, {
            timestamp: nowUtc,
            source: 'EDR Firewall API',
            eventType: 'Emergency Host Containment Executed',
            description: `Emergency containment executed for asset ID ${selectedAssetId}. Network interfaces isolated, C2 server blocked, sessions revoked, evidence preserved.`,
            severity: 'Critical'
          });

          addAnalystNote(
            selectedIncident.id, 
            `EMERGENCY PLAYBOOK EXECUTION: Containment sequence completed successfully at ${nowUtc}. Host network interfaces isolated.`
          );
        }

        showToast('Emergency containment completed successfully.', 'success');
        setWorkflowState('success');
        return;
      }

      const stepIdxToRun = currentStepIdx;
      setExecutionSteps(initialSteps.map((step, idx) => {
        if (idx < stepIdxToRun) {
          return { ...step, status: 'completed' as const, progress: 100 };
        }
        if (idx === stepIdxToRun) {
          return { ...step, status: 'running' as const, progress: 100 };
        }
        return { ...step, status: 'pending' as const, progress: 0 };
      }));

      currentStepIdx++;
    }, 600);
  };

  const handleClose = () => {
    setWorkflowState('config');
    setValidationError(null);
    setExecutionSteps(initialSteps);
    setIsContainmentModalOpen(false);
  };

  const currentAsset = selectedIncident?.impactedAssets.find(a => a.id === selectedAssetId) || selectedIncident?.impactedAssets[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn font-mono-code">
      <div className="bg-slate-900 border border-red-800/90 rounded-2xl max-w-2xl w-full p-6 shadow-2xl shadow-red-950/80 space-y-5 relative">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-700 flex items-center justify-center text-red-400 shadow-lg shadow-red-900/50 shrink-0">
            <Zap className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider font-sans">
                Emergency Containment Workflow
              </h3>
              <span className="px-2 py-0.5 text-[10px] bg-red-950 text-red-400 border border-red-800 rounded font-bold">
                DEFCON 1
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Guided Incident Response Playbook — Sever attacker C2 channels and isolate host asset.
            </p>
          </div>
        </div>

        {/* STEP 1: CONFIGURATION FORM */}
        {workflowState === 'config' && (
          <div className="space-y-4">
            {validationError && (
              <div className="p-3 bg-red-950/90 border border-red-700 rounded-xl text-red-200 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Case Details Summary Box */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center justify-between">
                <span>Case & Threat Context</span>
                <span>ID: {selectedIncident?.incidentNumber || 'INC-2026-8842'}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Severity</span>
                  <span className="text-red-400 font-bold">{selectedIncident?.severity || 'Critical'}</span>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Category</span>
                  <span className="text-amber-400 font-bold">{selectedIncident?.category || 'Ransomware'}</span>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Assigned Analyst</span>
                  <span className="text-cyan-300 font-bold truncate block">{selectedIncident?.assignedAnalyst || 'Alex Mercer'}</span>
                </div>
              </div>

              {/* Asset Selector */}
              <div className="pt-2">
                <AssetSelector
                  assets={selectedIncident?.impactedAssets || []}
                  selectedAssetId={selectedAssetId}
                  onSelectAsset={(id) => {
                    setSelectedAssetId(id);
                    setValidationError(null);
                  }}
                />
              </div>
            </div>

            {/* Containment Actions Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Select Containment Actions:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <label className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={actions.isolateHost}
                    onChange={(e) => {
                      setActions({ ...actions, isolateHost: e.target.checked });
                      setValidationError(null);
                    }}
                    className="w-4 h-4 accent-red-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-200 block">Isolate Host NIC</span>
                    <span className="text-[10px] text-slate-400">Sever network adapters via EDR</span>
                  </div>
                </label>

                <label className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={actions.blockC2}
                    onChange={(e) => {
                      setActions({ ...actions, blockC2: e.target.checked });
                      setValidationError(null);
                    }}
                    className="w-4 h-4 accent-red-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-200 block">Block C2 IP Gateway</span>
                    <span className="text-[10px] text-slate-400">Publish firewall block rules</span>
                  </div>
                </label>

                <label className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={actions.disableSession}
                    onChange={(e) => {
                      setActions({ ...actions, disableSession: e.target.checked });
                      setValidationError(null);
                    }}
                    className="w-4 h-4 accent-red-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-200 block">Revoke Active Directory Sessions</span>
                    <span className="text-[10px] text-slate-400">Invalidate Kerberos & MFA</span>
                  </div>
                </label>

                <label className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={actions.preserveEvidence}
                    onChange={(e) => {
                      setActions({ ...actions, preserveEvidence: e.target.checked });
                      setValidationError(null);
                    }}
                    className="w-4 h-4 accent-red-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-200 block">Preserve Evidence</span>
                    <span className="text-[10px] text-slate-400">Snapshot RAM memory dump</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all focus:outline-none"
              >
                Cancel
              </button>

              <button
                onClick={handleValidateAndProceed}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-red-600/30 transition-all border border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <span>Proceed to Confirmation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIRMATION DIALOG */}
        {workflowState === 'confirm' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-red-950/60 border border-red-700 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-red-300 font-bold text-xs">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span className="uppercase tracking-wider">Confirmation Required</span>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                Are you sure you want to execute emergency containment on target asset <strong className="text-white font-mono-code">{currentAsset?.hostname || 'DC-01'}</strong> ({currentAsset?.ipAddress || '10.0.1.5'})?
              </p>
              <p className="text-[11px] text-red-300 font-sans">
                Executing this workflow will immediately cut network interfaces, sever active user sessions, and publish gateway firewall blocks.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-bold block border-b border-slate-800 pb-1">
                Containment Actions Staged for Execution:
              </span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {actions.isolateHost && <li className="flex items-center space-x-2 text-emerald-400"><span>✓ Isolate Host Network Interface</span></li>}
                {actions.blockC2 && <li className="flex items-center space-x-2 text-emerald-400"><span>✓ Block C2 Perimeter Gateway Addresses</span></li>}
                {actions.disableSession && <li className="flex items-center space-x-2 text-emerald-400"><span>✓ Revoke Active Kerberos & MFA Tokens</span></li>}
                {actions.preserveEvidence && <li className="flex items-center space-x-2 text-emerald-400"><span>✓ Preserve Memory Dump in Evidence Vault</span></li>}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setWorkflowState('config')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all focus:outline-none"
              >
                Back to Config
              </button>

              <button
                onClick={handleExecuteContainment}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-red-600/30 transition-all border border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm & Execute Containment</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SEQUENTIAL PROGRESS ANIMATION */}
        {workflowState === 'executing' && (
          <div className="space-y-4 py-2">
            <div className="text-center space-y-2">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
              <h4 className="text-base font-bold text-slate-100 uppercase tracking-wider font-sans">
                Executing Containment Playbook...
              </h4>
              <p className="text-xs text-slate-400 font-sans">
                Communicating with EDR agent, Active Directory API & Perimeter Gateway
              </p>
            </div>

            <div className="space-y-2.5 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              {executionSteps.map((step) => (
                <div key={step.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-bold ${step.status === 'completed' ? 'text-emerald-300' : step.status === 'running' ? 'text-cyan-300' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                    <span className={step.status === 'completed' ? 'text-emerald-400 font-bold' : step.status === 'running' ? 'text-cyan-400 font-bold' : 'text-slate-600'}>
                      {step.status === 'completed' ? '✓ Done' : step.status === 'running' ? 'Running...' : 'Pending'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/80">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        step.status === 'completed' ? 'bg-emerald-500' : step.status === 'running' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-800'
                      }`}
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: WORKFLOW COMPLETED SUCCESSFULLY */}
        {workflowState === 'success' && (
          <div className="bg-emerald-950/80 border border-emerald-700 p-6 rounded-2xl text-center space-y-4 animate-fadeIn font-sans">
            <div className="w-16 h-16 rounded-full bg-emerald-900 border border-emerald-500 flex items-center justify-center text-emerald-300 mx-auto shadow-xl shadow-emerald-950/50">
              <CheckCircle2 className="w-10 h-10 animate-bounce text-emerald-400" />
            </div>

            <h4 className="text-lg font-bold text-emerald-300 uppercase tracking-wider font-mono-code">
              Emergency Containment Completed
            </h4>

            <p className="text-xs text-slate-200 max-w-md mx-auto leading-relaxed">
              Target host <strong className="text-white font-mono-code">{currentAsset?.hostname || 'DC-01'}</strong> network interfaces isolated. C2 firewall rules published. Active user sessions revoked and timeline updated.
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl max-w-md mx-auto text-left text-xs space-y-1 font-mono-code">
              <p className="text-emerald-400 font-bold">✓ Case Docket Status Updated to Contained</p>
              <p className="text-cyan-400 font-bold">✓ Timeline Event Appended Automatically</p>
              <p className="text-slate-400 text-[11px]">Audit log entry created in Analyst Notes.</p>
            </div>

            <button
              onClick={handleClose}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all font-mono-code"
            >
              Return to Command Station
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
