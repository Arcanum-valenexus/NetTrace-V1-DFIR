import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  Incident, 
  PcapSession, 
  IOC, 
  EvidenceArtifact, 
  ChainOfCustodyEntry,
  ForensicsReport,
  ForensicsReportHistoryEntry, 
  ThreatActor, 
  IncidentStatus, 
  SeverityLevel,
  TimelineEvent,
  Packet,
  AppFlowStage,
  UserProfile,
  ActiveTab,
  NetTraceModuleKey,
  NetTraceModuleStatus,
  ModuleStatusInfo,
  NetTraceModuleStatuses,
  PlatformPreferences,
  NotificationTypeKey,
  NotificationChannelPreference,
  NotificationPreferencesMap
} from '../types';

import { authApi } from '../api/authApi';
import { casesApi, CaseRecord, CaseCreatePayload, CaseUpdatePayload } from '../api/casesApi';
import { incidentsApi } from '../api/incidentsApi';
import { evidenceApi, EvidenceArtifactRecord } from '../api/evidenceApi';
import { pcapApi, PcapSessionRecord, PacketRecord } from '../api/pcapApi';
import { iocApi, IOCRecord } from '../api/iocApi';
import { reportsApi, ForensicsReportRecord } from '../api/reportsApi';
import { setAuthTokens, clearAuthTokens, getAccessToken, getRefreshToken, apiClient } from '../api/apiClient';

export type { ActiveTab } from '../types';
export type AppTheme = 'cyber-dark' | 'light' | 'high-contrast' | 'system';

