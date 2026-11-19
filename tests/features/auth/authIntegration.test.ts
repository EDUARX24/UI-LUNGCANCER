import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "@/features/auth/services/auth.service";
import { setAuthTokens, getAccessToken, getCsrfToken } from "@/lib/api/client";

describe("Auth Integration Tests (MSW End-to-End Handshake)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    setAuthTokens(null, null);
  });

  it("completes full login handshake and updates storage", async () => {
    const tokens = await authService.login({
      email: "doctor@hospital.org",
      password: "Password123!",
    });

    expect(tokens.access_token).toBe("mock-jwt-access-token-999");
    expect(tokens.csrf_token).toBe("mock-csrf-token-111");
    expect(getAccessToken()).toBe("mock-jwt-access-token-999");
    expect(getCsrfToken()).toBe("mock-csrf-token-111");
  });

  it("throws 401 error on invalid credentials", async () => {
    await expect(
      authService.login({
        email: "wrong@hospital.org",
        password: "BadPassword123!",
      })
    ).rejects.toThrow();
  });

  it("throws 403 error on inactive account", async () => {
    await expect(
      authService.login({
        email: "inactive@hospital.org",
        password: "Password123!",
      })
    ).rejects.toThrow();
  });

  it("fetches authenticated user profile when token is active", async () => {
    setAuthTokens("mock-jwt-access-token-999", "mock-csrf-token-111");

    const user = await authService.getCurrentUser();
    expect(user.email).toBe("doctor@hospital.org");
    expect(user.roles).toContain("RADIOLOGIST");
    expect(user.first_name).toBe("Ana");
  });

  it("renews tokens via /auth/refresh with CSRF token", async () => {
    setAuthTokens("mock-jwt-access-token-999", "mock-csrf-token-111");

    const refreshed = await authService.refreshToken();
    expect(refreshed.access_token).toBe("new-mock-refreshed-jwt-token-888");
    expect(refreshed.csrf_token).toBe("new-mock-csrf-token-222");
    expect(getAccessToken()).toBe("new-mock-refreshed-jwt-token-888");
  });

  it("clears local tokens upon logout", async () => {
    setAuthTokens("mock-jwt-access-token-999", "mock-csrf-token-111");
    expect(getAccessToken()).not.toBeNull();

    await authService.logout();
    expect(getAccessToken()).toBeNull();
    expect(getCsrfToken()).toBeNull();
  });

  it("executes forgot-password request successfully", async () => {
    const res = await authService.forgotPassword({
      email: "doctor@hospital.org",
    });
    expect(res.message).toContain("enlace de recuperación");
  });

  it("rejects reset-password with expired token", async () => {
    await expect(
      authService.resetPassword({
        token: "expired-token",
        password: "NewPassword123!",
      })
    ).rejects.toThrow();
  });

  it("rejects activate-account with invalid token", async () => {
    await expect(
      authService.activateAccount({
        token: "invalid-token",
        password: "NewPassword123!",
      })
    ).rejects.toThrow();
  });

  it("verifies health check connectivity", async () => {
    const health = await authService.checkHealth();
    expect(health.status).toBe("healthy");
    expect(health.service).toBe("lungseg-api");
  });
});
