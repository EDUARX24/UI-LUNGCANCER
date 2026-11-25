import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionPage } from "@/features/auth/pages/SessionPage";
import { setAuthTokens } from "@/lib/api/client";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: () => ({
    logout: vi.fn(),
    logoutAll: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SessionPage Component", () => {
  beforeEach(() => {
    setAuthTokens("mock-jwt-access-token-999", "mock-csrf-token-111");
  });

  it("renders user profile, database readiness, and active sessions", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <SessionPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Ana Valero")).toBeInTheDocument();
      expect(screen.getByText(/PostgreSQL Neon: READY/i)).toBeInTheDocument();
      expect(screen.getByText("192.168.20.104")).toBeInTheDocument();
      expect(screen.getByText("10.200.4.22")).toBeInTheDocument();
    });

    const revokeButtons = screen.getAllByRole("button", { name: /Revocar/i });
    expect(revokeButtons).toHaveLength(2);
    fireEvent.click(revokeButtons[1]);
  });
});