interface InvestigationContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedIncidentId: string;
  setSelectedIncidentId: (id: string) => void;
  
  incidents: Incident[];
  cases: CaseRecord[];
  fetchCases: () => Promise<void>;
  createCase: (payload: CaseCreatePayload) => Promise<CaseRecord>;
  updateCase: (caseId: string, payload: CaseUpdatePayload) => Promise<CaseRecord>;
  deleteCase: (caseId: string) => Promise<void>;
  casesLoading: boolean;
  casesError: string | null;
  pcapSession: PcapSession;
  uploadRealPcapFile: (file: File) => Promise<void>;
  fetchSessionPackets: (sessionId: string) => Promise<void>;
  iocs: IOC[];
  evidence: EvidenceArtifact[];
  reports: ForensicsReport[];
  threatActors: ThreatActor[];

  // Dynamic Module Statuses
  moduleStatuses: NetTraceModuleStatuses;
  isAllModulesCompleted: boolean;
  completedModulesCount: number;
  totalModulesCount: number;
  
  // App Flow & Auth State
  appFlowStage: AppFlowStage;
  setAppFlowStage: (stage: AppFlowStage) => void;
  isAuthenticated: boolean;
  loginUser: (email: string, password?: string) => Promise<any>;
  logoutUser: () => Promise<void>;
  registerUser: (fullName: string, email: string, password?: string) => Promise<any>;

  // Beginner Mode & Onboarding
  beginnerMode: boolean;
  toggleBeginnerMode: () => void;

  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (fields: Partial<UserProfile>) => void;

  // Platform Preferences & Cache
  platformPreferences: PlatformPreferences;
  updatePlatformPreferences: (fields: Partial<PlatformPreferences>) => void;
  resetPlatformPreferences: () => void;
  clearTemporaryCache: () => void;

  // Incident actions
  selectedIncident: Incident | undefined;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  updateIncidentSeverity: (id: string, severity: SeverityLevel) => void;
  addTimelineEvent: (incidentId: string, event: Omit<TimelineEvent, 'id' | 'incidentId'>) => void;
  addAnalystNote: (incidentId: string, noteContent: string) => void;
  toggleChecklistTask: (incidentId: string, taskId: string) => void;
  isolateAsset: (incidentId: string, assetId: string) => void;
  addNewIncident: (newInc: Omit<Incident, 'id' | 'incidentNumber' | 'createdAt' | 'updatedAt' | 'notes' | 'containmentChecklist' | 'timeline' | 'impactedAssets' | 'mitreTactics'>) => string;

  // PCAP actions
  selectedPacket: Packet | null;
  setSelectedPacket: (packet: Packet | null) => void;
  pcapFilter: string;
  setPcapFilter: (filter: string) => void;
  uploadCustomPcap: (filename: string, packetCount?: number) => void;

  // IOC actions
  addIoc: (ioc: Omit<IOC, 'id' | 'firstSeen' | 'lastSeen'>) => void;
  parseAndExtractIocs: (rawText: string) => number;
  updateIocStatus: (id: string, status: IOC['status']) => void;

  // Evidence actions
  addEvidenceArtifact: (artifact: Omit<EvidenceArtifact, 'id' | 'uploadedAt' | 'chainOfCustody'> & Partial<Pick<EvidenceArtifact, 'caseId' | 'accessPassword' | 'description' | 'tags' | 'ownerInvestigatorId' | 'ownerInvestigatorName'>>) => void;
  updateEvidenceMetadata: (evidenceId: string, metadata: { name: string; category: EvidenceArtifact['category']; description?: string; tags?: string[] }) => void;
  deleteEvidenceArtifact: (evidenceId: string) => void;
  addChainOfCustodyEntry: (evidenceId: string, action: string, notes: string, customActor?: string) => void;

  // Report actions
  generateReportForIncident: (incidentId: string) => string;
  updateReport: (reportId: string, updatedFields: Partial<ForensicsReport>) => void;
  createReportRevision: (originalReportId: string, revisionReason: string) => string;

  // Search & Containment Modal
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  isContainmentModalOpen: boolean;
  setIsContainmentModalOpen: (open: boolean) => void;
  fastApiStatus: 'Connected' | 'Standby' | 'Syncing';

  // Toast Notifications
  toast: { message: string; type?: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const defaultUserProfile: UserProfile = {
  id: '',
  fullName: 'DFIR Investigator',
  email: '',
  phone: '',
  organization: 'Cyber Defense & Forensics Labs',
  role: 'Lead DFIR Investigator',
  experienceLevel: '8+ Years Experience',
  certifications: ['CISSP', 'GCFA', 'GCFE', 'GCIH', 'Network+'],
  skills: ['PCAP Analysis', 'Memory Forensics', 'Threat Hunting', 'Malware Carving', 'YARA'],
  isTwoFactorEnabled: true,
  isEmailVerified: true,
  isPhoneVerified: false,
  lastVerificationTime: '2026-07-31 08:30:00 UTC',
  verificationAttempts: 0,
  recoveryCodes: [
    'A8F3-9K2L',
    '7N4P-1M9X',
    '3B8R-5C2W',
    '9D1V-8E7Y',
    '6K3M-2J4P',
    '1H8T-9Q0Z',
    '4X7S-5A2R',
    '8E9F-3W1D',
    '2Y4C-7N8K',
    '5M2L-9P0B'
  ],
  sessions: [
    {
      id: 'sess-1',
      browser: 'Chrome 126.0 (Desktop)',
      device: 'NetTrace SOC Command Station (MacBook Pro 16")',
      operatingSystem: 'macOS Sonoma 14.5',
      ipAddress: '10.0.1.45',
      location: 'San Francisco, CA (US-WEST)',
      loginTime: '2026-07-31 08:30:15 UTC',
      lastActive: 'Active Now',
      isCurrent: true
    },
    {
      id: 'sess-2',
      browser: 'Safari Mobile 17.4',
      device: 'iPhone 15 Pro (SOC Mobile Terminal)',
      operatingSystem: 'iOS 17.5.1',
      ipAddress: '172.56.21.9',
      location: 'San Francisco, CA',
      loginTime: '2026-07-30 19:10:00 UTC',
      lastActive: '2 hours ago',
      isCurrent: false
    },
    {
      id: 'sess-3',
      browser: 'Firefox 125.0',
      device: 'Linux DFIR Forensic Rig',
      operatingSystem: 'Ubuntu 24.04 LTS',
      ipAddress: '192.168.10.110',
      location: 'Washington, DC (US-EAST SOC)',
      loginTime: '2026-07-29 11:15:30 UTC',
      lastActive: '2 days ago',
      isCurrent: false
    }
  ],
  loginHistory: [
    {
      id: 'lh-1',
      date: '2026-07-31',
      time: '08:30:15 UTC',
      browser: 'Chrome 126.0',
      operatingSystem: 'macOS Sonoma',
      ipAddress: '10.0.1.45',
      location: 'San Francisco, CA',
      status: 'Successful Login',
      authMethod: 'Password + 2FA TOTP'
    },
    {
      id: 'lh-2',
      date: '2026-07-30',
      time: '19:10:00 UTC',
      browser: 'Safari Mobile',
      operatingSystem: 'iOS 17.5',
      ipAddress: '172.56.21.9',
      location: 'San Francisco, CA',
      status: 'Successful Login',
      authMethod: 'Hardware Security Key (FIDO2)'
    },
    {
      id: 'lh-3',
      date: '2026-07-30',
      time: '19:08:12 UTC',
      browser: 'Safari Mobile',
      operatingSystem: 'iOS 17.5',
      ipAddress: '172.56.21.9',
      location: 'San Francisco, CA',
      status: 'Failed Password',
      authMethod: 'Password Only'
    },
    {
      id: 'lh-4',
      date: '2026-07-29',
      time: '14:22:00 UTC',
      browser: 'Firefox 125.0',
      operatingSystem: 'Ubuntu 24.04',
      ipAddress: '192.168.10.110',
      location: 'Washington, DC',
      status: 'Password Changed',
      authMethod: 'Security Event'
    },
    {
      id: 'lh-5',
      date: '2026-07-28',
      time: '22:15:40 UTC',
      browser: 'Unknown Browser',
      operatingSystem: 'Windows 11',
      ipAddress: '185.220.101.5',
      location: 'Frankfurt, DE',
      status: 'Failed 2FA',
      authMethod: 'Password + 2FA TOTP'
    },
    {
      id: 'lh-6',
      date: '2026-07-28',
      time: '22:16:05 UTC',
      browser: 'Unknown Browser',
      operatingSystem: 'Windows 11',
      ipAddress: '185.220.101.5',
      location: 'Frankfurt, DE',
      status: 'Session Revoked',
      authMethod: 'Automated SOC Security Policy'
    }
  ],
  activityLog: [
    {
      id: 'act-1',
      action: 'Ingested PCAP Capture',
      timestamp: '2026-07-29 14:22 UTC',
      ipAddress: '10.0.1.45',
      details: 'Ingested ransomware_stager_capture.pcap (28 packets analyzed)'
    },
    {
      id: 'act-2',
      action: 'Generated Forensic Report',
      timestamp: '2026-07-29 15:05 UTC',
      ipAddress: '10.0.1.45',
      details: 'Exported DFIR Report for INC-2026-8842'
    }
  ]
};

export const defaultPlatformPreferences: PlatformPreferences = {
  theme: 'cyber-dark',
  language: 'English (US)',
  timezone: 'UTC (ISO-8601 Default)',
  beginnerMode: true,
  notificationPreferences: {
    criticalThreatAlerts: { inApp: true, email: true },
    pcapAnalysisCompleted: { inApp: true, email: true },
    evidenceVerificationCompleted: { inApp: true, email: false },
    iocDetectionCompleted: { inApp: true, email: false },
    forensicReportGenerated: { inApp: true, email: true },
    investigationAssigned: { inApp: true, email: true },
  },
  accessibilityPreferences: {
    reduceMotion: false,
    highContrastMode: false,
  },
  privacyPreferences: {
    zeroLocalPcapTelemetry: true,
  },
  defaultLandingPage: 'dashboard',
  defaultExportFormat: 'PDF',
  timeFormat: '24 Hour',
  autoSaveEnabled: true,
};

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

export const InvestigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('nettrace_theme');
    return (saved as AppTheme) || 'cyber-dark';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');

  // Apply Theme effect to <html>
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-cyber-dark', 'theme-light', 'theme-high-contrast', 'theme-dark');
    
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'theme-cyber-dark' : 'theme-light');

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('theme-cyber-dark', 'theme-light');
        root.classList.add(e.matches ? 'theme-cyber-dark' : 'theme-light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('nettrace_theme', newTheme);
    const labelMap: Record<AppTheme, string> = {
      'cyber-dark': 'Dark Minimal',
      'light': 'Light Theme',
      'high-contrast': 'High Contrast',
      'system': 'System Theme'
    };
    showToast(`UI Theme updated to ${labelMap[newTheme]}`, 'success');
  };
  
  // App Flow & Auth state
  const [appFlowStage, setAppFlowStage] = useState<AppFlowStage>('splash');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [beginnerMode, setBeginnerMode] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);

  const updateUserProfile = (fields: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...fields }));
    showToast('User profile updated successfully', 'success');
  };
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [casesLoading, setCasesLoading] = useState<boolean>(false);
  const [casesError, setCasesError] = useState<string | null>(null);

  const fetchCases = async () => {
    setCasesLoading(true);
    setCasesError(null);
    try {
      const liveCases = await casesApi.getCases();
      setCases(liveCases || []);
    } catch (err: any) {
      setCasesError(err?.message || 'Failed to fetch active cases from backend.');
    } finally {
      setCasesLoading(false);
    }
  };

  const createCase = async (payload: CaseCreatePayload): Promise<CaseRecord> => {
    try {
      const newCase = await casesApi.createCase(payload);
      setCases(prev => [newCase, ...prev]);
      showToast(`Case ${newCase.caseNumber} created successfully!`, 'success');
      return newCase;
    } catch (err: any) {
      showToast(err?.message || 'Failed to create case', 'error');
      throw err;
    }
  };

  const updateCase = async (caseId: string, payload: CaseUpdatePayload): Promise<CaseRecord> => {
    try {
      const updated = await casesApi.updateCase(caseId, payload);
      setCases(prev => prev.map(c => c.id === caseId ? updated : c));
      showToast('Case updated successfully!', 'success');
      return updated;
    } catch (err: any) {
      showToast(err?.message || 'Failed to update case', 'error');
      throw err;
    }
  };

  const deleteCase = async (caseId: string): Promise<void> => {
    try {
      await casesApi.deleteCase(caseId);
      setCases(prev => prev.filter(c => c.id !== caseId));
      showToast('Case soft-deleted successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete case', 'error');
      throw err;
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchCases();
    }
  }, [isAuthenticated]);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState<boolean>(false);
  const [incidentsError, setIncidentsError] = useState<string | null>(null);

  const fetchIncidents = async (statusFilter?: string, severityFilter?: string, categoryFilter?: string) => {
    setIncidentsLoading(true);
    setIncidentsError(null);
    try {
      const liveIncidents = await incidentsApi.getIncidents(statusFilter, severityFilter, categoryFilter);
      if (liveIncidents && Array.isArray(liveIncidents)) {
        setIncidents(liveIncidents as any);
      }
    } catch (err: any) {
      setIncidentsError(err?.message || 'Failed to fetch incident telemetry from backend.');
    } finally {
      setIncidentsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchIncidents();
    }
  }, [isAuthenticated]);
  const [pcapSession, setPcapSession] = useState<PcapSession>({
    id: '',
    filename: 'No PCAP Session Loaded',
    uploadTimestamp: '',
    fileSizeBytes: 0,
    totalPackets: 0,
    captureDurationSeconds: 0,
    analysisEngine: 'Scapy / PyShark Dissection Engine',
    topProtocols: [],
    threatDistribution: { malicious: 0, suspicious: 0, benign: 0 },
    packets: [],
    conversations: [],
    extractedFiles: [],
    suspiciousDetections: []
  });
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [pcapFilter, setPcapFilter] = useState<string>('');
  
  const [iocs, setIocs] = useState<IOC[]>([]);
  const [iocsLoading, setIocsLoading] = useState<boolean>(false);
  const [iocsError, setIocsError] = useState<string | null>(null);

  const fetchIocs = async (type?: string, status?: string, severity?: string) => {
    setIocsLoading(true);
    setIocsError(null);
    try {
      const res = await iocApi.getIocs(type, status, severity);
      if (res && res.iocs && Array.isArray(res.iocs)) {
        const mappedIocs: IOC[] = res.iocs.map(i => ({
          id: i.id,
          type: (i.type || 'ip').toLowerCase().includes('ip') ? 'ip' : (i.type || '').toLowerCase().includes('sha256') ? 'hash_sha256' : (i.type || '').toLowerCase().includes('md5') ? 'hash_md5' : (i.type || '').toLowerCase().includes('domain') ? 'domain' : 'url',
          value: i.value,
          threatScore: i.severity === 'Critical' ? 95 : i.severity === 'High' ? 85 : i.severity === 'Medium' ? 65 : 40,
          status: i.status as any,
          category: i.category || 'Network Telemetry',
          description: i.description || 'Extracted indicator of compromise.',
          firstSeen: i.firstSeen,
          lastSeen: i.lastSeen,
          yaraMatches: ['Regex_Pattern_Match']
        }));
        setIocs(mappedIocs);
      }
    } catch (err: any) {
      setIocsError(err?.message || 'Failed to fetch IOC intelligence records from backend.');
    } finally {
      setIocsLoading(false);
    }
  };

  const updateIocStatusApi = async (iocId: string, status: string): Promise<void> => {
    try {
      await iocApi.updateIocStatus(iocId, status);
      setIocs(prev => prev.map(i => i.id === iocId ? { ...i, status: status as any } : i));
      showToast(`IOC status updated to ${status}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update IOC status', 'error');
      throw err;
    }
  };

  const extractIocsFromSessionApi = async (sessionId: string): Promise<void> => {
    try {
      const extracted = await iocApi.extractIocs({ sessionId, caseId: cases[0]?.id || '', incidentId: selectedIncident?.id || incidents[0]?.id || '' });
      showToast(`Extracted ${extracted.length} IOCs from session ${sessionId}!`, 'success');
      await fetchIocs();
    } catch (err: any) {
      showToast(err?.message || 'Failed to extract IOCs from session', 'error');
      throw err;
    }
  };

  const deleteIocRecord = async (iocId: string): Promise<void> => {
    try {
      await iocApi.deleteIoc(iocId);
      setIocs(prev => prev.filter(i => i.id !== iocId));
      showToast('IOC record soft-deleted successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete IOC record', 'error');
      throw err;
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchIocs();
    }
  }, [isAuthenticated]);
  const [evidence, setEvidence] = useState<EvidenceArtifact[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState<boolean>(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  const fetchEvidence = async (category?: string, caseId?: string) => {
    setEvidenceLoading(true);
    setEvidenceError(null);
    try {
      const liveEvidence = await evidenceApi.getEvidence(category, caseId);
      if (liveEvidence && Array.isArray(liveEvidence)) {
        const mappedEvidence: EvidenceArtifact[] = liveEvidence.map((a: any) => ({
          id: a.id,
          caseId: a.caseId || cases[0]?.id || '',
          incidentId: a.incidentId || selectedIncident?.id || incidents[0]?.id || '',
          name: a.name,
          category: a.category,
          sizeBytes: a.sizeBytes,
          hashSha256: a.hashSha256,
          hashMd5: a.hashMd5,
          uploadedAt: a.uploadedAt,
          uploadedBy: a.uploadedBy,
          description: a.description || 'Ingested evidence artifact.',
          tags: a.tags || ['Evidence Artifact'],
          ownerInvestigatorId: 'inv-001',
          ownerInvestigatorName: a.uploadedBy,
          accessPassword: 'Protected',
          chainOfCustody: (a.chainOfCustody || []).map((c: any) => ({
            id: c.id,
            evidenceId: c.evidenceId,
            caseId: c.caseId,
            action: c.action,
            actor: c.actor,
            investigatorId: 'inv-001',
            investigatorName: c.actor,
            timestamp: c.timestamp,
            notes: c.notes || ''
          }))
        }));
        setEvidence(mappedEvidence);
      }
    } catch (err: any) {
      setEvidenceError(err?.message || 'Failed to load evidence artifacts from backend.');
    } finally {
      setEvidenceLoading(false);
    }
  };

  const uploadEvidenceFile = async (
    file: File,
    category: string,
    caseId: string,
    incidentId: string,
    description?: string
  ): Promise<EvidenceArtifact> => {
    try {
      const liveArtifact = await evidenceApi.uploadEvidence(file, category, caseId, incidentId, description);
      showToast(`Evidence ${file.name} uploaded & SHA256 hashed successfully!`, 'success');
      await fetchEvidence();
      return {
        id: liveArtifact.id,
        caseId: liveArtifact.caseId,
        incidentId: liveArtifact.incidentId,
        name: liveArtifact.name,
        category: liveArtifact.category,
        sizeBytes: liveArtifact.sizeBytes,
        hashSha256: liveArtifact.hashSha256,
        hashMd5: liveArtifact.hashMd5,
        uploadedAt: liveArtifact.uploadedAt,
        uploadedBy: liveArtifact.uploadedBy,
        description: liveArtifact.description,
        tags: liveArtifact.tags || [],
        ownerInvestigatorId: 'inv-001',
        ownerInvestigatorName: liveArtifact.uploadedBy,
        accessPassword: 'Protected',
        chainOfCustody: (liveArtifact.chainOfCustody || []).map((c: any) => ({
          id: c.id,
          evidenceId: c.evidenceId,
          caseId: c.caseId,
          action: c.action,
          actor: c.actor,
          investigatorId: 'inv-001',
          investigatorName: c.actor,
          timestamp: c.timestamp,
          notes: c.notes || ''
        }))
      };
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload evidence file to backend', 'error');
      throw err;
    }
  };

  const deleteEvidenceArtifact = async (evidenceId: string): Promise<void> => {
    try {
      await evidenceApi.deleteEvidence(evidenceId);
      setEvidence(prev => prev.filter(e => e.id !== evidenceId));
      showToast('Evidence artifact soft-deleted successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete evidence artifact', 'error');
      throw err;
    }
  };

  const [reports, setReports] = useState<ForensicsReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState<boolean>(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const fetchReports = async (incidentId?: string, caseId?: string) => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const liveReports = await reportsApi.getReports(incidentId, caseId);
      if (liveReports && Array.isArray(liveReports)) {
        setReports(liveReports as any);
      }
    } catch (err: any) {
      setReportsError(err?.message || 'Failed to load DFIR forensics reports from backend.');
    } finally {
      setReportsLoading(false);
    }
  };

  const generateReportApi = async (incidentId: string, caseId?: string): Promise<ForensicsReportRecord> => {
    try {
      const report = await reportsApi.generateReport({ incident_id: incidentId, case_id: caseId, include_pdf: true });
      showToast(`Generated 15-section report ${report.reportNumber}!`, 'success');
      await fetchReports();
      return report;
    } catch (err: any) {
      showToast(err?.message || 'Failed to generate report on backend', 'error');
      throw err;
    }
  };

  const createReportRevisionApi = async (reportId: string, revisionReason: string): Promise<ForensicsReportRecord> => {
    try {
      const revision = await reportsApi.createRevision(reportId, revisionReason);
      showToast(`Created report revision v${revision.version}!`, 'success');
      await fetchReports();
      return revision;
    } catch (err: any) {
      showToast(err?.message || 'Failed to create report revision', 'error');
      throw err;
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated]);
  const [threatActors] = useState<ThreatActor[]>([]);
  
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isContainmentModalOpen, setIsContainmentModalOpen] = useState<boolean>(false);
  const [fastApiStatus] = useState<'Connected' | 'Standby' | 'Syncing'>('Connected');

  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  const saveUserProfile = (profile: UserProfile) => {
    try {
      localStorage.setItem('nettrace_user_profile', JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to store user profile', err);
    }
  };

  const loadUserProfile = (): UserProfile | null => {
    try {
      const saved = localStorage.getItem('nettrace_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  };

  const fetchUserProfile = async () => {
    try {
      const liveProfile = await apiClient<any>('/profile/me');
      if (liveProfile) {
        setUserProfile(prev => {
          const updated = {
            ...prev,
            ...liveProfile,
            fullName: liveProfile.fullName || prev.fullName,
            email: liveProfile.email || prev.email,
            role: liveProfile.role || prev.role,
          };
          saveUserProfile(updated);
          return updated;
        });
      }
    } catch (err) {
      console.warn('Failed to fetch user profile from backend /profile/me', err);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  // Auto-authenticate if valid JWT token is present on mount
  React.useEffect(() => {
    const token = getAccessToken();
    const refresh = getRefreshToken();
    if (token || refresh) {
      const savedProfile = loadUserProfile();
      if (savedProfile) {
        setUserProfile(savedProfile);
      }
      setIsAuthenticated(true);
      setAppFlowStage('authenticated');
    }
  }, []);


  const loginUser = async (emailStr: string, passwordStr?: string, explicitName?: string) => {
    try {
      const pwd = passwordStr || 'NetTrace@2026';
      const tokens = await authApi.login({ email: emailStr, password: pwd });
      if (tokens && tokens.access_token) {
        setAuthTokens(tokens.access_token, tokens.refresh_token);
      }

      const formattedName = explicitName || (
        emailStr.includes('@')
          ? emailStr.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
          : emailStr
      );

      const updatedProfile: UserProfile = {
        ...defaultUserProfile,
        id: `usr-${Date.now()}`,
        fullName: formattedName,
        email: emailStr,
        role: 'Lead DFIR Investigator',
      };

      setUserProfile(updatedProfile);
      saveUserProfile(updatedProfile);

      setIsAuthenticated(true);
      setAppFlowStage('authenticated');
      setActiveTab('dashboard');
      return tokens;
    } catch (err) {
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API notification warning:', err);
    } finally {
      clearAuthTokens();
      localStorage.removeItem('nettrace_user_profile');
      setUserProfile(defaultUserProfile);
      setIsAuthenticated(false);
      setAppFlowStage('landing');
    }
  };

  const registerUser = async (fullNameStr: string, emailStr: string, passwordStr?: string) => {
    try {
      const pwd = passwordStr || 'NetTrace@2026';
      await authApi.register({ fullName: fullNameStr, email: emailStr, password: pwd });
      return await loginUser(emailStr, pwd, fullNameStr);
    } catch (err) {
      throw err;
    }
  };

  const toggleBeginnerMode = () => {
    setBeginnerMode(prev => {
      const next = !prev;
      updatePlatformPreferences({ beginnerMode: next });
      return next;
    });
  };

  // Platform Preferences State
  const [platformPreferences, setPlatformPreferencesState] = useState<PlatformPreferences>(() => {
    try {
      const saved = localStorage.getItem('nettrace_platform_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultPlatformPreferences, ...parsed };
      }
    } catch {
      // fallback
    }
    return defaultPlatformPreferences;
  });

  const updatePlatformPreferences = (fields: Partial<PlatformPreferences>) => {
    setPlatformPreferencesState(prev => {
      const updated = { ...prev, ...fields };
      localStorage.setItem('nettrace_platform_preferences', JSON.stringify(updated));
      return updated;
    });

    if (fields.theme && fields.theme !== theme) {
      setThemeState(fields.theme);
      localStorage.setItem('nettrace_theme', fields.theme);
    }
    if (fields.beginnerMode !== undefined) {
      setBeginnerMode(fields.beginnerMode);
    }
  };

  const resetPlatformPreferences = () => {
    setPlatformPreferencesState(defaultPlatformPreferences);
    localStorage.setItem('nettrace_platform_preferences', JSON.stringify(defaultPlatformPreferences));
    setThemeState(defaultPlatformPreferences.theme);
    setBeginnerMode(defaultPlatformPreferences.beginnerMode);
    showToast('Platform preferences restored to defaults', 'info');
  };

  const clearTemporaryCache = () => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    showToast('Temporary analysis cache and browser memory cleared successfully.', 'success');
  };

  // Sync Accessibility Classes (Reduce Motion & High Contrast)
  React.useEffect(() => {
    const root = document.documentElement;
    if (platformPreferences.accessibilityPreferences?.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (platformPreferences.accessibilityPreferences?.highContrastMode) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }
  }, [platformPreferences.accessibilityPreferences]);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  // Real-time NetTrace Module Completion Status Engine
  const moduleStatuses: NetTraceModuleStatuses = useMemo(() => {
    // 1. Investigation Case Module
    const hasIncidents = incidents.length > 0;
    const isCaseComplete = !!(selectedIncident && selectedIncident.title && selectedIncident.title.trim().length > 0);
    const caseStatus: NetTraceModuleStatus = isCaseComplete 
      ? 'Completed' 
      : (hasIncidents ? 'In Progress' : 'Not Started');
    const caseDetail = selectedIncident 
      ? `Case ${selectedIncident.incidentNumber}: ${selectedIncident.title || 'Untitled Case'}`
      : (hasIncidents ? `${incidents.length} case(s) initialized` : 'No active case created');

    // 2. Packet Analyzer Module
    const hasPcap = !!(pcapSession && pcapSession.filename && pcapSession.filename.length > 0);
    const totalPackets = pcapSession?.totalPackets || 0;
    const isPcapComplete = !!(hasPcap && totalPackets > 0);
    const pcapStatus: NetTraceModuleStatus = isPcapComplete 
      ? 'Completed' 
      : (hasPcap ? 'In Progress' : 'Not Started');
    const pcapDetail = isPcapComplete 
      ? `${pcapSession.filename} (${totalPackets} packets parsed via PyShark/Scapy)`
      : (hasPcap ? `${pcapSession.filename} loaded, packet parsing pending` : 'No PCAP capture uploaded');

    // 3. IOC Detection Module
    const iocCount = iocs ? iocs.length : 0;
    const isIocComplete = iocCount > 0;
    const iocStatus: NetTraceModuleStatus = isIocComplete ? 'Completed' : 'Not Started';
    const iocDetail = isIocComplete 
      ? `${iocCount} Indicators extracted & scored`
      : 'No IOCs extracted or detected';

    // 4. Evidence Vault Module
    const evidenceCount = evidence ? evidence.length : 0;
    const hasShaHashes = evidenceCount > 0 && evidence.every(e => e.hashSha256 && e.hashSha256.length > 10);
    const isEvidenceComplete = evidenceCount > 0 && hasShaHashes;
    const evidenceStatus: NetTraceModuleStatus = isEvidenceComplete 
      ? 'Completed' 
      : (evidenceCount > 0 ? 'In Progress' : 'Not Started');
    const evidenceDetail = isEvidenceComplete 
      ? `${evidenceCount} Evidence items registered with verified SHA-256`
      : (evidenceCount > 0 ? `${evidenceCount} Items registered, SHA-256 baseline verification pending` : 'No evidence items registered in vault');

    // 5. Timeline Module
    const timelineEventsCount = selectedIncident?.timeline ? selectedIncident.timeline.length : 0;
    const isTimelineComplete = timelineEventsCount > 0;
    const timelineStatus: NetTraceModuleStatus = isTimelineComplete ? 'Completed' : 'Not Started';
    const timelineDetail = isTimelineComplete 
      ? `${timelineEventsCount} Attack timeline events logged`
      : 'Attack chronology pending';

    return {
      investigationCase: {
        key: 'investigationCase',
        name: 'Investigation Case',
        status: caseStatus,
        isCompleted: isCaseComplete,
        detail: caseDetail,
        targetTab: 'incidents',
        metricsText: selectedIncident ? `Incident ${selectedIncident.incidentNumber}` : `${incidents.length} Cases`
      },
      packetAnalyzer: {
        key: 'packetAnalyzer',
        name: 'Packet Analyzer',
        status: pcapStatus,
        isCompleted: isPcapComplete,
        detail: pcapDetail,
        targetTab: 'pcap',
        metricsText: `${totalPackets} Packets`
      },
      iocDetection: {
        key: 'iocDetection',
        name: 'IOC Detection',
        status: iocStatus,
        isCompleted: isIocComplete,
        detail: iocDetail,
        targetTab: 'ioc',
        metricsText: `${iocCount} IOCs`
      },
      evidenceVault: {
        key: 'evidenceVault',
        name: 'Evidence Vault',
        status: evidenceStatus,
        isCompleted: isEvidenceComplete,
        detail: evidenceDetail,
        targetTab: 'evidence',
        metricsText: `${evidenceCount} Items`
      },
      timeline: {
        key: 'timeline',
        name: 'Timeline',
        status: timelineStatus,
        isCompleted: isTimelineComplete,
        detail: timelineDetail,
        targetTab: 'workbench',
        metricsText: `${timelineEventsCount} Events`
      }
    };
  }, [selectedIncident, incidents, pcapSession, iocs, evidence]);

  const completedModulesCount = useMemo(() => {
    return Object.values(moduleStatuses).filter(m => m.status === 'Completed').length;
  }, [moduleStatuses]);

  const totalModulesCount = 5;
  const isAllModulesCompleted = completedModulesCount === totalModulesCount;

  const updateIncidentStatus = async (id: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status, updatedAt: new Date().toISOString() } : inc));
    try {
      await incidentsApi.updateStatus(id, status);
      showToast(`Incident status updated to ${status}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update incident status on backend', 'error');
    }
  };

  const updateIncidentSeverity = (id: string, severity: SeverityLevel) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, severity, updatedAt: new Date().toISOString() } : inc));
  };

  const addTimelineEvent = (incidentId: string, event: Omit<TimelineEvent, 'id' | 'incidentId'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `tl-${Date.now()}`,
      incidentId
    };
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          timeline: [newEvent, ...inc.timeline],
          updatedAt: new Date().toISOString()
        };
      }
      return inc;
    }));
  };

  const addAnalystNote = (incidentId: string, noteContent: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      author: 'Current Analyst (You)',
      timestamp: new Date().toISOString(),
      content: noteContent
    };
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          notes: [...inc.notes, newNote],
          updatedAt: new Date().toISOString()
        };
      }
      return inc;
    }));
  };

  const toggleChecklistTask = (incidentId: string, taskId: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          containmentChecklist: inc.containmentChecklist.map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return inc;
    }));
  };

  const isolateAsset = async (incidentId: string, assetId: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          impactedAssets: inc.impactedAssets.map(a => 
            a.id === assetId ? { ...a, status: 'Isolated' as const } : a
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return inc;
    }));
    try {
      await incidentsApi.isolateAsset(incidentId, assetId);
      showToast('Host asset isolated successfully on FastAPI backend!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to isolate asset on backend', 'error');
    }
  };

  const addNewIncident = async (newIncData: Omit<Incident, 'id' | 'incidentNumber' | 'createdAt' | 'updatedAt' | 'notes' | 'containmentChecklist' | 'timeline' | 'impactedAssets' | 'mitreTactics'>) => {
    let createdFromApi: any = null;
    try {
      createdFromApi = await incidentsApi.createIncident({
        title: newIncData.title,
        severity: newIncData.severity,
        category: newIncData.category,
        assignedAnalyst: newIncData.assignedAnalyst,
        summary: newIncData.summary,
        attackVector: newIncData.attackVector,
        currentStage: newIncData.currentStage,
      });
      showToast('Incident created successfully on FastAPI backend!', 'success');
    } catch (err: any) {
      console.warn('API incident creation fallback:', err);
    }

    const id = createdFromApi?.id || `inc-${Date.now()}`;
    const incidentNumber = createdFromApi?.incidentNumber || `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    
    const createdIncident: Incident = {
      ...newIncData,
      id,
      incidentNumber,
      createdAt: createdFromApi?.createdAt || now,
      updatedAt: createdFromApi?.updatedAt || now,
      impactedAssets: createdFromApi?.impactedAssets || [
        {
          id: `asset-${Date.now()}`,
          hostname: 'UNKNOWN-HOST-01.corp.internal',
          ipAddress: '10.0.100.12',
          os: 'Windows 11 Enterprise',
          assetType: 'Workstation',
          status: 'Under Analysis',
          owner: 'SOC Operations'
        }
      ],
      timeline: createdFromApi?.timeline || [
        {
          id: `tl-${Date.now()}`,
          incidentId: id,
          timestamp: `${now.substring(0, 10)} ${now.substring(11, 19)} UTC`,
          source: 'Analyst Note',
          eventType: 'Incident Created',
          description: `Investigation initialized by ${newIncData.assignedAnalyst}.`,
          severity: newIncData.severity
        }
      ],
      mitreTactics: createdFromApi?.mitreTactics || [
        { id: 'T1059', name: 'Command & Scripting Interpreter', tactic: 'Execution' }
      ],
      notes: createdFromApi?.notes || [
        {
          id: `note-${Date.now()}`,
          author: newIncData.assignedAnalyst,
          timestamp: now,
          content: 'Incident docket opened. Automated triage baseline initialized.'
        }
      ],
      containmentChecklist: createdFromApi?.containmentChecklist || [
        { id: `chk-1-${id}`, task: 'Identify and isolate primary infected host', completed: false },
        { id: `chk-2-${id}`, task: 'Collect memory dump and network PCAP sample', completed: false },
        { id: `chk-3-${id}`, task: 'Block associated C2 IPs on firewall', completed: false }
      ]
    };
    setIncidents(prev => [createdIncident, ...prev]);
    setSelectedIncidentId(id);
    return id;
  };

  const fetchSessionPackets = async (sessionId: string) => {
    try {
      const sessionDetails = await pcapApi.getSession(sessionId).catch(() => null);
      const packetRes = await pcapApi.getPackets(sessionId);
      if (packetRes && packetRes.packets) {
        const mappedPackets: Packet[] = packetRes.packets.map(p => ({
          packetNo: p.packetNumber,
          timestamp: p.timestamp,
          srcIp: p.sourceIp,
          srcPort: p.sourcePort || 0,
          destIp: p.destinationIp,
          destPort: p.destinationPort || 0,
          protocol: p.protocol as any,
          length: p.packetLength,
          info: p.info || '',
          threatRating: (p.info || '').toLowerCase().includes('exploit') || (p.info || '').toLowerCase().includes('c2') || (p.info || '').toLowerCase().includes('malicious') ? 'Malicious' : 'Benign',
          flags: p.tcpFlags ? [p.tcpFlags] : ['ACK'],
          payloadHex: (p as any).payloadHex || (p as any).payload_hex || '45 00 00 3c a2 11 40 00 40 06 ... Scapy Dissected Payload',
          asciiStream: (p as any).payloadAscii || (p as any).payload_ascii || p.info || `[Dissected ${p.protocol} Packet #${p.packetNumber}]`
        }));

        setPcapSession(prev => ({
          ...prev,
          id: sessionId,
          filename: sessionDetails?.originalFilename || sessionDetails?.filename || prev.filename,
          totalPackets: packetRes.totalPackets || mappedPackets.length,
          fileSizeBytes: sessionDetails?.fileSizeBytes || prev.fileSizeBytes,
          durationSeconds: sessionDetails?.durationSeconds || prev.durationSeconds,
          packets: mappedPackets,
          topProtocols: sessionDetails?.topProtocols ? sessionDetails.topProtocols.map(tp => ({
            protocol: tp.name,
            percentage: tp.percentage,
            packetCount: tp.count
          })) : prev.topProtocols
        }));

        if (mappedPackets.length > 0) {
          setSelectedPacket(mappedPackets[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch packets for session:', err);
    }
  };

  const uploadRealPcapFile = async (file: File, caseIdInput?: string, incidentIdInput?: string): Promise<void> => {
    const targetCaseId = caseIdInput || cases[0]?.id || selectedIncident?.caseId;
    const targetIncidentId = incidentIdInput || selectedIncident?.id || incidents[0]?.id;

    if (!cases || cases.length === 0 || !targetCaseId) {
      const errorMsg = 'Please create a Case before uploading a PCAP.';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    if (!incidents || incidents.length === 0 || !targetIncidentId) {
      const errorMsg = 'Please create an Incident before uploading a PCAP.';
      showToast(errorMsg, 'error');
      throw new Error(errorMsg);
    }

    try {
      const res = await pcapApi.analyzePcap(file, targetCaseId, targetIncidentId);
      showToast(`Ingested & analyzed ${file.name} via Scapy Dissection Engine!`, 'success');
      
      if (res && res.sessionId) {
        await fetchSessionPackets(res.sessionId);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to analyze PCAP file on backend', 'error');
      throw err;
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      pcapApi.getSessions(0, 1)
        .then(sessions => {
          if (sessions && sessions.length > 0) {
            fetchSessionPackets(sessions[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const uploadCustomPcap = (filename: string, packetCount = 24) => {
    const newPackets: Packet[] = Array.from({ length: packetCount }, (_, i) => {
      const isEvil = i % 3 === 0;
      return {
        packetNo: i + 1,
        timestamp: `14:30:${(10 + i).toString().padStart(2, '0')}.102400`,
        srcIp: isEvil ? '185.220.101.5' : `10.0.1.${10 + i}`,
        srcPort: 49152 + i * 2,
        destIp: isEvil ? '10.0.1.5' : '10.0.0.1',
        destPort: isEvil ? 443 : 80,
        protocol: isEvil ? 'HTTP' : i % 2 === 0 ? 'TCP' : 'DNS',
        length: 128 + i * 42,
        info: isEvil ? `POST /c2/beacon?id=${i} HTTP/1.1` : `TCP SYN/ACK Session #${i}`,
        threatRating: isEvil ? 'Malicious' : 'Benign',
        flags: ['PSH', 'ACK'],
        payloadHex: '45 00 00 3c a2 11 40 00 40 06 ... custom pcap payload stream',
        asciiStream: isEvil ? `POST /c2/beacon HTTP/1.1\nHost: c2-node.net\nData: payload_${i}` : `[Standard TCP Traffic Packet #${i + 1}]`
      };
    });

    const newPcapSession: PcapSession = {
      id: `pcap-${Date.now()}`,
      filename,
      uploadedAt: new Date().toISOString(),
      totalPackets: packetCount,
      durationSeconds: 180,
      fileSizeBytes: packetCount * 1200,
      packets: newPackets,
      topProtocols: [
        { name: 'TCP', count: Math.floor(packetCount * 0.5), percentage: 50 },
        { name: 'HTTP', count: Math.floor(packetCount * 0.3), percentage: 30 },
        { name: 'DNS', count: Math.floor(packetCount * 0.2), percentage: 20 }
      ],
      suspiciousDetections: [
        {
          title: 'Custom PCAP Malware Stager Detection',
          severity: 'High',
          description: `Analyzed ${filename}. Detected potential reverse shell connection.`,
          packetIndex: 1
        }
      ],
      extractedFiles: [
        {
          filename: 'extracted_binary.exe',
          sizeBytes: 1048576,
          mimeType: 'application/x-dsexec',
          md5: '88a329182390a01290312013912a',
          sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
          verdict: 'Malicious'
        }
      ]
    };

    setPcapSession(newPcapSession);
    setSelectedPacket(newPackets[0]);
  };

  const addIoc = (iocData: Omit<IOC, 'id' | 'firstSeen' | 'lastSeen'>) => {
    const now = new Date().toISOString();
    const newIoc: IOC = {
      ...iocData,
      id: `ioc-${Date.now()}`,
      firstSeen: now,
      lastSeen: now
    };
    setIocs(prev => [newIoc, ...prev]);
  };

  const parseAndExtractIocs = (rawText: string): number => {
    // Basic regex extractors for IPv4, SHA256/MD5, Domains, URLs
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const sha256Regex = /\b[a-fA-F0-9]{64}\b/g;
    const md5Regex = /\b[a-fA-F0-9]{32}\b/g;
    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g;

    const ips = Array.from(new Set(rawText.match(ipRegex) || []));
    const sha256s = Array.from(new Set(rawText.match(sha256Regex) || []));
    const md5s = Array.from(new Set(rawText.match(md5Regex) || []));
    const urls = Array.from(new Set(rawText.match(urlRegex) || []));

    let addedCount = 0;
    const now = new Date().toISOString();

    ips.forEach(ip => {
      if (!iocs.some(existing => existing.value === ip)) {
        addIoc({
          type: 'ip',
          value: ip,
          threatScore: 85,
          status: 'Active Threat',
          category: 'Extracted IP Address',
          description: 'Automatically extracted from raw log artifact analysis.',
          yaraMatches: ['Regex_Parsed_IP']
        });
        addedCount++;
      }
    });

    sha256s.forEach(hash => {
      if (!iocs.some(existing => existing.value === hash)) {
        addIoc({
          type: 'hash_sha256',
          value: hash,
          threatScore: 90,
          status: 'Active Threat',
          category: 'Extracted File Hash',
          description: 'SHA256 extracted from forensic log parser.',
          yaraMatches: ['Parsed_SHA256_Checksum']
        });
        addedCount++;
      }
    });

    md5s.forEach(hash => {
      if (!iocs.some(existing => existing.value === hash)) {
        addIoc({
          type: 'hash_md5',
          value: hash,
          threatScore: 80,
          status: 'Investigating',
          category: 'Extracted File Hash MD5',
          description: 'MD5 checksum extracted from log stream.',
        });
        addedCount++;
      }
    });

    urls.forEach(url => {
      if (!iocs.some(existing => existing.value === url)) {
        addIoc({
          type: 'url',
          value: url,
          threatScore: 78,
          status: 'Active Threat',
          category: 'Extracted URL',
          description: 'Potentially malicious C2/phishing web URL extracted.',
        });
        addedCount++;
      }
    });

    return addedCount;
  };

  const updateIocStatus = (id: string, status: IOC['status']) => {
    setIocs(prev => prev.map(ioc => ioc.id === id ? { ...ioc, status } : ioc));
    updateIocStatusApi(id, status).catch(() => {});
  };

  const addEvidenceArtifact = (artifactData: Omit<EvidenceArtifact, 'id' | 'uploadedAt' | 'chainOfCustody'> & Partial<Pick<EvidenceArtifact, 'caseId' | 'accessPassword' | 'description' | 'tags' | 'ownerInvestigatorId' | 'ownerInvestigatorName'>>) => {
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC';
    const newId = `ev-${Date.now()}`;
    const caseId = artifactData.caseId || cases[0]?.id || '';
    const uploadedBy = artifactData.uploadedBy || userProfile.fullName || 'Lead DFIR Analyst';

    const newArtifact: EvidenceArtifact = {
      ...artifactData,
      id: newId,
      caseId,
      incidentId: artifactData.incidentId || selectedIncident?.id || incidents[0]?.id || '',
      description: artifactData.description || 'Forensic artifact registered during incident response investigation.',
      tags: artifactData.tags || ['Evidence Artifact'],
      accessPassword: artifactData.accessPassword || 'NetTrace2026!',
      ownerInvestigatorId: artifactData.ownerInvestigatorId || 'inv-001',
      ownerInvestigatorName: artifactData.ownerInvestigatorName || uploadedBy,
      uploadedAt: nowStr,
      uploadedBy,
      chainOfCustody: [
        {
          id: `coc-${Date.now()}`,
          evidenceId: newId,
          caseId,
          action: 'Evidence Registered',
          actor: uploadedBy,
          investigatorId: 'inv-001',
          investigatorName: uploadedBy,
          timestamp: nowStr,
          notes: 'Evidence registered into vault and baseline SHA-256 locked.'
        },
        {
          id: `coc-${Date.now() - 1}`,
          evidenceId: newId,
          caseId,
          action: 'Evidence Uploaded',
          actor: uploadedBy,
          investigatorId: 'inv-001',
          investigatorName: uploadedBy,
          timestamp: nowStr,
          notes: 'File payload uploaded to secure forensic repository.'
        }
      ]
    };
    setEvidence(prev => [newArtifact, ...prev]);
  };

  const updateEvidenceMetadata = (evidenceId: string, metadata: { name: string; category: EvidenceArtifact['category']; description?: string; tags?: string[] }) => {
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC';
    const actorName = userProfile.fullName || 'Lead DFIR Analyst';

    setEvidence(prev => prev.map(ev => {
      if (ev.id === evidenceId) {
        const newCoc: ChainOfCustodyEntry = {
          id: `coc-${Date.now()}`,
          evidenceId: ev.id,
          caseId: ev.caseId,
          action: 'Metadata Updated',
          actor: actorName,
          investigatorId: 'inv-001',
          investigatorName: actorName,
          timestamp: nowStr,
          notes: `Updated metadata: Name="${metadata.name}", Category="${metadata.category}". Original hash & payload unchanged.`
        };
        return {
          ...ev,
          name: metadata.name,
          category: metadata.category,
          description: metadata.description !== undefined ? metadata.description : ev.description,
          tags: metadata.tags !== undefined ? metadata.tags : ev.tags,
          chainOfCustody: [newCoc, ...ev.chainOfCustody]
        };
      }
      return ev;
    }));
  };

  const addChainOfCustodyEntry = (evidenceId: string, action: string, notes: string, customActor?: string) => {
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC';
    const actorName = customActor || userProfile.fullName || 'Lead DFIR Analyst';

    setEvidence(prev => prev.map(ev => {
      if (ev.id === evidenceId) {
        const newCoc: ChainOfCustodyEntry = {
          id: `coc-${Date.now()}`,
          evidenceId: ev.id,
          caseId: ev.caseId,
          action: action.trim(),
          actor: actorName,
          investigatorId: 'inv-001',
          investigatorName: actorName,
          timestamp: nowStr,
          notes: notes.trim()
        };
        return {
          ...ev,
          chainOfCustody: [newCoc, ...ev.chainOfCustody]
        };
      }
      return ev;
    }));
  };

  const generateReportForIncident = (incidentId: string): string => {
    generateReportApi(incidentId).catch(() => {});
    const target = incidents.find(i => i.id === incidentId) || selectedIncident;
    const tsStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const reportNum = `REP-${Date.now().toString().slice(-6)}`;
    const reportId = `rep-${Date.now()}`;
    const authorName = userProfile.fullName || target.assignedAnalyst || 'Lead Investigator';
    const orgName = userProfile.organization || 'Zyphera Security Labs';
    const caseId = target.caseId || cases[0]?.id || '';

    // Compile Chain of Custody entries from evidence artifacts
    const cocSummary = evidence.flatMap(e => e.chainOfCustody.map(c => ({
      evidenceName: e.name,
      action: c.action,
      actor: c.actor,
      timestamp: c.timestamp,
      notes: c.notes
    })));

    const newRep: ForensicsReport = {
      id: reportId,
      reportNumber: reportNum,
      version: 1,
      revisionReason: 'Original Investigation',
      revisionDate: tsStr,
      incidentId: target.id,
      caseId: caseId,
      incidentTitle: target.title,
      generatedAt: tsStr,
      generatedBy: authorName,
      organization: orgName,
      status: 'Draft',
      reportHash: `sha256-${Date.now().toString(16)}-${Math.random().toString(36).substring(2, 8)}`,
      history: [
        {
          id: `hist-${Date.now()}-1`,
          event: 'Created',
          timestamp: tsStr,
          actor: authorName,
          notes: 'Initial report draft generated'
        },
        {
          id: `hist-${Date.now()}-2`,
          event: 'Compiled',
          timestamp: tsStr,
          actor: authorName,
          notes: 'Automated telemetry compilation completed across all modules'
        }
      ],
      coverPage: {
        title: target.title,
        caseId: caseId,
        reportId: reportNum,
        generatedDate: tsStr,
        leadInvestigator: authorName,
        organization: orgName,
        classification: 'CONFIDENTIAL // FOR OFFICIAL USE ONLY (FOUO)'
      },
      executiveSummary: `On ${tsStr}, NetTrace Forensic Platform completed a comprehensive automated investigation of incident ${caseId} (${target.title}). Analysis indicates an intrusion classified as ${target.category} with an assessed severity level of ${target.severity}.\n\nPrimary Findings: ${target.summary}\n\nImmediate containment measures have been verified, and all evidence artifacts have been cryptographically hashed and secured in the Evidence Vault.`,
      incidentCaseDetails: {
        incidentNumber: caseId,
        category: target.category,
        severity: target.severity,
        currentStage: target.currentStage,
        assignedAnalyst: authorName,
        summary: target.summary,
        impactedAssets: target.impactedAssets.map(a => ({
          hostname: a.hostname,
          ipAddress: a.ipAddress,
          status: a.status,
          os: a.os
        }))
      },
      attackTimeline: target.timeline.map(t => ({
        timestamp: t.timestamp,
        source: t.source,
        eventType: t.eventType,
        description: t.description
      })),
      evidenceInventory: evidence.map(e => ({
        id: e.id,
        name: e.name,
        category: e.category,
        sizeBytes: e.sizeBytes,
        hashSha256: e.hashSha256,
        hashMd5: e.hashMd5,
        uploadedBy: e.uploadedBy,
        integrityStatus: 'VERIFIED'
      })),
      packetAnalysis: {
        pcapFilename: pcapSession?.filename || 'incident_capture_DC01_10.0.1.5.pcapng',
        analysisEngine: 'PyShark / Scapy Packet Inspection Engine',
        totalPacketsParsed: pcapSession?.totalPackets || 18,
        captureDurationSeconds: pcapSession?.durationSeconds || 142.8,
        topProtocols: pcapSession?.topProtocols.map(p => `${p.name} (${p.percentage}%)`) || ['TCP (44.4%)', 'HTTP (27.8%)', 'DNS (16.7%)'],
        maliciousFlowsCount: pcapSession?.suspiciousDetections.length || 3,
        dpiAnomalySummary: pcapSession?.suspiciousDetections[0]?.description || 'Anomalous outbound HTTP POST requests detected with encrypted executable stager payload headers.',
        c2TrafficDetails: 'Outbound TCP/443 traffic detected to suspicious foreign external endpoints.'
      },
      iocs: iocs.map(i => ({
        type: i.type,
        value: i.value,
        threatScore: i.threatScore,
        severity: i.severity,
        description: i.description,
        sourcePacket: i.sourcePacket
      })),
      rootCauseAnalysis: {
        primaryVector: target.attackVector || 'Compromised Gateway Credentials & Remote RPC Coercion',
        exploitedVulnerabilities: 'CVE-2021-36942 (PetitPotam RPC Coercion) & Missing MFA',
        description: `Adversary exploited initial entry via ${target.attackVector || 'VPN gateway'} to perform lateral movement and privilege escalation.`
      },
      containmentAndRecovery: {
        containmentStatus: `Incident state is currently ${target.status}. Key assets status: ${target.impactedAssets.map(a => `${a.hostname}:${a.status}`).join(', ') || 'Isolated'}.`,
        checklistItems: target.containmentChecklist.map(c => ({
          task: c.task,
          completed: c.completed,
          assignedTo: c.assignedTo
        }))
      },
      remediationRecommendations: [
        'Enforce hardware-backed FIDO2 multi-factor authentication across all perimeter portals.',
        'Disable NTLM domain-wide and mandate Kerberos authentication with SMB signing.',
        'Apply latest RPC security updates on Domain Controllers to mitigate coerced authentication.',
        'Implement strict egress network firewall policies limiting outbound traffic to approved ranges.'
      ],
      evidenceIntegrity: evidence.map(e => ({
        artifactName: e.name,
        category: e.category,
        hashSha256: e.hashSha256,
        hashMd5: e.hashMd5,
        verificationStatus: 'VERIFIED',
        verifiedAt: e.uploadedAt
      })),
      chainOfCustodySummary: cocSummary.length > 0 ? cocSummary : [
        {
          evidenceName: 'DC01_lsass_memory_dump.dmp',
          action: 'Evidence Verified',
          actor: authorName,
          timestamp: tsStr,
          notes: 'Cryptographic hash verified at initial collection.'
        }
      ],
      investigatorNotes: target.notes.map(n => `[${n.timestamp}] ${n.author}: ${n.content}`),
      appendix: 'This document adheres to NIST SP 800-61 Rev 2 guidelines. Evidence artifacts and hashes are cataloged in NetTrace Evidence Vault.',
      references: [
        'NIST SP 800-61 Rev 2: Computer Security Incident Handling Guide',
        'NetTrace DFIR Platform Specifications V1.0'
      ]
    };

    setReports(prev => [newRep, ...prev]);
    return reportId;
  };

  const updateReport = (reportId: string, updatedFields: Partial<ForensicsReport>) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, ...updatedFields } : r));
  };

  const createReportRevision = (originalReportId: string, revisionReason: string): string => {
    const original = reports.find(r => r.id === originalReportId);
    const tsStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const authorName = userProfile.fullName || 'Lead Investigator';
    const nextVersion = (original?.version || 1) + 1;
    const newRevId = `rep-${Date.now()}`;

    const newHistoryEntry: ForensicsReportHistoryEntry = {
      id: `hist-${Date.now()}`,
      event: 'Revision Created',
      timestamp: tsStr,
      actor: authorName,
      notes: `Revision Version ${nextVersion} created: ${revisionReason}`
    };

    const newReport: ForensicsReport = original ? {
      ...original,
      id: newRevId,
      version: nextVersion,
      revisionReason: revisionReason,
      revisionDate: tsStr,
      status: 'Draft',
      generatedAt: tsStr,
      history: [newHistoryEntry, ...(original.history || [])],
      coverPage: {
        ...original.coverPage,
        generatedDate: tsStr,
        organization: userProfile.organization || original.coverPage.organization
      }
    } : {
      id: newRevId,
      reportNumber: `REP-${Date.now().toString().slice(-6)}`,
      version: nextVersion,
      revisionReason: revisionReason,
      revisionDate: tsStr,
      incidentId: selectedIncident?.id || incidents[0]?.id || '',
      caseId: selectedIncident?.caseId || cases[0]?.id || '',
      incidentTitle: selectedIncident?.title || 'Forensics Investigation',
      generatedAt: tsStr,
      generatedBy: authorName,
      organization: userProfile.organization || 'Zyphera Security Labs',
      status: 'Draft',
      reportHash: `sha256-${Date.now().toString(16)}`,
      history: [newHistoryEntry],
      coverPage: {
        title: selectedIncident?.title || 'Forensics Investigation',
        caseId: selectedIncident?.caseId || cases[0]?.id || '',
        reportId: `REP-${Date.now().toString().slice(-6)}`,
        generatedDate: tsStr,
        leadInvestigator: authorName,
        organization: userProfile.organization || 'Zyphera Security Labs',
        classification: 'CONFIDENTIAL // FOR OFFICIAL USE ONLY (FOUO)'
      },
      executiveSummary: 'Revision draft initialized.',
      incidentCaseDetails: {
        incidentNumber: selectedIncident?.incidentNumber || cases[0]?.caseNumber || '',
        category: selectedIncident?.category || 'General',
        severity: selectedIncident?.severity || 'High',
        currentStage: selectedIncident?.currentStage || 'Containment',
        assignedAnalyst: authorName,
        summary: 'Investigation summary',
        impactedAssets: []
      },
      attackTimeline: [],
      evidenceInventory: [],
      packetAnalysis: {
        pcapFilename: 'incident_capture.pcapng',
        analysisEngine: 'PyShark / Scapy Engine',
        totalPacketsParsed: 0,
        captureDurationSeconds: 0,
        topProtocols: [],
        maliciousFlowsCount: 0,
        dpiAnomalySummary: '',
        c2TrafficDetails: ''
      },
      iocs: [],
      rootCauseAnalysis: {
        primaryVector: 'Unknown',
        exploitedVulnerabilities: 'N/A',
        description: 'Under investigation'
      },
      containmentAndRecovery: {
        containmentStatus: 'In Progress',
        checklistItems: []
      },
      remediationRecommendations: [],
      evidenceIntegrity: [],
      chainOfCustodySummary: [],
      investigatorNotes: [],
      appendix: '',
      references: []
    };

    setReports(prev => [newReport, ...prev]);
    return newRevId;
  };

  return (
    <InvestigationContext.Provider
      value={{
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        selectedIncidentId,
        setSelectedIncidentId,
        incidents,
        cases,
        fetchCases,
        createCase,
        updateCase,
        deleteCase,
        casesLoading,
        casesError,
        pcapSession,
        uploadRealPcapFile,
        fetchSessionPackets,
        iocs,
        evidence,
        reports,
        threatActors,
        moduleStatuses,
        isAllModulesCompleted,
        completedModulesCount,
        totalModulesCount,
        appFlowStage,
        setAppFlowStage,
        isAuthenticated,
        loginUser,
        logoutUser,
        registerUser,
        beginnerMode,
        toggleBeginnerMode,
        userProfile,
        updateUserProfile,
        platformPreferences,
        updatePlatformPreferences,
        resetPlatformPreferences,
        clearTemporaryCache,
        selectedIncident,
        updateIncidentStatus,
        updateIncidentSeverity,
        addTimelineEvent,
        addAnalystNote,
        toggleChecklistTask,
        isolateAsset,
        addNewIncident,
        selectedPacket,
        setSelectedPacket,
        pcapFilter,
        setPcapFilter,
        uploadCustomPcap,
        addIoc,
        parseAndExtractIocs,
        updateIocStatus,
        addEvidenceArtifact,
        updateEvidenceMetadata,
        deleteEvidenceArtifact,
        addChainOfCustodyEntry,
        generateReportForIncident,
        updateReport,
        createReportRevision,
        globalSearch,
        setGlobalSearch,
        isContainmentModalOpen,
        setIsContainmentModalOpen,
        fastApiStatus,
        toast,
        showToast
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
};

export const useInvestigation = () => {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
};
