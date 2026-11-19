import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute";
import * as AuthContextModule from "@/features/auth/context/AuthContext";

describe("Route Guards", () => {
  it("redirects unauthenticated users to /login when accessing ProtectedRoute", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      logoutAll: vi.fn(),
      refreshToken: vi.fn(),
      refetchUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/session"]}>
        <Routes>
          <Route
            path="/session"
            element={
              <ProtectedRoute>
                <div>Contenido Privado</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Pantalla Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Pantalla Login")).toBeInTheDocument();
    expect(screen.queryByText("Contenido Privado")).not.toBeInTheDocument();
  });

  it("renders private content when authenticated in ProtectedRoute", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: "usr-1",
        email: "doctor@hospital.org",
        first_name: "Ana",
        last_name: "Valero",
        roles: ["RADIOLOGIST"],
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      logoutAll: vi.fn(),
      refreshToken: vi.fn(),
      refetchUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/session"]}>
        <Routes>
          <Route
            path="/session"
            element={
              <ProtectedRoute>
                <div>Contenido Privado</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Contenido Privado")).toBeInTheDocument();
  });

  it("redirects to /forbidden if user lacks required role", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: "usr-1",
        email: "paciente@hospital.org",
        first_name: "Juan",
        last_name: "Perez",
        roles: ["PATIENT"],
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      logoutAll: vi.fn(),
      refreshToken: vi.fn(),
      refetchUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/radiology"]}>
        <Routes>
          <Route
            path="/radiology"
            element={
              <ProtectedRoute requiredRoles={["RADIOLOGIST", "ADMIN"]}>
                <div>Estación Radiológica</div>
              </ProtectedRoute>
            }
          />
          <Route path="/forbidden" element={<div>Acceso Denegado 403</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Acceso Denegado 403")).toBeInTheDocument();
  });

  it("redirects authenticated users away from PublicOnlyRoute to /session", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: "usr-1",
        email: "doctor@hospital.org",
        first_name: "Ana",
        last_name: "Valero",
        roles: ["RADIOLOGIST"],
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      logoutAll: vi.fn(),
      refreshToken: vi.fn(),
      refetchUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <div>Formulario Login</div>
              </PublicOnlyRoute>
            }
          />
          <Route path="/session" element={<div>Sesión Activa</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Sesión Activa")).toBeInTheDocument();
    expect(screen.queryByText("Formulario Login")).not.toBeInTheDocument();
  });
});
