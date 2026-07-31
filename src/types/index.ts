export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export type IncidentStatus = 'Open' | 'Investigating' | 'Contained' | 'Mitigated' | 'Closed';

export type IncidentCategory = 
  | 'Ransomware'
  | 'Data Exfiltration'
  | 'C2 Infrastructure'
  | 'Phishing / Initial Access'
  | 'Lateral Movement'
  | 'Privilege Escalation'
  | 'Malware Outbreak';

export type KillChainStage = 
  | 'Reconnaissance'
  | 'Resource Development'
  | 'Initial Access'
  | 'Execution'
  | 'Persistence'
  | 'Privilege Escalation'
  | 'Defense Evasion'
  | 'Credential Access'
  | 'Discovery'
  | 'Lateral Movement'
  | 'Collection'
  | 'Command and Control'
  | 'Exfiltration'
  | 'Impact';

export interface ImpactedAsset {
  id: string;
  hostname: string;
  ipAddress: string;
  os: string;
  macAddress?: string;
  assetType: 'Server' | 'Workstation' | 'Domain Controller' | 'Database' | 'Network Switch';
  status: 'Isolated' | 'Active' | 'Under Analysis' | 'Remediated';
  owner: string;
}

export interface TimelineEvent {
  id: string;
  incidentId: string;
  timestamp: string;
  source: 'PCAP Analysis' | 'EDR Log' | 'Active Directory' | 'Firewall' | 'Analyst Note' | 'DNS Sinkhole';
  eventType: string;
  description: string;
  severity: SeverityLevel;
  rawLog?: string;
  associatedIocs?: string[];
  threatActor?: string;
}

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  category: IncidentCategory;
  assignedAnalyst: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
  attackVector: string;
  currentStage: KillChainStage;
  impactedAssets: ImpactedAsset[];
  timeline: TimelineEvent[];
  mitreTactics: {
    id: string; // e.g. T1059
    name: string; // e.g. Command and Scripting Interpreter
    tactic: string; // e.g. Execution
  }[];
  notes: {
    id: string;
    author: string;
    timestamp: string;
    content: string;
  }[];
  containmentChecklist: {
    id: string;
    task: string;
    completed: boolean;
    assignedTo?: string;
  }[];
}

export interface Packet {
  packetNo: number;
  timestamp: string;
  srcIp: string;
  srcPort: number;
  destIp: string;
  destPort: number;
  protocol: 'TCP' | 'UDP' | 'DNS' | 'HTTP' | 'HTTPS' | 'SMB' | 'TLS' | 'ICMP';
  length: number;
  info: string;
  threatRating?: 'Benign' | 'Suspicious' | 'Malicious';
  flags?: string[];
  payloadHex?: string;
  asciiStream?: string;
  httpMethod?: string;
  httpUrl?: string;
  dnsQuery?: string;
}

export interface PcapSession {
  id: string;
  filename: string;
  uploadedAt: string;
  totalPackets: number;
  durationSeconds: number;
  fileSizeBytes: number;
  packets: Packet[];
  topProtocols: { name: string; count: number; percentage: number }[];
  suspiciousDetections: {
    title: string;
    severity: SeverityLevel;
    description: string;
    packetIndex: number;
  }[];
  extractedFiles: {
    filename: string;
    sizeBytes: number;
    mimeType: string;
    md5: string;
    sha256: string;
    verdict: 'Clean' | 'Suspicious' | 'Malicious';
  }[];
}

export type IocType = 'ip' | 'domain' | 'hash_md5' | 'hash_sha256' | 'url' | 'filepath' | 'email' | 'other';

