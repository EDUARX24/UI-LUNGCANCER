import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "@/features/auth/services/auth.service";
import { apiClient, setAuthTokens, getAccessToken, getCsrfToken } from "@/lib/api/client";

describe("authService and apiClient integration", () => {
  beforeEach(() => {
    sessionStorage.clear();
    setAuthTokens(null, null);
  });

  it("manages tokens correctly in client storage and memory", () => {
    expect(getAccessToken()).toBeNull();
    expect(getCsrfToken()).toBeNull();

    setAuthTokens("test-jwt-token-123", "test-csrf-token-456");

    expect(getAccessToken()).toBe("test-jwt-token-123");
    expect(getCsrfToken()).toBe("test-csrf-token-456");
    expect(sessionStorage.getItem("access_token")).toBe("test-jwt-token-123");
    expect(sessionStorage.getItem("csrf_token")).toBe("test-csrf-token-456");

    setAuthTokens(null, null);
    expect(getAccessToken()).toBeNull();
    expect(getCsrfToken()).toBeNull();
  });

  it("has apiClient configured with credentials and standard timeout", () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
    expect(apiClient.defaults.timeout).toBe(20000);
  });

  it("exposes all required auth methods", () => {
    expect(typeof authService.login).toBe("function");
    expect(typeof authService.refreshToken).toBe("function");
    expect(typeof authService.getCsrfToken).toBe("function");
    expect(typeof authService.getCurrentUser).toBe("function");
    expect(typeof authService.logout).toBe("function");
    expect(typeof authService.logoutAll).toBe("function");
    expect(typeof authService.forgotPassword).toBe("function");
    expect(typeof authService.resetPassword).toBe("function");
    expect(typeof authService.activateAccount).toBe("function");
    expect(typeof authService.checkHealth).toBe("function");
  });
});
