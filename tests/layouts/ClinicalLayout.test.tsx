import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ClinicalLayout } from "@/app/layouts/ClinicalLayout";

const mockUseAuth = vi.fn();

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ClinicalLayout Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders clinical sidebar brand, navigation links, and telemetry for ADMIN", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "u-1",
        email: "dr.valero@hospital.es",
        first_name: "Antonio",
        last_name: "Valero",
        roles: ["ADMIN", "RADIOLOGIST"],
      },
      logout: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<ClinicalLayout />}>
            <Route path="/admin" element={<div>Contenido del Panel</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Brand
    expect(screen.getByText(/PulmoScan/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Console/i)).toBeInTheDocument();

    // Navigation links for Admin
    expect(screen.getByText(/Panel Principal/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestión de Estudios TC/i)).toBeInTheDocument();
    expect(screen.getByText(/Segmentación IA & Modelos/i)).toBeInTheDocument();
    expect(screen.getByText(/Nodos PACS \/ DICOM/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuarios & Roles Clínicos/i)).toBeInTheDocument();
    expect(screen.getByText(/Sesión Técnica \(JWT\/CSRF\)/i)).toBeInTheDocument();

    // Telemetry widget for Admin
    expect(screen.getByText(/Telemetría Nodo/i)).toBeInTheDocument();
    expect(screen.getByText(/A100 ON/i)).toBeInTheDocument();
    expect(screen.getByText(/CPU EPYC/i)).toBeInTheDocument();
    expect(screen.getByText(/VRAM GPU/i)).toBeInTheDocument();

    // Header context
    expect(
      screen.getByText(/Hospital Clínico San Carlos · Nodo DICOM Principal/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/PACS ONLINE · TLS 1.3/i)).toBeInTheDocument();

    // User chip
    expect(screen.getByText("Antonio Valero")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();

    // Nested outlet content
    expect(screen.getByText("Contenido del Panel")).toBeInTheDocument();
  });

  it("renders patient-specific portal, hides hardware telemetry and admin modules for PATIENT", () => {
    mockUseAuth.mockReturnValue({
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
    });

    render(
      <MemoryRouter initialEntries={["/my-studies"]}>
        <Routes>
          <Route element={<ClinicalLayout />}>
            <Route path="/my-studies" element={<div>Mis Estudios</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Patient brand subtitle
    expect(screen.getAllByText(/Portal del Paciente/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/Admin Console/i)).not.toBeInTheDocument();

    // Patient navigation
    expect(screen.getByText(/Servicios del Paciente/i)).toBeInTheDocument();
    expect(screen.getByText(/Mis Estudios e Informes TC/i)).toBeInTheDocument();
    expect(screen.getByText(/Mi Perfil & Seguridad/i)).toBeInTheDocument();

    // Admin tools must be hidden
    expect(screen.queryByText(/Panel Principal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nodos PACS \/ DICOM/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Usuarios & Roles Clínicos/i)).not.toBeInTheDocument();

    // Hardware telemetry must be hidden
    expect(screen.queryByText(/Telemetría Nodo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/CPU EPYC/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/VRAM GPU/i)).not.toBeInTheDocument();

    // Patient security badge
    expect(screen.getByText(/Cifrado E2EE Activo/i)).toBeInTheDocument();
    expect(screen.getByText(/Historial Médico Protegido/i)).toBeInTheDocument();

    // Topbar context
    expect(
      screen.getByText(/Hospital Clínico San Carlos · Portal del Paciente/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/CONEXIÓN SEGURA · TLS 1.3/i)).toBeInTheDocument();
    expect(screen.getByText("Alejandra Larios")).toBeInTheDocument();
    expect(screen.getByText("PATIENT")).toBeInTheDocument();
  });

  it("toggles mobile navigation drawer and mobile search bar cleanly", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "u-1",
        email: "dr.valero@hospital.es",
        first_name: "Antonio",
        last_name: "Valero",
        roles: ["ADMIN"],
      },
      logout: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<ClinicalLayout />}>
            <Route path="/admin" element={<div>Contenido del Panel</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const openMenuBtn = screen.getByRole("button", { name: /Abrir menú de navegación/i });
    const closeMenuBtn = screen.getByRole("button", { name: /Cerrar menú de navegación/i });
    const sidebar = screen.getByLabelText(/Navegación clínica/i);

    expect(openMenuBtn).toHaveAttribute("aria-expanded", "false");
    expect(sidebar).toHaveClass("-translate-x-full");

    fireEvent.click(openMenuBtn);
    expect(openMenuBtn).toHaveAttribute("aria-expanded", "true");
    expect(sidebar).toHaveClass("translate-x-0");

    fireEvent.click(closeMenuBtn);
    expect(openMenuBtn).toHaveAttribute("aria-expanded", "false");
    expect(sidebar).toHaveClass("-translate-x-full");

    // Reopen and close via Escape key
    fireEvent.click(openMenuBtn);
    expect(sidebar).toHaveClass("translate-x-0");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(sidebar).toHaveClass("-translate-x-full");

    // Mobile search toggle
    const searchToggle = screen.getByRole("button", { name: /^Buscar$/i });
    expect(screen.getAllByPlaceholderText(/Buscar estudios, radiólogos, nodos/i)).toHaveLength(1);
    fireEvent.click(searchToggle);
    expect(screen.getAllByPlaceholderText(/Buscar estudios, radiólogos, nodos/i)).toHaveLength(2);
  });
});
