import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UsersDirectoryPage } from "@/features/admin/pages/UsersDirectoryPage";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "admin-001",
      email: "admin@hcsancarlos.es",
      first_name: "Antonio",
      last_name: "Valero",
      roles: ["ADMIN"],
    },
    isAuthenticated: true,
    isLoading: false,
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

function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("UsersDirectoryPage Component", () => {
  it("loads and renders clinical users from GET /api/v1/users", async () => {
    renderWithProviders(<UsersDirectoryPage />);

    expect(
      screen.getByRole("heading", { name: /Directorio de Usuarios Clínicos/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Carlos Mendoza")).toBeInTheDocument();
      expect(screen.getByText("c.mendoza@hcsancarlos.es")).toBeInTheDocument();
      expect(screen.getByText("Marcos Figueroa")).toBeInTheDocument();
    });

    expect(screen.getByText(/2 usuarios/i)).toBeInTheDocument();
  });

  it("filters users by status via GET /api/v1/users?status=suspended", async () => {
    renderWithProviders(<UsersDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Carlos Mendoza")).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText(/Filtrar por estado/i);
    fireEvent.change(statusSelect, { target: { value: "suspended" } });

    await waitFor(() => {
      expect(screen.queryByText("Carlos Mendoza")).not.toBeInTheDocument();
      expect(screen.getByText("Marcos Figueroa")).toBeInTheDocument();
    });
  });

  it("opens InviteClinicianDialog when clicking '+ Invitar Facultativo'", async () => {
    renderWithProviders(<UsersDirectoryPage />);

    fireEvent.click(screen.getByRole("button", { name: /\+ Invitar Facultativo/i }));

    expect(
      screen.getByRole("heading", { name: /Invitar Facultativo al Nodo Clínico/i })
    ).toBeInTheDocument();
  });
});
