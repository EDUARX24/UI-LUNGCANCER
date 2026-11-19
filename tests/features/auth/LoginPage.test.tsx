import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";

describe("LoginPage Component", () => {
  it("renders login form fields and branding", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mantener sesión iniciada/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByText(/Nodo DICOM PACS · Conectado/i)).toBeInTheDocument();
  });

  it("toggles password visibility when clicking eye button", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText("••••••••••••");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /Ver contraseña/i });
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("displays validation error if email is invalid", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const submitBtn = screen.getByRole("button", { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Ingresa un correo electrónico institucional válido/i)).toBeInTheDocument();
    });
  });

  it("calls onSubmitMock on valid form submission", async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <LoginPage onSubmitMock={mockSubmit} />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const passwordInput = screen.getByPlaceholderText("••••••••••••");
    const submitBtn = screen.getByRole("button", { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: "doctor@hospital.org" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "doctor@hospital.org",
          password: "Password123!",
        })
      );
    });
  });
});
