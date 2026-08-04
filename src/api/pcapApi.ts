import { apiClient } from './apiClient';

export interface PcapSessionRecord {
  id: string;
  filename: string;
  originalFilename: string;
  fileSizeBytes: number;
  uploadTime: string;
  uploadedBy: string;
  evidenceId?: string;
  status: string;
  analysisEngine: string;
  packetCount: number;
  durationSeconds: number;
  topProtocols: Array<{ name: string; count: number; percentage: number }>;
  analysisSummary: Record<string, any>;
}

export interface PacketRecord {
  id: string;
  sessionId: string;
  packetNumber: number;
  timestamp: string;
  protocol: string;
  sourceIp: string;
  destinationIp: string;
  sourcePort?: number;
  destinationPort?: number;
  packetLength: number;
  info?: string;
  tcpFlags?: string;
}

export interface PacketDetailRecord extends PacketRecord {
  payloadHex?: string;
  payloadAscii?: string;
}

export interface PacketListResponse {
  sessionId: string;
  totalPackets: number;
  packets: PacketRecord[];
}

export interface PcapUploadResponse {
  sessionId: string;
  filename: string;
  originalFilename: string;
  fileSizeBytes: number;
  uploadTime: string;
  uploadedBy: string;
  status: string;
  evidenceId?: string;
}

export const pcapApi = {
  analyzePcap: async (file: File, caseId: string, incidentId: string): Promise<PcapUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    formData.append('incidentId', incidentId);

    return apiClient<PcapUploadResponse>('/pcap/analyze', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  getSessions: async (skip: number = 0, limit: number = 100): Promise<PcapSessionRecord[]> => {
    return apiClient<PcapSessionRecord[]>(`/pcap/sessions?skip=${skip}&limit=${limit}`);
  },

  getSession: async (sessionId: string): Promise<PcapSessionRecord> => {
    return apiClient<PcapSessionRecord>(`/pcap/sessions/${sessionId}`);
  },

  getPackets: async (sessionId: string, skip: number = 0, limit: number = 100): Promise<PacketListResponse> => {
    return apiClient<PacketListResponse>(`/pcap/sessions/${sessionId}/packets?skip=${skip}&limit=${limit}`);
  },

  getPacketDetail: async (sessionId: string, packetNumber: number): Promise<PacketDetailRecord> => {
    return apiClient<PacketDetailRecord>(`/pcap/sessions/${sessionId}/packets/${packetNumber}`);
  },
};
