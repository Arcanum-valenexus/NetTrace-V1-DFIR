import { apiClient } from './apiClient';

export interface CaseRecord {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseCreatePayload {
  title: string;
  description?: string;
  priority?: string;
}

export interface CaseUpdatePayload {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
}

export const casesApi = {
  getCases: async (): Promise<CaseRecord[]> => {
    return apiClient<CaseRecord[]>('/cases');
  },

  getCase: async (caseId: string): Promise<CaseRecord> => {
    return apiClient<CaseRecord>(`/cases/${caseId}`);
  },

  createCase: async (payload: CaseCreatePayload): Promise<CaseRecord> => {
    return apiClient<CaseRecord>('/cases', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateCase: async (caseId: string, payload: CaseUpdatePayload): Promise<CaseRecord> => {
    return apiClient<CaseRecord>(`/cases/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteCase: async (caseId: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/cases/${caseId}`, {
      method: 'DELETE',
    });
  },
};
