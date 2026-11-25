import { apiClient, setAuthTokens } from "@/lib/api/client";
import type {
  AuthTokens,
  AuthSessionItem,
  AuthSessionsResponse,
  CSRFTokenResponse,
  UserProfile,
  MeResponse,
  SuccessResponse,
  HealthResponse,
  LoginPayload,
  PasswordResetPayload,
  PasswordSetPayload,
  AccountActivationPayload,
  AccountInvitationPayload,
  RoleAssignmentPayload,
} from "../types";

export const authService = {
  /**
   * Authenticates user with credentials
   * POST /api/v1/auth/login
   */
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>("/auth/login", payload);
    const tokens = response.data;
    if (tokens.access_token) {
      setAuthTokens(tokens.access_token, tokens.csrf_token);
    }
    return tokens;
  },

  /**
   * Refreshes access token and CSRF token using HttpOnly cookies
   * POST /api/v1/auth/refresh
   */
  async refreshToken(): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>("/auth/refresh");
    const tokens = response.data;
    if (tokens.access_token) {
      setAuthTokens(tokens.access_token, tokens.csrf_token);
    }
    return tokens;
  },

  /**
   * Renews CSRF token bound to existing refresh cookie
   * GET /api/v1/auth/csrf
   */
  async getCsrfToken(): Promise<CSRFTokenResponse> {
    const response = await apiClient.get<CSRFTokenResponse>("/auth/csrf");
    if (response.data.csrf_token) {
      setAuthTokens(null, response.data.csrf_token);
    }
    return response.data;
  },

  /**
   * Fetches current authenticated user profile and roles
   * GET /api/v1/auth/me
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<MeResponse>("/auth/me");
    return response.data.data;
  },

  /**
   * Revokes current session and clears cookies on server
   * POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<SuccessResponse>("/auth/logout");
    } catch {
      // Ignora 401: si el token ya expiró o la sesión ya no existe, el logout es exitoso por idempotencia
    } finally {
      setAuthTokens(null, null);
    }
  },

  /**
   * Revokes all active user sessions across all devices
   * POST /api/v1/auth/logout-all
   */
  async logoutAll(): Promise<void> {
    try {
      await apiClient.post<SuccessResponse>("/auth/logout-all");
    } catch {
      // Ignora 401: si el token ya expiró o la sesión ya no existe, el logout es exitoso por idempotencia
    } finally {
      setAuthTokens(null, null);
    }
  },

  /**
   * Requests password reset email link
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(payload: PasswordResetPayload): Promise<SuccessResponse> {
    const response = await apiClient.post<SuccessResponse>("/auth/forgot-password", payload);
    return response.data;
  },

  /**
   * Sets new password using signed token
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(payload: PasswordSetPayload): Promise<SuccessResponse> {
    const response = await apiClient.post<SuccessResponse>("/auth/reset-password", payload);
    return response.data;
  },

  /**
   * Activates new clinician account with invitation token
   * POST /api/v1/auth/activate-account
   */
  async activateAccount(payload: AccountActivationPayload): Promise<SuccessResponse> {
    const response = await apiClient.post<SuccessResponse>("/auth/activate-account", payload);
    return response.data;
  },

  /**
   * Invites a new medical staff member (Admin only)
   * POST /api/v1/auth/invitations
   */
  async inviteAccount(payload: AccountInvitationPayload): Promise<SuccessResponse> {
    const response = await apiClient.post<SuccessResponse>("/auth/invitations", {
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
    });
    return response.data;
  },

  /**
   * Assigns a clinical or administrative role to a user (Admin only)
   * PUT /api/v1/auth/users/{user_id}/roles
   */
  async assignUserRole(userId: string, payload: RoleAssignmentPayload): Promise<SuccessResponse> {
    const response = await apiClient.put<SuccessResponse>(`/auth/users/${userId}/roles`, payload);
    return response.data;
  },

  /**
   * Lists active and historical sessions for the authenticated user
   * GET /api/v1/auth/sessions
   */
  async listSessions(): Promise<AuthSessionItem[]> {
    const response = await apiClient.get<AuthSessionsResponse>("/auth/sessions");
    return response.data.data;
  },

  /**
   * Revokes a specific session owned by the authenticated user
   * DELETE /api/v1/auth/sessions/{session_id}
   */
  async revokeSession(sessionId: string): Promise<SuccessResponse> {
    const response = await apiClient.delete<SuccessResponse>(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Diagnoses backend service health
   * GET /api/v1/health
   */
  async checkHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>("/health");
    return response.data;
  },

  /**
   * Verifies backend PostgreSQL readiness
   * GET /api/v1/ready
   */
  async checkReadiness(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>("/ready");
    return response.data;
  },
};
