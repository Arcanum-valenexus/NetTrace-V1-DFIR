import { apiClient } from './apiClient';

export interface OverviewMetrics {
  activeIncidents: number;
  criticalAlerts: number;
  pcapsAnalyzed: number;
  totalIocsCataloged: number;
  threatLevel: string;
  pcapMetrics?: PcapStatsMetrics;
  iocMetrics?: IocStatsMetrics;
}

export interface PcapStatsMetrics {
  totalPcapSessions: number;
  totalPackets: number;
  completedAnalyses: number;
  failedAnalyses: number;
  averagePacketSize: number;
  averageCaptureDuration: number;
  topProtocols: Array<{ name: string; count: number; percentage: number }>;
  topSourceIps: Array<{ ip: string; count: number }>;
  topDestinationIps: Array<{ ip: string; count: number }>;
  recentAnalyses: Array<{
    id: string;
    filename: string;
    status: string;
    packetCount: number;
    durationSeconds: number;
    analysisEngine: string;
    uploadTime: string;
  }>;
}

export interface IocStatsMetrics {
  totalIocs: number;
  criticalIocs: number;
  highSeverityIocs: number;
  mediumSeverityIocs: number;
  lowSeverityIocs: number;
  iocTypes: Record<string, number>;
  topCategories: Array<{ category: string; count: number }>;
  recentIocs: Array<{
    id: string;
    type: string;
    value: string;
    status: string;
    severity: string;
    category: string;
    firstSeen: string;
  }>;
}

export interface KillChainDistribution {
  [stage: string]: number;
}

export const dashboardApi = {
  getOverviewMetrics: async (): Promise<OverviewMetrics> => {
    return apiClient<OverviewMetrics>('/dashboard/metrics');
  },

  getPcapStats: async (): Promise<PcapStatsMetrics> => {
    return apiClient<PcapStatsMetrics>('/dashboard/pcap-stats');
  },

  getKillChainDistribution: async (): Promise<KillChainDistribution> => {
    return apiClient<KillChainDistribution>('/dashboard/kill-chain');
  },
};
