import { apiClient } from './apiClient';

export interface ChainOfCustodyEntry {
  id: string;
  evidenceId: string;
  caseId: string;
  action: string;
  actor: string;
  timestamp: string;
  notes?: string;
}

export interface EvidenceArtifactRecord {
  id: string;
  caseId: string;
  incidentId: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  sizeBytes: number;
  hashSha256: string;
  hashMd5: string;
  uploadedAt: string;
  uploadedBy: string;
  storagePath: string;
  analysisStatus: string;
  analysisEngine?: string;
  packetCount?: number;
  captureDuration?: number;
  topProtocols?: string[];
  analysisSummary?: Record<string, any>;
  analysisCompletedAt?: string;
  chainOfCustody: ChainOfCustodyEntry[];
}

export const evidenceApi = {
  getEvidence: async (category?: string, caseId?: string): Promise<EvidenceArtifactRecord[]> => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (caseId) params.append('case_id', caseId);

    const queryString = params.toString();
    const endpoint = `/evidence${queryString ? `?${queryString}` : ''}`;
    return apiClient<EvidenceArtifactRecord[]>(endpoint);
  },

  getEvidenceDetails: async (evidenceId: string): Promise<EvidenceArtifactRecord> => {
    return apiClient<EvidenceArtifactRecord>(`/evidence/${evidenceId}`);
  },

  uploadEvidence: async (
    file: File,
    category: string,
    caseId: string,
    incidentId: string,
    description?: string
  ): Promise<EvidenceArtifactRecord> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('caseId', caseId);
    formData.append('incidentId', incidentId);
    if (description) formData.append('description', description);

    return apiClient<EvidenceArtifactRecord>('/evidence/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  deleteEvidence: async (evidenceId: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/evidence/${evidenceId}`, {
      method: 'DELETE',
    });
  },
};
