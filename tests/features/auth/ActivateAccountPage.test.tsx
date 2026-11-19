import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ActivateAccountPage } from "@/features/auth/pages/ActivateAccountPage";

describe("ActivateAccountPage Component", () => {
  it("renders activation layout and fields", () => {
    render(
      <MemoryRouter initialEntries={["/activate?token=RAD-INVITE-9901"]}>
        <ActivateAccountPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Activación y Desbloqueo de Credencial Clínica/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Código de Asignación Hospitalaria o Token/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nueva Contraseña Criptográfica/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Verificar y Activar Credencial/i })).toBeInTheDocument();
  });

  it("submits valid activation payload and shows success card", async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={["/activate?token=RAD-INVITE-9901"]}>
        <ActivateAccountPage onSubmitMock={mockSubmit} />
      </MemoryRouter>
    );

    const passInput = screen.getByLabelText(/Nueva Contraseña Criptográfica/i);
    const confirmInput = screen.getByLabelText(/Confirmar Contraseña/i);
    const submitBtn = screen.getByRole("button", { name: /Verificar y Activar Credencial/i });

    fireEvent.change(passInput, { target: { value: "HospitalRadiology2026!" } });
    fireEvent.change(confirmInput, { target: { value: "HospitalRadiology2026!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          token: "RAD-INVITE-9901",
          password: "HospitalRadiology2026!",
        })
      );
      expect(screen.getByText(/Credencial Facultativa Activada con Éxito/i)).toBeInTheDocument();
    });
  });
});
