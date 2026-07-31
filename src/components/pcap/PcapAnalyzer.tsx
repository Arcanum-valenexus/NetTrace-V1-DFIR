import React, { useState, useRef, useEffect } from 'react';
import { 
  Network, 
  Upload, 
  Search, 
  Filter, 
  FileCode, 
  AlertTriangle, 
  Download, 
  Terminal, 
  CheckCircle2, 
  Flame, 
  ChevronRight,
  ShieldAlert,
  ArrowDownUp,
  ChevronDown,
  Printer,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileCheck2,
  HardDrive,
  Clock,
  Fingerprint
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { PacketHexViewer } from './PacketHexViewer';
import { Packet } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { Tooltip } from '../common/Tooltip';
import { JargonBadge } from '../common/JargonBadge';

// Helper function to trigger browser file downloads
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const PcapAnalyzer: React.FC = () => {
  const { 
    pcapSession, 
    selectedPacket, 
    setSelectedPacket, 
    pcapFilter, 
    setPcapFilter,
    uploadCustomPcap,
    addEvidenceArtifact,
    showToast,
    iocs,
    reports,
    evidence
  } = useInvestigation();

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [extractedFileSaved, setExtractedFileSaved] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadCustomPcap(file.name, 32);
      showToast(`Uploaded PCAP file "${file.name}" successfully`, 'success');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      uploadCustomPcap(file.name, 32);
      showToast(`Uploaded PCAP file "${file.name}" successfully`, 'success');
    }
  };

  const handleSaveToEvidence = (file: typeof pcapSession.extractedFiles[0]) => {
    addEvidenceArtifact({
      incidentId: 'inc-1',
      name: file.filename,
      category: 'Malware Binary',
      sizeBytes: file.sizeBytes,
      hashSha256: file.sha256,
      hashMd5: file.md5,
      uploadedBy: 'DFIR Automated Inspector',
      storagePath: `/extracted/${file.filename}`
    });
    setExtractedFileSaved(file.filename);
    showToast(`Saved reconstructed payload "${file.filename}" to Evidence Locker`, 'success');
    setTimeout(() => setExtractedFileSaved(null), 3000);
  };

  // Filter packets by IP, Port, Protocol, DNS, HTTP Host, TCP Flags, Keyword Search
  const filteredPackets = pcapSession.packets.filter(pkt => {
    if (!pcapFilter) return true;
    const f = pcapFilter.toLowerCase().trim();

    const srcIp = pkt.srcIp.toLowerCase();
    const destIp = pkt.destIp.toLowerCase();
    const srcPort = pkt.srcPort.toString();
    const destPort = pkt.destPort.toString();
    const protocol = pkt.protocol.toLowerCase();
    const info = pkt.info.toLowerCase();
    const verdict = (pkt.threatRating || '').toLowerCase();
    const flags = (pkt.flags || []).join(' ').toLowerCase();
    const dns = (pkt.dnsQuery || '').toLowerCase();
    const httpUrl = (pkt.httpUrl || '').toLowerCase();

    return (
      srcIp.includes(f) ||
      destIp.includes(f) ||
      srcPort === f ||
      destPort === f ||
      protocol.includes(f) ||
      info.includes(f) ||
      verdict.includes(f) ||
      flags.includes(f) ||
      dns.includes(f) ||
      httpUrl.includes(f)
    );
  });

  // Export Option Handlers
  const handleExportPdf = () => {
    setExportMenuOpen(false);
    try {
      const pdfContent = `
================================================================================
NetTrace V1.0 - DFIR PACKET DEEP INSPECTION FORENSIC REPORT
================================================================================
Filename: ${pcapSession.filename}
File Size: ${(pcapSession.fileSizeBytes / 1024).toFixed(1)} KB
Total Packets: ${pcapSession.totalPackets}
Duration: ${pcapSession.durationSeconds}s
Generated At: ${new Date().toISOString()}

1. TOP PROTOCOL DISTRIBUTION
${pcapSession.topProtocols.map(p => ` - ${p.name}: ${p.count} frames (${p.percentage}%)`).join('\n')}

2. ANOMALY DETECTIONS
${pcapSession.suspiciousDetections.map(s => ` - [${s.severity}] ${s.title}: ${s.description}`).join('\n')}

3. CAPTURED PACKET SUMMARY LIST
${pcapSession.packets.map(p => `Frame #${p.packetNo} | ${p.timestamp} | ${p.srcIp}:${p.srcPort} -> ${p.destIp}:${p.destPort} | ${p.protocol} | ${p.length}B | Verdict: ${p.threatRating || 'Clean'} | Info: ${p.info}`).join('\n')}
      `.trim();

      downloadFile(pdfContent, `pcap_forensic_report_${pcapSession.filename}.pdf`, 'application/pdf');
      showToast('PDF exported successfully', 'success');
    } catch (err) {
      showToast('Failed to export PDF report', 'error');
    }
  };

  const handlePrint = () => {
    setExportMenuOpen(false);
    try {
      window.print();
      showToast('Print dialog opened', 'success');
    } catch (err) {
      showToast('Failed to trigger print dialog', 'error');
    }
  };

  const handleExportCsv = () => {
    setExportMenuOpen(false);
    try {
      const headers = ['Frame Number', 'Timestamp', 'Source IP', 'Source Port', 'Destination IP', 'Destination Port', 'Protocol', 'Length (Bytes)', 'TCP Flags', 'Threat Verdict', 'Info'];
      const rows = filteredPackets.map(p => [
        p.packetNo,
        `"${p.timestamp}"`,
        `"${p.srcIp}"`,
        p.srcPort,
        `"${p.destIp}"`,
        p.destPort,
        `"${p.protocol}"`,
        p.length,
        `"${p.flags?.join(' ') || ''}"`,
        `"${p.threatRating || 'Clean'}"`,
        `"${p.info.replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      downloadFile(csvContent, `pcap_packets_${pcapSession.filename}.csv`, 'text/csv');
      showToast('CSV exported successfully', 'success');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  const handleExportJson = () => {
    setExportMenuOpen(false);
    try {
      const jsonContent = JSON.stringify(pcapSession, null, 2);
      downloadFile(jsonContent, `pcap_analysis_${pcapSession.filename}.json`, 'application/json');
      showToast('JSON exported successfully', 'success');
    } catch (err) {
      showToast('Failed to export JSON', 'error');
    }
  };

  const handleExportMarkdown = () => {
    setExportMenuOpen(false);
    try {
      const mdContent = `# NetTrace V1.0 PCAP Analysis Report

## Trace Overview
- **Filename:** \`${pcapSession.filename}\`
- **File Size:** ${(pcapSession.fileSizeBytes / 1024).toFixed(1)} KB
- **Total Packets:** ${pcapSession.totalPackets}
- **Capture Duration:** ${pcapSession.durationSeconds} seconds

## Protocol Distribution
${pcapSession.topProtocols.map(p => `- **${p.name}:** ${p.count} frames (${p.percentage}%)`).join('\n')}

## Threat Anomaly Signatures
${pcapSession.suspiciousDetections.map(s => `### [${s.severity}] ${s.title}\n${s.description}\n`).join('\n')}

## Packet List Table
| Frame # | Timestamp | Source Endpoint | Destination Endpoint | Protocol | Length | TCP Flags | Verdict |
|---|---|---|---|---|---|---|---|
${filteredPackets.map(p => `| #${p.packetNo} | ${p.timestamp} | ${p.srcIp}:${p.srcPort} | ${p.destIp}:${p.destPort} | ${p.protocol} | ${p.length}B | ${p.flags?.join(' ') || '-'} | ${p.threatRating || 'Clean'} |`).join('\n')}
`;

      downloadFile(mdContent, `pcap_analysis_${pcapSession.filename}.md`, 'text/markdown');
      showToast('Markdown exported successfully', 'success');
    } catch (err) {
      showToast('Failed to export Markdown', 'error');
    }
  };

  const handleExportPcapSummary = () => {
    setExportMenuOpen(false);
    try {
      const summaryText = `NetTrace V1.0 PCAP Summary
----------------------------------------
Filename: ${pcapSession.filename}
Uploaded At: ${pcapSession.uploadedAt}
Size: ${(pcapSession.fileSizeBytes / 1024).toFixed(1)} KB
Packet Count: ${pcapSession.totalPackets}
Duration: ${pcapSession.durationSeconds}s

Top Protocols:
${pcapSession.topProtocols.map(p => ` - ${p.name}: ${p.count} (${p.percentage}%)`).join('\n')}

Anomalies Detected:
${pcapSession.suspiciousDetections.map(d => ` - ${d.title} (${d.severity}): ${d.description}`).join('\n')}

Extracted Files:
${pcapSession.extractedFiles.map(f => ` - ${f.filename} (${f.sizeBytes} B) - SHA256: ${f.sha256}`).join('\n')}
`;
      downloadFile(summaryText, `pcap_summary_${pcapSession.filename}.txt`, 'text/plain');
      showToast('PCAP Summary exported successfully', 'success');
    } catch (err) {
      showToast('Failed to export PCAP summary', 'error');
    }
  };

  const handleExportIocList = () => {
    setExportMenuOpen(false);
    try {
      const iocRows = iocs.map(i => `"${i.type}","${i.value}","${i.threatScore}","${i.status}","${i.category}","${i.description.replace(/"/g, '""')}"`);
      const csvContent = ['Type,Value,Threat Score,Status,Category,Description', ...iocRows].join('\n');
      downloadFile(csvContent, `detected_iocs.csv`, 'text/csv');
      showToast('IOC List exported successfully', 'success');
    } catch (err) {
      showToast('Failed to export IOC list', 'error');
    }
  };

  const handleExportTimeline = () => {
    setExportMenuOpen(false);
    try {
      const timelineRows = filteredPackets.map(p => `"${p.timestamp}","Packet #${p.packetNo} Captured","${p.srcIp}:${p.srcPort} -> ${p.destIp}:${p.destPort} (${p.protocol})","${p.threatRating || 'Clean'}","${p.info.replace(/"/g, '""')}"`);
      const csvContent = ['Timestamp,Event Title,Endpoints,Verdict,Details', ...timelineRows].join('\n');
      downloadFile(csvContent, `investigation_timeline.csv`, 'text/csv');
      showToast('Timeline exported successfully', 'success');
    } catch (err) {
      showToast('Failed to export Timeline', 'error');
    }
  };

  const handleExportEvidenceMetadata = () => {
    setExportMenuOpen(false);
    try {
      const metadata = JSON.stringify(evidence, null, 2);
      downloadFile(metadata, `evidence_metadata.json`, 'application/json');
      showToast('Evidence Metadata exported successfully', 'success');
    } catch (err) {
      showToast('Failed to export Evidence Metadata', 'error');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2 font-heading">
              <Network className="w-6 h-6 text-cyan-400" />
              <span>Network Packet Analyzer & DPI Inspector</span>
            </h1>
            <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full text-xs font-mono font-bold">
              Wireshark DPI Engine
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1 font-sans">
            Wireshark-grade Deep Packet Inspection (DPI), raw Hex/ASCII bytes viewer, and TCP stream reconstructor.{' '}
            Learn more about <JargonBadge term="PCAP" /> captures and <JargonBadge term="Protocol" /> signatures.
          </p>
        </div>

        {/* Right Actions: Export ▼ Dropdown Menu & Upload Dropzone */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Unified Export Dropdown Menu */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setExportMenuOpen(prev => !prev)}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shadow-cyan-600/20 border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer font-sans"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Export</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${exportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options */}
            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 divide-y divide-slate-800/80 animate-fadeIn font-sans text-xs">
                <div className="py-1">
                  <button
                    onClick={handleExportPdf}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-red-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Export PDF Report</span>
                      <span className="text-[10px] text-slate-400">Download formatted forensic PDF</span>
                    </div>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Print Report</span>
                      <span className="text-[10px] text-slate-400">Open browser print dialog</span>
                    </div>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleExportCsv}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Export CSV</span>
                      <span className="text-[10px] text-slate-400">Comma-separated packet table</span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <FileJson className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Export JSON</span>
                      <span className="text-[10px] text-slate-400">Full PCAP session object</span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportMarkdown}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Export Markdown</span>
                      <span className="text-[10px] text-slate-400">Markdown report document (.md)</span>
                    </div>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleExportPcapSummary}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <Network className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Export PCAP Summary</span>
                      <span className="text-[10px] text-slate-400">Parsed capture metrics summary</span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportIocList}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Export IOC List</span>
                      <span className="text-[10px] text-slate-400">Detected indicators of compromise</span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportTimeline}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Export Timeline</span>
                      <span className="text-[10px] text-slate-400">Investigation event timeline</span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportEvidenceMetadata}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Export Evidence Metadata</span>
                      <span className="text-[10px] text-slate-400">Hashes, sizes & custody records</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload PCAP Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`p-2.5 rounded-xl border-2 border-dashed transition-all flex items-center space-x-3 ${
              dragActive ? 'border-cyan-400 bg-cyan-950/60' : 'border-slate-700 bg-slate-950/60'
            }`}
          >
            <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-200 font-sans">
                Drag PCAP Trace
              </p>
              <p className="text-[10px] text-slate-500 font-mono">.pcap, .pcapng</p>
            </div>

            <label className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-all border border-slate-700">
              Browse
              <input type="file" onChange={handleFileUpload} accept=".pcap,.pcapng,.cap" className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 2. PCAP Overview Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow-lg">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Loaded Trace File:</span>
          <p className="text-xs font-bold text-cyan-300 font-mono truncate">{pcapSession.filename}</p>
          <p className="text-[10px] text-slate-400 font-mono">
            {(pcapSession.fileSizeBytes / 1024).toFixed(1)} KB • {pcapSession.totalPackets} Packets
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 shadow-lg">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Protocol Distribution:</span>
          <div className="flex flex-wrap gap-1 text-xs font-mono">
            {pcapSession.topProtocols.map((p, idx) => (
              <span key={`${p.name}-${idx}`} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-300">
                {p.name} ({p.percentage}%)
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow-lg">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Suspicious Alerts:</span>
          <p className="text-xs font-bold text-red-400 flex items-center space-x-1 font-mono">
            <ShieldAlert className="w-4 h-4" />
            <span>{pcapSession.suspiciousDetections.length} Anomaly Signatures</span>
          </p>
          <p className="text-[10px] text-slate-400 truncate font-sans">
            {pcapSession.suspiciousDetections[0]?.title || 'No active anomalies'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow-lg">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Payloads Extracted:</span>
          <p className="text-xs font-bold text-amber-400 flex items-center space-x-1 font-mono">
            <FileCode className="w-4 h-4" />
            <span>{pcapSession.extractedFiles.length} Binary Files</span>
          </p>
          <div className="flex items-center space-x-1 pt-1">
            {pcapSession.extractedFiles.map((f, idx) => (
              <Tooltip key={`${f.filename}-${idx}`} content="Save reconstructed binary to Evidence Vault with SHA-256 hash.">
                <button
                  onClick={() => handleSaveToEvidence(f)}
                  className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[10px] hover:bg-amber-900 transition-colors font-mono cursor-pointer"
                >
                  + Evidence
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {extractedFileSaved && (
        <div className="bg-emerald-950 border border-emerald-700 p-3 rounded-xl text-xs text-emerald-300 font-bold flex items-center space-x-2 animate-fadeIn font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Saved payload file "{extractedFileSaved}" directly into the Digital Evidence Locker!</span>
        </div>
      )}

      {/* 3. Packet Search & Filter Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-heading flex items-center space-x-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Packet Filter & Deep Inspection Table</span>
            </h2>
            <p className="text-xs text-slate-400">Filter by Source IP, Destination IP, Port, Protocol, DNS, HTTP Host, TCP Flags, or Keyword.</p>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={pcapFilter}
              onChange={(e) => setPcapFilter(e.target.value)}
              placeholder="Search IP, Port, Protocol, Flags (SYN, ACK), DNS..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 w-full sm:w-80 shadow-inner"
            />
            {pcapFilter && (
              <button 
                onClick={() => setPcapFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 text-[11px] font-sans">Filter Presets:</span>
          <button
            onClick={() => setPcapFilter('')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
              !pcapFilter ? 'bg-cyan-950 text-cyan-300 border-cyan-800 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            All Packets ({pcapSession.packets.length})
          </button>
          <button
            onClick={() => setPcapFilter('TCP')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
              pcapFilter === 'TCP' ? 'bg-cyan-950 text-cyan-300 border-cyan-800 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            TCP
          </button>
          <button
            onClick={() => setPcapFilter('HTTP')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
              pcapFilter === 'HTTP' ? 'bg-cyan-950 text-cyan-300 border-cyan-800 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            HTTP / Web
          </button>
          <button
            onClick={() => setPcapFilter('DNS')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
              pcapFilter === 'DNS' ? 'bg-cyan-950 text-cyan-300 border-cyan-800 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            DNS Queries
          </button>
          <button
            onClick={() => setPcapFilter('SYN')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
              pcapFilter === 'SYN' ? 'bg-cyan-950 text-cyan-300 border-cyan-800 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            SYN Handshakes
          </button>
          <button
            onClick={() => setPcapFilter('Malicious')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
              pcapFilter === 'Malicious' ? 'bg-red-950 text-red-300 border-red-800 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Threat Anomalies
          </button>
        </div>

        {/* 4. Wireshark-Style Packet List Table */}
        {filteredPackets.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No Packets Match Filter"
            description={`No network frames found matching query "${pcapFilter}".`}
            actionLabel="Clear Filter"
            onAction={() => setPcapFilter('')}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-inner">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <tr>
                  <th className="p-3">Frame #</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Source IP</th>
                  <th className="p-3">Src Port</th>
                  <th className="p-3">Destination IP</th>
                  <th className="p-3">Dst Port</th>
                  <th className="p-3">Protocol</th>
                  <th className="p-3">Length</th>
                  <th className="p-3">TCP Flags</th>
                  <th className="p-3">Status / Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPackets.map((pkt, idx) => {
                  const isSelected = selectedPacket?.packetNo === pkt.packetNo || selectedPacket?.id === pkt.id;
                  const flagsStr = pkt.flags?.length ? pkt.flags.join(' ') : 'ACK';
                  
                  return (
                    <tr
                      key={`pkt-row-${pkt.packetNo || pkt.id}-${idx}`}
                      onClick={() => setSelectedPacket(pkt)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-950/90 text-cyan-200 font-bold border-l-4 border-cyan-400'
                          : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <td className="p-3 font-bold text-cyan-400">#{pkt.packetNo || pkt.id}</td>
                      <td className="p-3 text-slate-400 text-[11px]">{pkt.timestamp}</td>
                      <td className="p-3 text-slate-200">{pkt.srcIp}</td>
                      <td className="p-3 text-slate-400">{pkt.srcPort}</td>
                      <td className="p-3 text-slate-200">{pkt.destIp}</td>
                      <td className="p-3 text-slate-400">{pkt.destPort}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-300 font-bold">
                          {pkt.protocol}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{pkt.length} B</td>
                      <td className="p-3 font-mono text-[11px] text-amber-300">{flagsStr}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                          pkt.threatRating === 'Malicious' ? 'bg-red-950 text-red-400 border-red-800' :
                          pkt.threatRating === 'Suspicious' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                          'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}>
                          {pkt.threatRating || 'Clean'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Detailed Wireshark Packet Inspection (Collapsible Tree + Hex Viewer) */}
      {selectedPacket && (
        <PacketHexViewer 
          packet={selectedPacket} 
          onClose={() => setSelectedPacket(null)} 
        />
      )}
    </div>
  );
};
