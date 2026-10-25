export type VerdictType = 'VENDOR_CLOUD' | 'YOUR_CODE' | 'THIRD_PARTY_DEPRECATION' | 'CASCADING_DOMINO';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  statusUrl: string;
  status: 'operational' | 'degraded' | 'outage';
  latencyMs: number;
  errorRate: number;
  iconName: string;
  lastChecked: string;
}

export interface AgentSignal {
  id: string;
  vendorId: string;
  vendorName: string;
  signalType: 'STATUS_PAGE_DEGRADED' | 'CHANGELOG_DEPRECATION' | 'COMMUNITY_REPORT' | 'ON_DEMAND_SWEEP';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  sourceUrl: string;
  timestamp: string;
  confidence: number;
}

export interface IncidentState {
  id: string;
  title: string;
  affectedService: string;
  status: 'Investigating' | 'Verdict Reached' | 'Mitigated';
  confidenceScore: number;
  verdict: VerdictType;
  blameEntity: string;
  headline: string;
  startedAt: string;
  duration: string;
  topFinding: string;
  rootCause: string;
  evidenceSnapshot: {
    latencySpike: 'High' | 'Medium' | 'Low';
    errorRate: 'High' | 'Medium' | 'Low';
    trafficSurge: 'High' | 'Medium' | 'Low';
    deployChanges: 'High' | 'Medium' | 'Low';
  };
  dominoPath: string[];
  evidenceList: string[];
  circuitBreakerAdvice: string;
  codeSnippet?: {
    beforeSnippet: string;
    afterSnippet: string;
    explanation: string;
    diffSummary: string;
  };
}

export interface CodeCorrectionRequest {
  code: string;
  errorLog: string;
  vendor: string;
  framework: string;
}

export interface CodeCorrectionResponse {
  correctedCode: string;
  patches: string[];
  explanation: string;
  vendorDocUpdate: string;
}
