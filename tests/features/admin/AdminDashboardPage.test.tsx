import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminDashboardPage Component", () => {
  it("renders clinical command bar, status badge and action buttons", () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /Panel de Control de Administración Clínica/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/ENLACE DICOM ACTIVO/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\+ Invitar Facultativo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reiniciar Inferencia/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Exportar Informe de Auditoría/i })
    ).toBeInTheDocument();
  });

  it("renders all 4 clinical KPIs with accurate values and badges", () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    // KPI 1
    expect(screen.getByText(/Estudios TC Procesados Hoy/i)).toBeInTheDocument();
    expect(screen.getByText("1,428")).toBeInTheDocument();
    expect(screen.getByText(/\+12.4%/i)).toBeInTheDocument();
    expect(screen.getByText("99.4%")).toBeInTheDocument();

    // KPI 2
    expect(screen.getByText(/Nódulos Detectados/i)).toBeInTheDocument();
    expect(screen.getByText("384")).toBeInTheDocument();
    expect(screen.getByText(/48 Malignidad >65%/i)).toBeInTheDocument();

    // KPI 3
    expect(screen.getByText(/Latencia Media PACS DICOM/i)).toBeInTheDocument();
    expect(screen.getByText("18.2 ms")).toBeInTheDocument();
    expect(screen.getByText("4.8 Gbps")).toBeInTheDocument();

    // KPI 4
    expect(screen.getByText(/GPU Cluster \(4x A100\)/i)).toBeInTheDocument();
    expect(screen.getByText("68%")).toBeInTheDocument();
    expect(screen.getByText(/320\/500 GB VRAM/i)).toBeInTheDocument();
  });

  it("renders 24h performance chart and allows toggling range tabs", () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Rendimiento de Inferencia & Volumen TC/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/3.2 seg/i)).toBeInTheDocument();

    const tab7d = screen.getByRole("button", { name: "7D" });
    fireEvent.click(tab7d);
    expect(tab7d).toHaveClass("text-[#fafafa]");
  });

  it("renders real-time studies queue worklist table", () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Cola de Estudios TC en Tiempo Real/i)).toBeInTheDocument();
    expect(screen.getByText("TC-2024-8901")).toBeInTheDocument();
    expect(screen.getByText("NHC-***9421")).toBeInTheDocument();
    expect(screen.getByText("TC-2024-8902")).toBeInTheDocument();
    expect(screen.getByText("TC-2024-8898")).toBeInTheDocument();
  });

  it("renders DICOM infrastructure health and live audit stream", () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Infraestructura & Servicios DICOM/i)).toBeInTheDocument();
    expect(screen.getByText(/PACS Central Hospitalario/i)).toBeInTheDocument();
    expect(screen.getByText(/Motor ResNet-UNet 3D/i)).toBeInTheDocument();
    expect(screen.getByText(/Filtro Anonimizador RGPD\/HIPAA/i)).toBeInTheDocument();
    expect(screen.getByText(/Registro Clínico & Alertas/i)).toBeInTheDocument();
    expect(screen.getByText(/C-ECHO Diagnostic Sweep/i)).toBeInTheDocument();
  });

  it("opens the clinician invitation modal when clicking '+ Invitar Facultativo'", () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    const inviteBtn = screen.getByRole("button", { name: /\+ Invitar Facultativo/i });
    fireEvent.click(inviteBtn);

    expect(
      screen.getByRole("heading", { name: /Invitar Facultativo al Nodo Clínico/i })
    ).toBeInTheDocument();
  });
});
