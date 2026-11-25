import { apiClient } from "@/lib/api/client";
import type { SuccessResponse } from "@/features/auth/types";
import type {
  AdminUserItem,
  AuditEventRecord,
  ListAuditEventsParams,
  ListUsersParams,
  PaginatedResponse,
  PermissionCatalogItem,
  RoleCatalogItem,
  UserStatusPayload,
  UserUpdatePayload,
} from "../types";

export const adminService = {
  /**
   * Lists clinical users with server-side pagination and filters
   * GET /api/v1/users
   */
  async listUsers(params: ListUsersParams = {}): Promise<PaginatedResponse<AdminUserItem>> {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      size: params.size ?? 20,
    };
    if (params.status) query.status = params.status;
    if (params.role) query.role = params.role;
    if (params.search?.trim()) query.search = params.search.trim();

    const response = await apiClient.get<PaginatedResponse<AdminUserItem>>("/users", {
      params: query,
    });
    return response.data;
  },

  /**
   * Fetches a single user dossier by ID
   * GET /api/v1/users/{user_id}
   */
  async getUser(userId: string): Promise<AdminUserItem> {
    const response = await apiClient.get<AdminUserItem>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Updates user first_name, last_name and/or email
   * PATCH /api/v1/users/{user_id}
   */
  async updateUser(userId: string, payload: UserUpdatePayload): Promise<AdminUserItem> {
    const response = await apiClient.patch<AdminUserItem>(`/users/${userId}`, payload);
    return response.data;
  },

  /**
   * Updates user account status (active, suspended, disabled)
   * PATCH /api/v1/users/{user_id}/status
   */
  async updateUserStatus(userId: string, payload: UserStatusPayload): Promise<AdminUserItem> {
    const response = await apiClient.patch<AdminUserItem>(`/users/${userId}/status`, payload);
    return response.data;
  },

  /**
   * Lists roles catalog
   * GET /api/v1/roles
   */
  async listRoles(page = 1, size = 50): Promise<PaginatedResponse<RoleCatalogItem>> {
    const response = await apiClient.get<PaginatedResponse<RoleCatalogItem>>("/roles", {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Lists permissions catalog
   * GET /api/v1/permissions
   */
  async listPermissions(
    page = 1,
    size = 50
  ): Promise<PaginatedResponse<PermissionCatalogItem>> {
    const response = await apiClient.get<PaginatedResponse<PermissionCatalogItem>>(
      "/permissions",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Assigns an existing role to a user
   * PUT /api/v1/users/{user_id}/roles
   */
  async assignUserRole(userId: string, roleCode: string): Promise<SuccessResponse> {
    const response = await apiClient.put<SuccessResponse>(`/users/${userId}/roles`, {
      role_code: roleCode,
    });
    return response.data;
  },

  /**
   * Revokes a role from a user
   * DELETE /api/v1/users/{user_id}/roles/{role_code}
   */
  async revokeUserRole(userId: string, roleCode: string): Promise<SuccessResponse> {
    const response = await apiClient.delete<SuccessResponse>(
      `/users/${userId}/roles/${encodeURIComponent(roleCode)}`
    );
    return response.data;
  },

  /**
   * Lists security and audit events with filters
   * GET /api/v1/audit/events
   */
  async listAuditEvents(
    params: ListAuditEventsParams = {}
  ): Promise<PaginatedResponse<AuditEventRecord>> {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      size: params.size ?? 20,
    };
    if (params.event_type?.trim()) query.event_type = params.event_type.trim();
    if (params.actor_user_id?.trim()) query.actor_user_id = params.actor_user_id.trim();
    if (params.target_user_id?.trim()) query.target_user_id = params.target_user_id.trim();
    if (params.from_at) query.from_at = params.from_at;
    if (params.to_at) query.to_at = params.to_at;

    const response = await apiClient.get<PaginatedResponse<AuditEventRecord>>("/audit/events", {
      params: query,
    });
    return response.data;
  },
};
