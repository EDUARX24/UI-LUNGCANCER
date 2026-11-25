import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserDetailPage } from "@/features/admin/pages/UserDetailPage";

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

function renderUserDetail(userId = "11111111-1111-1111-1111-111111111111") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/admin/users/${userId}`]}>
        <Routes>
          <Route path="/admin/users/:userId" element={<UserDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("UserDetailPage Component", () => {
  it("renders user dossier, editable fields, and assigned roles", async () => {
    renderUserDetail();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Carlos Mendoza/i })).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/^Nombre$/i)).toHaveValue("Carlos");
    expect(screen.getByLabelText(/^Apellidos$/i)).toHaveValue("Mendoza");
    expect(screen.getByLabelText(/Correo Electrónico Institucional/i)).toHaveValue(
      "c.mendoza@hcsancarlos.es"
    );
    expect(screen.getByText("RADIOLOGIST")).toBeInTheDocument();
  });

  it("submits profile update via PATCH /api/v1/users/{user_id}", async () => {
    renderUserDetail();

    await waitFor(() => {
      expect(screen.getByLabelText(/^Nombre$/i)).toHaveValue("Carlos");
    });

    fireEvent.change(screen.getByLabelText(/^Nombre$/i), {
      target: { value: "Carlos Alberto" },
    });

    const saveBtn = screen.getByRole("button", { name: /Actualizar Datos/i });
    expect(saveBtn).not.toBeDisabled();
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Carlos Alberto Mendoza/i })
      ).toBeInTheDocument();
    });
  });

  it("displays user audit events when switching to Auditoría tab", async () => {
    renderUserDetail();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Carlos Mendoza/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Auditoría del Usuario/i }));

    await waitFor(() => {
      expect(screen.getByText("ROLE_ASSIGNED")).toBeInTheDocument();
      expect(screen.getByText("account.login")).toBeInTheDocument();
    });
  });
});
