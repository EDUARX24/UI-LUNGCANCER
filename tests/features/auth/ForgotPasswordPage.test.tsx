import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";

describe("ForgotPasswordPage Component", () => {
  it("renders form elements and recovery text", () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Recuperar contraseña/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico institucional/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar instrucciones/i })).toBeInTheDocument();
    expect(screen.getByText(/Volver al inicio de sesión/i)).toBeInTheDocument();
  });

  it("submits valid email and shows confirmation state", async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <ForgotPasswordPage onSubmitMock={mockSubmit} />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Correo electrónico institucional/i);
    const submitBtn = screen.getByRole("button", { name: /Enviar instrucciones/i });

    fireEvent.change(emailInput, { target: { value: "dr.garcia@hospital-salud.org" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({ email: "dr.garcia@hospital-salud.org" });
      expect(screen.getByText(/Enlace de recuperación emitido/i)).toBeInTheDocument();
    });
  });
});
