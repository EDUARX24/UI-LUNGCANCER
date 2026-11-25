import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuditEventsPage } from "@/features/admin/pages/AuditEventsPage";

describe("AuditEventsPage Component", () => {
  it("renders audit events and filters by event_type", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AuditEventsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("ROLE_ASSIGNED")).toBeInTheDocument();
      expect(screen.getByText("account.login")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Filtrar por tipo de evento/i), {
      target: { value: "ROLE_ASSIGNED" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Filtrar$/i }));

    await waitFor(() => {
      expect(screen.getByText("ROLE_ASSIGNED")).toBeInTheDocument();
      expect(screen.queryByText("account.login")).not.toBeInTheDocument();
    });
  });
});
