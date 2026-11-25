export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  csrf_token: string;
}

export interface CSRFTokenResponse {
  csrf_token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

export interface MeResponse {
  data: UserProfile;
  message: string;
}

export interface SuccessResponse {
  data: Record<string, unknown>;
  message: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PasswordResetPayload {
  email: string;
}

export interface PasswordSetPayload {
  token: string;
  password: string;
}

export interface AccountActivationPayload {
  token: string;
  password: string;
}

export interface AccountInvitationPayload {
  email: string;
  first_name: string;
  last_name: string;
  role_code?: string;
}

export interface RoleAssignmentPayload {
  role_code: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export interface AuthSessionItem {
  id: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  last_used_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  is_current: boolean;
}

export interface AuthSessionsResponse {
  data: AuthSessionItem[];
  message: string;
}
