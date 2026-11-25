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

export type UserAccountStatus = "pending" | "active" | "suspended" | "disabled";
export type UpdatableUserStatus = "active" | "suspended" | "disabled";

export interface AdminUserItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: UserAccountStatus;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

export interface ListUsersParams {
  page?: number;
  size?: number;
  status?: UserAccountStatus | "";
  role?: string;
  search?: string;
}

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface UserStatusPayload {
  status: UpdatableUserStatus;
}

export interface RoleCatalogItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
}

export interface PermissionCatalogItem {
  id: string;
  code: string;
  description: string | null;
}

export interface AuditEventRecord {
  id: string;
  actor_user_id: string | null;
  target_user_id: string | null;
  event_type: string;
  outcome: string;
  ip_address: string | null;
  user_agent: string | null;
  request_id: string | null;
  occurred_at: string;
  metadata?: Record<string, unknown> | null;
}

export interface ListAuditEventsParams {
  page?: number;
  size?: number;
  event_type?: string;
  actor_user_id?: string;
  target_user_id?: string;
  from_at?: string;
  to_at?: string;
}
