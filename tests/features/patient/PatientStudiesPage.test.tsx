import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PatientStudiesPage } from "@/features/patient/pages/PatientStudiesPage";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "u-2",
      email: "alejandra@paciente.es",
      first_name: "Alejandra",
      last_name: "Larios",
      roles: ["PATIENT"],
    },
    logout: vi.fn(),
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

describe("PatientStudiesPage Component", () => {
  it("renders patient welcome, studies list, and report download buttons", () => {
    render(
      <MemoryRouter>
        <PatientStudiesPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /Mis Estudios TC e Informes Clínicos/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Alejandra Larios/i)).toBeInTheDocument();
    expect(screen.getByText("TC-2024-8898")).toBeInTheDocument();
    expect(screen.getByText(/Informe Validado/i)).toBeInTheDocument();
    expect(screen.getByText(/TC-2024-7102/i)).toBeInTheDocument();

    const downloadButtons = screen.getAllByRole("button", { name: /Descargar Informe \(PDF\)/i });
    expect(downloadButtons.length).toBeGreaterThan(0);
    fireEvent.click(downloadButtons[0]);
  });
});
