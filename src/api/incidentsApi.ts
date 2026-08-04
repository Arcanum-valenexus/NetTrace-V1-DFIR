import { apiClient } from './apiClient';

export interface ImpactedAsset {
  id: string;
  hostname: string;
  ipAddress: string;
  os: string;
  macAddress?: string;
  assetType: string;
  status: string;
  owner: string;
}

export interface TimelineEventRecord {
  id: string;
  incidentId: string;
  timestamp: string;
  source: string;
  eventType: string;
  description: string;
  severity: string;
  rawLog?: string;
}

export interface AnalystNote {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

export interface ChecklistTask {
  id: string;
  task: string;
  completed: boolean;
  assignedTo?: string;
}

export interface IncidentRecord {
  id: string;
  incidentNumber: string;
  title: string;
  severity: string;
  status: string;
  category: string;
  assignedAnalyst: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
  attackVector: string;
  currentStage: string;
  impactedAssets: ImpactedAsset[];
  timeline: TimelineEventRecord[];
  mitreTactics: Array<{ id: string; name: string; tactic: string }>;
  notes: AnalystNote[];
  containmentChecklist: ChecklistTask[];
}

export interface IncidentCreatePayload {
  title: string;
  severity: string;
  category: string;
  assignedAnalyst: string;
  summary?: string;
  attackVector?: string;
  currentStage?: string;
}

export const incidentsApi = {
  getIncidents: async (status?: string, severity?: string, category?: string): Promise<IncidentRecord[]> => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (severity && severity !== 'All') params.append('severity', severity);
    if (category && category !== 'All') params.append('category', category);

    const queryString = params.toString();
    const endpoint = `/incidents${queryString ? `?${queryString}` : ''}`;
    return apiClient<IncidentRecord[]>(endpoint);
  },

  getIncident: async (incidentId: string): Promise<IncidentRecord> => {
    return apiClient<IncidentRecord>(`/incidents/${incidentId}`);
  },

  createIncident: async (payload: IncidentCreatePayload): Promise<IncidentRecord> => {
    return apiClient<IncidentRecord>('/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateStatus: async (incidentId: string, status: string): Promise<IncidentRecord> => {
    return apiClient<IncidentRecord>(`/incidents/${incidentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  isolateAsset: async (incidentId: string, assetId: string): Promise<ImpactedAsset> => {
    return apiClient<ImpactedAsset>(`/incidents/${incidentId}/assets/${assetId}/isolate`, {
      method: 'POST',
    });
  },
};
