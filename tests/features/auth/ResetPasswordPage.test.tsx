import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";

describe("ResetPasswordPage Component", () => {
  it("renders reset password form fields and checklist", () => {
    render(
      <MemoryRouter initialEntries={["/reset-password?token=valid-test-token-1234"]}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Establecer nueva contraseña/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirmar nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByText(/Parámetros Criptográficos/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guardar nueva contraseña/i })).toBeInTheDocument();
  });

  it("submits passwords matching requirements and shows success", async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={["/reset-password?token=valid-test-token-1234"]}>
        <ResetPasswordPage onSubmitMock={mockSubmit} />
      </MemoryRouter>
    );

    const newPassInput = screen.getByLabelText(/^Nueva contraseña/i);
    const confirmPassInput = screen.getByLabelText(/^Confirmar nueva contraseña/i);
    const submitBtn = screen.getByRole("button", { name: /Guardar nueva contraseña/i });

    fireEvent.change(newPassInput, { target: { value: "SecurePass123!" } });
    fireEvent.change(confirmPassInput, { target: { value: "SecurePass123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        token: "valid-test-token-1234",
        password: "SecurePass123!",
      });
      expect(screen.getByText(/Contraseña Actualizada con Éxito/i)).toBeInTheDocument();
    });
  });
});
