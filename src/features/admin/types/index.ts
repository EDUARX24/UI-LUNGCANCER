export interface CTStudy {
  id: string;
  patientNhc: string;
  patientAge: number;
  patientGender: "H" | "M";
  modality: string;
  slices: number;
  department: string;
  status: "COMPLETED" | "PROCESSING" | "QUEUED";
  progress?: number;
  findings: {
    severity: "CRITICAL" | "BENIGN" | "INTERMEDIATE" | "PENDING";
    description: string;
  };
}

export interface AdminKPIs {
  studiesToday: number;
  studiesGrowth: number;
  inferenceAccuracy: number;
  nodulesDetected: number;
  highRiskCount: number;
  pacsLatencyMs: number;
  pacsThroughput: string;
  pacsNodesConnected: number;
  gpuClusterUsage: number;
  gpuVramUsed: number;
  gpuVramTotal: number;
  gpuActiveWorkers: number;
  gpuTempCelsius: number;
}

export interface InfrastructureNode {
  id: string;
  name: string;
  tech: string;
  status: "CONNECTED" | "OPERATIONAL" | "ACTIVE" | "WARNING";
  statusLabel: string;
  metric: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target?: string;
  department?: string;
  severity: "INFO" | "CRITICAL" | "SYSTEM";
  details: string;
}
