import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RolesPermissionsPage } from "@/features/admin/pages/RolesPermissionsPage";

describe("RolesPermissionsPage Component", () => {
  it("loads and renders roles and permissions catalogs from API", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <RolesPermissionsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("heading", { name: /Catálogo de Roles y Permisos RBAC/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("ADMIN")).toBeInTheDocument();
      expect(screen.getByText("RADIOLOGIST")).toBeInTheDocument();
      expect(screen.getByText("PATIENT")).toBeInTheDocument();
      expect(screen.getByText("users:read")).toBeInTheDocument();
      expect(screen.getByText("audit:read")).toBeInTheDocument();
    });
  });
});