export interface IOC {
  id: string;
  type: IocType;
  value: string;
  threatScore: number; // 0 to 100
  status: 'Active Threat' | 'Investigating' | 'Whitelisted' | 'Blocked';
  category: string;
  firstSeen: string;
  lastSeen: string;
  asn?: string;
  country?: string;
  threatGroup?: string;
  yaraMatches?: string[];
  description: string;
  references?: string[];
  // DFIR PCAP Extraction fields
  sourcePacket?: number | string;
  evidenceRef?: string;
  severity?: SeverityLevel;
  reasonFlagged?: string;
  recommendedAction?: string;
  relatedEvidence?: string;
}

export type EvidenceCategory = 
  | 'Memory Dump' 
  | 'Disk Image' 
  | 'PCAP Trace' 
  | 'Event Log' 
  | 'Registry Hive' 
  | 'Malware Binary' 
  | 'Extracted Payload' 
  | 'Report / Screenshot' 
  | 'Other';

export interface ChainOfCustodyEntry {
  id: string;
  evidenceId?: string;
  caseId?: string;
  action: string;
  actor: string;
  investigatorId?: string;
  investigatorName?: string;
  timestamp: string;
  notes: string;
}

export interface EvidenceArtifact {
  id: string;
  caseId: string;
  incidentId: string;
  name: string;
  category: EvidenceCategory;
  description?: string;
  tags?: string[];
  sizeBytes: number;
  hashSha256: string;
  hashMd5: string;
  uploadedAt: string;
  uploadedBy: string;
  ownerInvestigatorId?: string;
  ownerInvestigatorName?: string;
  accessPassword?: string;
  storagePath: string;
  chainOfCustody: ChainOfCustodyEntry[];
}

export interface ForensicsReportHistoryEntry {
  id: string;
  event: 'Created' | 'Compiled' | 'Reviewed' | 'Finalized' | 'Locked' | 'Exported' | 'Revision Created';
  timestamp: string;
  actor: string;
  notes?: string;
}

export interface ForensicsReportSectionDetails {
  pcapFilename: string;
  analysisEngine: string;
  totalPacketsParsed: number;
  captureDurationSeconds: number;
  topProtocols: string[];
  maliciousFlowsCount: number;
  dpiAnomalySummary: string;
  c2TrafficDetails: string;
}

export interface ForensicsReport {
  id: string;
  reportNumber: string;
  version: number;
  revisionReason?: string;
  revisionDate?: string;
  incidentId: string;
  caseId: string;
  incidentTitle: string;
  generatedAt: string;
  generatedBy: string;
  organization: string;
  status: 'Draft' | 'Compiled' | 'Ready For Review' | 'Final' | 'Locked';
  reportHash: string;
  history: ForensicsReportHistoryEntry[];
  
  // 15 Standardized DFIR Sections
  coverPage: {
    title: string;
    caseId: string;
    reportId: string;
    generatedDate: string;
    leadInvestigator: string;
    organization: string;
    classification: string;
  };
  executiveSummary: string;
  incidentCaseDetails: {
    incidentNumber: string;
    category: string;
    severity: string;
    currentStage: string;
    assignedAnalyst: string;
    summary: string;
    impactedAssets: Array<{ hostname: string; ipAddress: string; status: string; os: string }>;
  };
  attackTimeline: Array<{ timestamp: string; source: string; eventType: string; description: string }>;
  evidenceInventory: Array<{
    id: string;
    name: string;
    category: string;
    sizeBytes: number;
    hashSha256: string;
    hashMd5: string;
    uploadedBy: string;
    integrityStatus: string;
  }>;
  packetAnalysis: ForensicsReportSectionDetails;
  iocs: Array<{ type: string; value: string; threatScore: number; severity: string; description: string; sourcePacket?: string }>;
  rootCauseAnalysis: {
    primaryVector: string;
    exploitedVulnerabilities: string;
    description: string;
  };
  containmentAndRecovery: {
    containmentStatus: string;
    checklistItems: Array<{ task: string; completed: boolean; assignedTo: string }>;
  };
  remediationRecommendations: string[];
  evidenceIntegrity: Array<{
    artifactName: string;
    category: string;
    hashSha256: string;
    hashMd5: string;
    verificationStatus: 'VERIFIED' | 'TAMPERED' | 'UNVERIFIED';
    verifiedAt: string;
  }>;
  chainOfCustodySummary: Array<{
    evidenceName: string;
    action: string;
    actor: string;
    timestamp: string;
    notes: string;
  }>;
  investigatorNotes: string[];
  appendix: string;
  references: string[];
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  targetSectors: string[];
  primaryTTPs: string[];
  threatLevel: SeverityLevel;
  description: string;
  associatedMalware: string[];
}

