import { apiClient } from './apiClient';

export interface ForensicsReportRecord {
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
  status: string;
  reportHash: string;
  history: Array<{ id: string; event: string; timestamp: string; actor: string; notes?: string }>;
  coverPage: Record<string, any>;
  executiveSummary: string;
  incidentCaseDetails: Record<string, any>;
  attackTimeline: Array<Record<string, any>>;
  evidenceInventory: Array<Record<string, any>>;
  packetAnalysis: Record<string, any>;
  iocs: any;
  rootCauseAnalysis: Record<string, any>;
  containmentAndRecovery: Record<string, any>;
  remediationRecommendations: string[];
  evidenceIntegrity: Array<Record<string, any>>;
  chainOfCustodySummary: Array<Record<string, any>>;
  investigatorNotes: string[];
  appendix: string;
  references: string[];
}

export interface ReportGeneratePayload {
  incident_id: string;
  case_id?: string;
  include_pdf?: boolean;
}

export const reportsApi = {
  getReports: async (incidentId?: string, caseId?: string): Promise<ForensicsReportRecord[]> => {
    const params = new URLSearchParams();
    if (incidentId) params.append('incident_id', incidentId);
    if (caseId) params.append('case_id', caseId);

    const queryString = params.toString();
    const endpoint = `/reports${queryString ? `?${queryString}` : ''}`;
    return apiClient<ForensicsReportRecord[]>(endpoint);
  },

  getReportDetails: async (reportId: string): Promise<ForensicsReportRecord> => {
    return apiClient<ForensicsReportRecord>(`/reports/${reportId}`);
  },

  generateReport: async (payload: ReportGeneratePayload): Promise<ForensicsReportRecord> => {
    return apiClient<ForensicsReportRecord>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createRevision: async (reportId: string, revisionReason: string): Promise<ForensicsReportRecord> => {
    return apiClient<ForensicsReportRecord>(`/reports/${reportId}/revision`, {
      method: 'POST',
      body: JSON.stringify({ revisionReason }),
    });
  },
};
