import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InviteClinicianDialog } from "@/features/admin/components/InviteClinicianDialog";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe("InviteClinicianDialog Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <InviteClinicianDialog isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders form inputs when isOpen is true", () => {
    render(<InviteClinicianDialog isOpen={true} onClose={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: /Invitar Facultativo al Nodo Clínico/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico Institucional/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellidos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rol Clínico \/ Nivel de Privilegios/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Emitir Invitación Clínica/i })
    ).toBeInTheDocument();
  });

  it("displays validation errors when submitting with empty required fields", async () => {
    render(<InviteClinicianDialog isOpen={true} onClose={vi.fn()} />);

    const submitBtn = screen.getByRole("button", { name: /Emitir Invitación Clínica/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/El correo electrónico es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/El nombre es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/Los apellidos son obligatorios/i)).toBeInTheDocument();
    });
  });

  it("successfully submits invitation and displays activation token", async () => {
    render(<InviteClinicianDialog isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Correo Electrónico Institucional/i), {
      target: { value: "dr.garcia@hospital.org" },
    });
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: "Carlos" },
    });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), {
      target: { value: "García Navas" },
    });

    const submitBtn = screen.getByRole("button", { name: /Emitir Invitación Clínica/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invitación emitida exitosamente/i)).toBeInTheDocument();
      expect(screen.getByText("mock-invitation-token-uuid-1234")).toBeInTheDocument();
    });
  });

  it("displays error message if clinician email is already registered", async () => {
    render(<InviteClinicianDialog isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Correo Electrónico Institucional/i), {
      target: { value: "already.invited@hospital.org" },
    });
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: "Laura" },
    });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), {
      target: { value: "Méndez" },
    });

    const submitBtn = screen.getByRole("button", { name: /Emitir Invitación Clínica/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/El usuario ya ha sido invitado o registrado/i)
      ).toBeInTheDocument();
    });
  });
});