export type AppFlowStage = 'splash' | 'landing' | 'login' | 'register' | 'forgot_password' | 'authenticated';

export interface UserSession {
  id: string;
  browser: string;
  device: string;
  operatingSystem: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActive: string;
  isCurrent: boolean;
}

export type LoginStatusType = 
  | 'Successful Login' 
  | 'Failed Password' 
  | 'Failed 2FA' 
  | 'Password Changed' 
  | 'Session Revoked';

export interface LoginHistoryItem {
  id: string;
  date: string;
  time: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  location: string;
  status: LoginStatusType;
  authMethod: string;
}

export interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
  avatarUrl?: string;
  experienceLevel: string;
  certifications: string[];
  skills: string[];
  isTwoFactorEnabled: boolean;
  recoveryCodes?: string[];
  isEmailVerified?: boolean;
  pendingEmail?: string;
  emailVerificationToken?: string;
  isPhoneVerified?: boolean;
  pendingPhone?: string;
  otpVerifiedAt?: string;
  lastVerificationTime?: string;
  verificationAttempts?: number;
  sessions: UserSession[];
  loginHistory?: LoginHistoryItem[];
  activityLog: UserActivity[];
}

export type ActiveTab = 
  | 'dashboard' 
  | 'incidents' 
  | 'workbench' 
  | 'pcap' 
  | 'ioc' 
  | 'evidence' 
  | 'reports' 
  | 'settings'
  | 'profile';

export type NetTraceModuleName = 
  | 'Investigation Case'
  | 'Packet Analyzer'
  | 'IOC Detection'
  | 'Evidence Vault'
  | 'Timeline';

export type NetTraceModuleKey = 
  | 'investigationCase'
  | 'packetAnalyzer'
  | 'iocDetection'
  | 'evidenceVault'
  | 'timeline';

export type NetTraceModuleStatus = 'Completed' | 'In Progress' | 'Not Started';

export interface ModuleStatusInfo {
  key: NetTraceModuleKey;
  name: NetTraceModuleName;
  status: NetTraceModuleStatus;
  isCompleted: boolean;
  detail: string;
  targetTab: ActiveTab;
  metricsText: string;
}

export type NetTraceModuleStatuses = Record<NetTraceModuleKey, ModuleStatusInfo>;

export type NotificationTypeKey = 
  | 'criticalThreatAlerts'
  | 'pcapAnalysisCompleted'
  | 'evidenceVerificationCompleted'
  | 'iocDetectionCompleted'
  | 'forensicReportGenerated'
  | 'investigationAssigned';

export interface NotificationChannelPreference {
  inApp: boolean;
  email: boolean;
}

export type NotificationPreferencesMap = Record<NotificationTypeKey, NotificationChannelPreference>;

export interface PlatformPreferences {
  theme: 'cyber-dark' | 'light' | 'high-contrast' | 'system';
  language: string;
  timezone: string;
  beginnerMode: boolean;
  notificationPreferences: NotificationPreferencesMap;
  accessibilityPreferences: {
    reduceMotion: boolean;
    highContrastMode: boolean;
  };
  privacyPreferences: {
    zeroLocalPcapTelemetry: boolean;
  };
  defaultLandingPage: ActiveTab;
  defaultExportFormat: 'PDF' | 'Markdown' | 'JSON';
  timeFormat: '12 Hour' | '24 Hour';
  autoSaveEnabled: boolean;
}
