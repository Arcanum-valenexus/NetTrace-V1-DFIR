import { apiClient } from './apiClient';

export interface IOCRecord {
  id: string;
  type: string;
  value: string;
  status: string;
  category: string;
  description?: string;
  sourcePacket?: number;
  sourceSession?: string;
  evidenceId?: string;
  incidentId?: string;
  caseId?: string;
  severity: string;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOCListResponse {
  totalCount: number;
  iocs: IOCRecord[];
}

export interface IOCExtractPayload {
  sessionId: string;
  caseId?: string;
  incidentId?: string;
}

export interface IOCStatusUpdatePayload {
  status: string;
  notes?: string;
}

export const iocApi = {
  getIocs: async (
    type?: string,
    status?: string,
    severity?: string,
    session?: string,
    incident?: string,
    caseId?: string,
    skip: number = 0,
    limit: number = 100
  ): Promise<IOCListResponse> => {
    const params = new URLSearchParams();
    if (type && type !== 'ALL') params.append('type', type);
    if (status && status !== 'ALL') params.append('status', status);
    if (severity && severity !== 'ALL') params.append('severity', severity);
    if (session) params.append('session', session);
    if (incident) params.append('incident', incident);
    if (caseId) params.append('case', caseId);
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = `/ioc${queryString ? `?${queryString}` : ''}`;
    return apiClient<IOCListResponse>(endpoint);
  },

  getIocDetails: async (iocId: string): Promise<IOCRecord> => {
    return apiClient<IOCRecord>(`/ioc/${iocId}`);
  },

  extractIocs: async (payload: IOCExtractPayload): Promise<IOCRecord[]> => {
    return apiClient<IOCRecord[]>('/ioc/extract', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateIocStatus: async (iocId: string, status: string, notes?: string): Promise<IOCRecord> => {
    return apiClient<IOCRecord>(`/ioc/${iocId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  },

  deleteIoc: async (iocId: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/ioc/${iocId}`, {
      method: 'DELETE',
    });
  },
};
