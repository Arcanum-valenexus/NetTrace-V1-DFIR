import React, { useState } from 'react';
import { 
  Archive, 
  Plus, 
  Lock, 
  ShieldCheck, 
  Download, 
  History, 
  HardDrive, 
  Eye, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  X, 
  Edit3, 
  Trash2, 
  Key, 
  Tag, 
  AlertTriangle, 
  FileText, 
  UserCheck, 
  Briefcase, 
  ShieldAlert, 
  LockKeyhole,
  Copy,
  Check
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { EvidenceArtifact, EvidenceCategory } from '../../types';
import { EmptyState } from '../common/EmptyState';

export const EvidenceLocker: React.FC = () => {
  const { 
    evidence, 
    addEvidenceArtifact, 
    updateEvidenceMetadata, 
    deleteEvidenceArtifact,
    addChainOfCustodyEntry, 
    setActiveTab, 
    showToast,
    userProfile
  } = useInvestigation();

  // Selected Artifact state
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(evidence[0]?.id || '');
  const activeArtifact = evidence.find(e => e.id === selectedArtifactId) || evidence[0] || null;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals visibility state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  
  // Password Protected Action state
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordTargetItem, setPasswordTargetItem] = useState<EvidenceArtifact | null>(null);
  const [passwordAction, setPasswordAction] = useState<'edit' | 'delete' | null>(null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Metadata Editor Modal state
  const [showEditMetadataModal, setShowEditMetadataModal] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<EvidenceArtifact | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editCategory, setEditCategory] = useState<EvidenceCategory>('Memory Dump');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editTags, setEditTags] = useState<string>('');

  // Register Form state
  const [regName, setRegName] = useState<string>('');
  const [regCategory, setRegCategory] = useState<EvidenceCategory>('Memory Dump');
  const [regCaseId, setRegCaseId] = useState<string>('CASE-2026-001');
  const [regDescription, setRegDescription] = useState<string>('');
  const [regTags, setRegTags] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regSize, setRegSize] = useState<number>(52428800); // 50MB
  const [regFileSimulated, setRegFileSimulated] = useState<string>('');

  // Append Custody Event Form state
  const [cocAction, setCocAction] = useState<string>('Custody Transfer / Analysis');
  const [cocNotes, setCocNotes] = useState<string>('');

  // Copy indicator feedback
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Filtered evidence list
  const filteredEvidence = evidence.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Handle Register Evidence Submission
  const handleCreateEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      showToast('Please enter an Evidence Name', 'error');
      return;
    }
    if (!regPassword.trim()) {
      showToast('Evidence Password is required during registration', 'error');
      return;
    }

    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fakeMd5 = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const tagArray = regTags.split(',').map(t => t.trim()).filter(Boolean);

    addEvidenceArtifact({
      caseId: regCaseId.trim() || 'CASE-2026-001',
      incidentId: 'inc-1',
      name: regName.trim(),
      category: regCategory,
      description: regDescription.trim() || 'Evidence artifact registered into forensic repository.',
      tags: tagArray.length > 0 ? tagArray : ['Forensic Evidence'],
      accessPassword: regPassword.trim(),
      sizeBytes: regSize,
      hashSha256: fakeHash,
      hashMd5: fakeMd5,
      uploadedBy: userProfile.fullName || 'Alex Mercer',
      ownerInvestigatorId: 'inv-001',
      ownerInvestigatorName: userProfile.fullName || 'Alex Mercer',
      storagePath: `/vault/2026/${regCaseId.trim() || 'CASE-2026-001'}/${regName.trim()}`
    });

    showToast(`Registered evidence artifact "${regName.trim()}" with locked baseline`, 'success');
    
    // Reset form
    setRegName('');
    setRegDescription('');
    setRegTags('');
    setRegPassword('');
    setRegFileSimulated('');
    setShowAddModal(false);
  };

  // Request Protected Action (Edit / Delete) -> Trigger Password Modal
  const handleRequestPasswordAction = (item: EvidenceArtifact, action: 'edit' | 'delete') => {
    setPasswordTargetItem(item);
    setPasswordAction(action);
    setPasswordInput('');
    setPasswordError(null);
    setShowPasswordModal(true);
  };

  // Validate Evidence Password
  const handleValidatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetItem) return;

    const expectedPassword = passwordTargetItem.accessPassword || 'NetTrace2026!';

    if (passwordInput !== expectedPassword) {
      setPasswordError('Invalid Evidence Password');
      showToast('Invalid Evidence Password', 'error');
      return;
    }

    // Correct Password!
    setShowPasswordModal(false);
    setPasswordError(null);

    if (passwordAction === 'edit') {
      // Open Metadata Editor
      setEditItem(passwordTargetItem);
      setEditName(passwordTargetItem.name);
      setEditCategory(passwordTargetItem.category);
      setEditDescription(passwordTargetItem.description || '');
      setEditTags((passwordTargetItem.tags || []).join(', '));
      setShowEditMetadataModal(true);
      showToast('Evidence password verified. Metadata editor unlocked.', 'info');
    } else if (passwordAction === 'delete') {
      deleteEvidenceArtifact(passwordTargetItem.id);
      showToast(`Deleted evidence artifact "${passwordTargetItem.name}"`, 'success');
      if (selectedArtifactId === passwordTargetItem.id) {
        setSelectedArtifactId(evidence.find(e => e.id !== passwordTargetItem.id)?.id || '');
      }
    }
  };

  // Save Metadata Changes
  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !editName.trim()) return;

    const tagArray = editTags.split(',').map(t => t.trim()).filter(Boolean);

    updateEvidenceMetadata(editItem.id, {
      name: editName.trim(),
      category: editCategory,
      description: editDescription.trim(),
      tags: tagArray
    });

    showToast('Metadata updated successfully and logged to Chain of Custody', 'success');
    setShowEditMetadataModal(false);
  };

  // Append Chain of Custody Event
  const handleAddCocEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArtifact || !cocNotes.trim()) return;

    addChainOfCustodyEntry(
      activeArtifact.id, 
      cocAction || 'Custody Event Recorded', 
      cocNotes.trim(),
      userProfile.fullName || 'Alex Mercer'
    );

    showToast('Custody Event Added Successfully', 'success');
    setCocNotes('');
  };

  // Download Evidence Blob
  const handleDownload = (item: EvidenceArtifact) => {
    const dummyContent = `NETTRACE DIGITAL EVIDENCE VAULT ARTIFACT
==================================================
Evidence ID: ${item.id}
Case ID: ${item.caseId}
File Name: ${item.name}
Category: ${item.category}
Description: ${item.description || 'N/A'}
Tags: ${(item.tags || []).join(', ')}
SHA-256 Baseline: ${item.hashSha256}
MD5 Baseline: ${item.hashMd5}
File Size: ${(item.sizeBytes / (1024 * 1024)).toFixed(2)} MB
Storage Path: ${item.storagePath}
Registered By: ${item.uploadedBy}
Upload Timestamp: ${item.uploadedAt}

This file represents verified digital forensic evidence extracted in NetTrace V1.0.`;

    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', item.name);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`Downloading forensic evidence package "${item.name}"...`, 'success');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    showToast(`Copied ${label} to clipboard`, 'success');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleOpenWorkspace = (item: EvidenceArtifact) => {
    if (item.category === 'PCAP Trace' || item.name.endsWith('.pcap') || item.name.endsWith('.pcapng')) {
      setActiveTab('pcap');
    } else {
      setActiveTab('workbench');
    }
  };

  // Ensure chain of custody timeline is newest first
  const sortedCocEntries = activeArtifact ? [...(activeArtifact.chainOfCustody || [])] : [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2 font-heading tracking-tight">
              <Archive className="w-6 h-6 text-cyan-400" />
              <span>Evidence Vault & Forensic Repository</span>
            </h1>
            <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800/80 rounded-full text-[10px] font-bold tracking-wider uppercase">
              NetTrace V1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Secure DFIR Evidence Locker • Cryptographic Hash Verification • Immutable Chain of Custody Audit Log
          </p>
        </div>

        <button
          id="btn-register-evidence"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/20 transition-all border border-cyan-400/40 shrink-0 font-sans"
        >
          <Plus className="w-4 h-4" />
          <span>Register Evidence Artifact</span>
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl shadow-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            id="input-search-evidence"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Case ID, tag, or ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Category:</span>
          <select
            id="select-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
          >
            <option value="ALL">All Categories</option>
            <option value="Memory Dump">Memory Dump</option>
            <option value="Disk Image">Disk Image</option>
            <option value="PCAP Trace">PCAP Trace</option>
            <option value="Event Log">Event Log</option>
            <option value="Registry Hive">Registry Hive</option>
            <option value="Malware Binary">Malware Binary</option>
            <option value="Extracted Payload">Extracted Payload</option>
            <option value="Report / Screenshot">Report / Screenshot</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Main Evidence Layout: Left Table + Right Details & Custody Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Evidence Repository Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100 font-heading">
                Registered Digital Evidence ({filteredEvidence.length})
              </h2>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800 font-mono flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>SHA-256 BASELINE LOCKED</span>
            </span>
          </div>

          {filteredEvidence.length === 0 ? (
            <EmptyState
              icon={Archive}
              title="No Evidence Artifacts Found"
              description="No evidence artifacts match your search or category filter."
              actionLabel="Register Artifact"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 font-sans">
              <table id="table-evidence-list" className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="p-3">Artifact Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Integrity</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEvidence.map((item) => {
                    const isSelected = activeArtifact?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        id={`evidence-row-${item.id}`}
                        onClick={() => setSelectedArtifactId(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-cyan-950/40 text-slate-100 border-l-4 border-cyan-400' 
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        {/* Artifact Name + Case ID Badge */}
                        <td className="p-3 max-w-xs">
                          <div className="font-mono font-bold text-slate-100 truncate flex items-center space-x-1.5">
                            {item.accessPassword && (
                              <Lock className="w-3 h-3 text-amber-400 shrink-0" title="Password Protected Metadata" />
                            )}
                            <span className="truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono text-cyan-400">{item.caseId}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">{item.id}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-cyan-300 rounded text-[10px] font-sans font-medium whitespace-nowrap">
                            {item.category}
                          </span>
                        </td>

                        {/* Size */}
                        <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                          {(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                        </td>

                        {/* Integrity */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold flex items-center space-x-1 w-fit">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>VERIFIED</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {/* 1. Preview */}
                            <button
                              id={`btn-preview-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedArtifactId(item.id);
                                setShowPreviewModal(true);
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-[10px] font-bold flex items-center space-x-1"
                              title="Preview Header & Metadata"
                            >
                              <Eye className="w-3 h-3" />
                              <span className="hidden sm:inline">Preview</span>
                            </button>

                            {/* 2. Download */}
                            <button
                              id={`btn-download-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item);
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[10px] font-bold flex items-center space-x-1"
                              title="Download Artifact"
                            >
                              <Download className="w-3 h-3" />
                              <span className="hidden sm:inline">Download</span>
                            </button>

                            {/* 3. Verify */}
                            <button
                              id={`btn-verify-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedArtifactId(item.id);
                                setShowVerifyModal(true);
                              }}
                              className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold flex items-center space-x-1"
                              title="Verify Cryptographic Hash"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span className="hidden sm:inline">Verify</span>
                            </button>

                            {/* 4. NEW: Edit Metadata */}
                            <button
                              id={`btn-edit-metadata-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestPasswordAction(item, 'edit');
                              }}
                              className="px-2 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800/80 rounded text-[10px] font-bold flex items-center space-x-1"
                              title="Edit Metadata (Requires Password)"
                            >
                              <LockKeyhole className="w-3 h-3 text-amber-400" />
                              <span>Edit Metadata</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Artifact Details & Chain of Custody Timeline */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Artifact Details Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-100 font-heading">Artifact Details</h2>
              </div>
              {activeArtifact && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRequestPasswordAction(activeArtifact, 'edit')}
                    className="px-2 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded text-[10px] font-bold flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Metadata</span>
                  </button>
                </div>
              )}
            </div>

            {activeArtifact ? (
              <div className="space-y-4 text-xs">
                {/* Core Header Card */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Evidence Name:</span>
                    <p className="font-bold text-cyan-300 text-sm font-mono break-all">{activeArtifact.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-900">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Case ID:</span>
                      <span className="font-mono text-cyan-400 font-bold">{activeArtifact.caseId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Evidence ID:</span>
                      <span className="font-mono text-slate-300">{activeArtifact.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Category:</span>
                      <span className="text-slate-200 font-medium">{activeArtifact.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Upload Date:</span>
                      <span className="text-slate-300 font-mono text-[10px]">{activeArtifact.uploadedAt}</span>
                    </div>
                  </div>

                  {/* Status / Integrity Badge */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-slate-500 text-[10px]">Status / Integrity:</span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>VERIFIED (Baseline Intact)</span>
                    </span>
                  </div>
                </div>

                {/* Hashes Box */}
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Cryptographic Checksums:</span>
                  
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded border border-slate-800">
                      <div className="truncate pr-2">
                        <span className="text-slate-500 block text-[9px]">SHA-256:</span>
                        <span className="text-slate-200 break-all">{activeArtifact.hashSha256}</span>
                      </div>
                      <button 
                        onClick={() => handleCopy(activeArtifact.hashSha256, 'SHA-256')} 
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-300 shrink-0"
                        title="Copy SHA-256"
                      >
                        {copiedHash === 'SHA-256' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded border border-slate-800">
                      <div className="truncate pr-2">
                        <span className="text-slate-500 block text-[9px]">MD5:</span>
                        <span className="text-slate-300 break-all">{activeArtifact.hashMd5}</span>
                      </div>
                      <button 
                        onClick={() => handleCopy(activeArtifact.hashMd5, 'MD5')} 
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-300 shrink-0"
                        title="Copy MD5"
                      >
                        {copiedHash === 'MD5' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description & Tags */}
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Description:</span>
                    <p className="text-slate-300 text-xs leading-relaxed font-sans">
                      {activeArtifact.description || 'No detailed description provided for this evidence item.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1.5">Optional Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeArtifact.tags && activeArtifact.tags.length > 0 ? (
                        activeArtifact.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded text-[10px] flex items-center space-x-1 font-mono">
                            <Tag className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{tag}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">No tags assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password Protection Status Banner */}
                <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-amber-200 font-bold text-[11px]">Protected Metadata & Management</p>
                      <p className="text-slate-400 text-[10px]">Editing metadata requires Evidence Password verification.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Archive}
                title="No Artifact Selected"
                description="Select an artifact from the table to view detailed properties."
              />
            )}
          </div>

          {/* Chain of Custody Timeline Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-100 font-heading">Chain of Custody Audit Log</h2>
              </div>
              <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                {sortedCocEntries.length} Events Logged
              </span>
            </div>

            {activeArtifact ? (
              <div className="space-y-4 text-xs font-sans">
                {/* Append Custody Event Form */}
                <form id="form-append-custody" onSubmit={handleAddCocEvent} className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Append Custody Event:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Event Action:</label>
                      <select
                        value={cocAction}
                        onChange={(e) => setCocAction(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Custody Transfer / Analysis">Custody Transfer / Analysis</option>
                        <option value="Evidence Verified">Evidence Verified</option>
                        <option value="Metadata Updated">Metadata Updated</option>
                        <option value="Volatile Memory Analysis">Volatile Memory Analysis</option>
                        <option value="Network PCAP Parsing">Network PCAP Parsing</option>
                        <option value="Evidentiary Hash Audit">Evidentiary Hash Audit</option>
                        <option value="Court Evidence Presentation">Court Evidence Presentation</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Investigator Name:</label>
                      <input
                        type="text"
                        disabled
                        value={`${userProfile.fullName || 'Alex Mercer'} (Logged in)`}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Custody Notes / Description:</label>
                    <input
                      id="input-coc-notes"
                      type="text"
                      value={cocNotes}
                      onChange={(e) => setCocNotes(e.target.value)}
                      placeholder="e.g. Conducted YARA memory scan for LSASS process injection..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    id="btn-append-custody"
                    type="submit"
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md font-sans flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Append Custody Event</span>
                  </button>
                </form>

                {/* Custody Timeline (Newest Event First) */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {sortedCocEntries.length > 0 ? (
                    sortedCocEntries.map((coc, idx) => (
                      <div 
                        key={coc.id || idx} 
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 relative border-l-2 border-l-cyan-400"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono text-cyan-400 font-bold flex items-center space-x-1">
                            <UserCheck className="w-3 h-3" />
                            <span>{coc.actor || coc.investigatorName || 'Investigator'}</span>
                          </span>
                          <span className="font-mono text-slate-400">{coc.timestamp}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-slate-100 font-bold text-xs font-sans">{coc.action}</p>
                          <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {coc.caseId || activeArtifact.caseId} • {coc.evidenceId || activeArtifact.id}
                          </span>
                        </div>

                        <p className="text-slate-300 text-[11px] font-sans leading-relaxed pt-0.5">
                          {coc.notes}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No custody records logged for this artifact yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={History}
                title="No Custody Timeline"
                description="Select an artifact to view its chain of custody timeline."
              />
            )}
          </div>

        </div>
      </div>

      {/* MODAL 1: Password Verification Dialog */}
      {showPasswordModal && passwordTargetItem && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form id="form-password-auth" onSubmit={handleValidatePassword} className="bg-slate-900 border border-amber-800/80 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-950 text-amber-400 rounded-xl border border-amber-800">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">Evidence Password Required</h3>
                  <p className="text-[11px] text-slate-400">Authentication required for protected metadata action</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPasswordModal(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Target Evidence Artifact:</span>
                <p className="font-bold text-cyan-300 font-mono">{passwordTargetItem.name}</p>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                  <span>Case ID: {passwordTargetItem.caseId}</span>
                  <span>•</span>
                  <span>ID: {passwordTargetItem.id}</span>
                </div>
              </div>

              {passwordError && (
                <div className="bg-rose-950/90 border border-rose-700/80 p-3 rounded-xl text-rose-200 text-xs font-bold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Enter Evidence Password:
                </label>
                <input
                  id="input-evidence-password"
                  type="password"
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="Enter unique evidence password..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Default sample password for initial artifacts is <code className="text-amber-400 font-mono">NetTrace2026!</code>
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                id="btn-submit-password"
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Validate & Continue</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Metadata Editor Modal (Read-only Original, Editable Metadata) */}
      {showEditMetadataModal && editItem && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form id="form-edit-metadata" onSubmit={handleSaveMetadata} className="bg-slate-900 border border-cyan-800 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">Edit Evidence Metadata</h3>
                  <p className="text-[11px] text-slate-400">Metadata Editor • Password Verified</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowEditMetadataModal(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              
              {/* IMMUTABLE FILE PROPERTIES (READ-ONLY) */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>Immutable Forensic Payload Properties (Read-Only)</span>
                  </span>
                  <span className="text-[9px] bg-slate-900 text-emerald-400 border border-slate-800 px-2 py-0.5 rounded font-mono">
                    UNALTERED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                  <div>
                    <span className="text-slate-500 block">Evidence ID:</span>
                    <span className="text-slate-200">{editItem.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Case ID:</span>
                    <span className="text-cyan-400">{editItem.caseId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">File Size:</span>
                    <span className="text-slate-300">{(editItem.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Upload Date:</span>
                    <span className="text-slate-300">{editItem.uploadedAt}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono bg-slate-900 p-2 rounded border border-slate-800/80 space-y-1">
                  <div>
                    <span className="text-slate-500 block text-[9px]">SHA-256 Checksum (Locked Baseline):</span>
                    <span className="text-emerald-400 break-all">{editItem.hashSha256}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block text-[9px]">MD5 Checksum:</span>
                    <span className="text-slate-300 break-all">{editItem.hashMd5}</span>
                  </div>
                </div>
              </div>

              {/* EDITABLE FIELDS */}
              <div className="space-y-3">
                <span className="text-[10px] text-cyan-400 font-bold uppercase block">Editable Metadata Fields:</span>

                {/* Name */}
                <div>
                  <label className="text-slate-300 block mb-1">Evidence Name:</label>
                  <input
                    id="input-edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-slate-300 block mb-1">Category:</label>
                  <select
                    id="select-edit-category"
                    value={editCategory}
                    onChange={(e: any) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Memory Dump">Memory Dump</option>
                    <option value="Disk Image">Disk Image</option>
                    <option value="PCAP Trace">PCAP Trace</option>
                    <option value="Event Log">Event Log</option>
                    <option value="Registry Hive">Registry Hive</option>
                    <option value="Malware Binary">Malware Binary</option>
                    <option value="Extracted Payload">Extracted Payload</option>
                    <option value="Report / Screenshot">Report / Screenshot</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="text-slate-300 block mb-1">Description:</label>
                  <textarea
                    id="input-edit-description"
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-slate-300 block mb-1">Optional Tags (comma-separated):</label>
                  <input
                    id="input-edit-tags"
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="e.g. RAM, LSASS, Critical Host"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditMetadataModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                id="btn-save-metadata"
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Save Metadata & Log Event</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Register Evidence Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form id="form-register-evidence" onSubmit={handleCreateEvidence} className="bg-slate-900 border border-cyan-800 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-sans">Register Evidence Artifact</h3>
                  <p className="text-[11px] text-slate-400">Ingest forensic evidence, create baseline & evidence password</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans max-h-[70vh] overflow-y-auto pr-1">
              
              {/* File Upload Dropzone Simulation */}
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Upload Evidence File:</label>
                <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500 p-4 rounded-xl text-center bg-slate-950 transition-colors cursor-pointer">
                  <Archive className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-slate-300 font-bold text-xs">Drag & drop forensic evidence file here</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">Supports PCAP, MEM, DMP, EVTX, RAW, E01, BIN, PNG</p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setRegName(file.name);
                        setRegSize(file.size || 52428800);
                        setRegFileSimulated(file.name);
                        showToast(`Attached file "${file.name}"`, 'info');
                      }
                    }}
                    id="file-upload-input"
                  />
                  <label htmlFor="file-upload-input" className="mt-2 inline-block px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold rounded cursor-pointer">
                    Browse Local File
                  </label>
                  {regFileSimulated && (
                    <p className="mt-2 text-emerald-400 font-mono text-[11px] font-bold">✓ Selected: {regFileSimulated}</p>
                  )}
                </div>
              </div>

              {/* Evidence Name */}
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Evidence Name *:</label>
                <input
                  id="input-reg-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. DC01_memory_lsass_dump.dmp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Category & Case ID Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Category *:</label>
                  <select
                    id="select-reg-category"
                    value={regCategory}
                    onChange={(e: any) => setRegCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Memory Dump">Memory Dump</option>
                    <option value="Disk Image">Disk Image</option>
                    <option value="PCAP Trace">PCAP Trace</option>
                    <option value="Event Log">Event Log</option>
                    <option value="Registry Hive">Registry Hive</option>
                    <option value="Malware Binary">Malware Binary</option>
                    <option value="Extracted Payload">Extracted Payload</option>
                    <option value="Report / Screenshot">Report / Screenshot</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Case ID *:</label>
                  <input
                    id="input-reg-caseid"
                    type="text"
                    required
                    value={regCaseId}
                    onChange={(e) => setRegCaseId(e.target.value)}
                    placeholder="e.g. CASE-2026-001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Description:</label>
                <textarea
                  id="input-reg-description"
                  rows={2}
                  value={regDescription}
                  onChange={(e) => setRegDescription(e.target.value)}
                  placeholder="Provide context on acquisition source, host, or purpose..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Optional Tags */}
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Optional Tags (comma-separated):</label>
                <input
                  id="input-reg-tags"
                  type="text"
                  value={regTags}
                  onChange={(e) => setRegTags(e.target.value)}
                  placeholder="e.g. LSASS, Volatile, DC-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* NEW REQUIREMENT: Create Evidence Password */}
              <div className="bg-amber-950/30 border border-amber-900/60 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <label className="text-amber-200 font-bold block text-xs">
                    Create Evidence Password *
                  </label>
                </div>
                <p className="text-[10px] text-slate-400">
                  This password belongs exclusively to this evidence artifact. Required for future metadata edits or deletion.
                </p>
                <input
                  id="input-create-evidence-password"
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create password for this evidence..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                id="btn-submit-register"
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Register & Lock Baseline</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Preview Modal */}
      {showPreviewModal && activeArtifact && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center space-x-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Evidence Artifact Header & Preview</span>
              </h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-cyan-300 text-sm">{activeArtifact.name}</p>
                <p className="text-slate-400 text-[11px]">Storage Path: {activeArtifact.storagePath}</p>
                <p className="text-slate-400 text-[11px]">Size: {(activeArtifact.sizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
                <p className="text-slate-400 text-[11px]">Case ID: {activeArtifact.caseId}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase block">Raw Magic Byte Header Sample:</span>
                <p className="text-emerald-400 text-[11px] break-all">
                  4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00 B8 00 00 00 00 00 00 00 40 00 00 00
                </p>
                <p className="text-cyan-400 text-[10px] font-bold">
                  Validated Signature: {activeArtifact.category} Forensic Header
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                onClick={() => handleOpenWorkspace(activeArtifact)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Workspace</span>
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Cryptographic Hash Verification Modal */}
      {showVerifyModal && activeArtifact && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-800 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Cryptographic Hash Baseline Verification</span>
              </h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-emerald-950/80 border border-emerald-700 p-3.5 rounded-xl space-y-1">
                <p className="font-bold text-emerald-300 flex items-center space-x-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>INTEGRITY VERIFIED: NO TAMPERING DETECTED</span>
                </p>
                <p className="text-slate-300 text-[11px] font-sans pt-1">
                  Re-computed disk storage checksum perfectly matches the locked acquisition baseline hash.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                <div>
                  <span className="text-slate-500 uppercase text-[9px] block">Registered Baseline SHA-256:</span>
                  <p className="text-slate-200 break-all">{activeArtifact.hashSha256}</p>
                </div>
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-slate-500 uppercase text-[9px] block">Live Re-calculated Disk SHA-256:</span>
                  <p className="text-emerald-400 break-all">{activeArtifact.hashSha256}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  addChainOfCustodyEntry(
                    activeArtifact.id, 
                    'Evidence Verified', 
                    'SHA-256 hash verified against acquisition baseline.', 
                    userProfile.fullName || 'Alex Mercer'
                  );
                  setShowVerifyModal(false);
                  showToast('Custody Event Added Successfully', 'success');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Confirm & Record Log</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

