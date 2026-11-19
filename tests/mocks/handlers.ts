import { http, HttpResponse } from "msw";

export const handlers = [
  // Health
  http.get("*/health", () => {
    return HttpResponse.json({
      status: "healthy",
      service: "lungseg-api",
    });
  }),

  // Login
  http.post("*/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email === "doctor@hospital.org" && body.password === "Password123!") {
      return HttpResponse.json({
        access_token: "mock-jwt-access-token-999",
        token_type: "bearer",
        expires_in: 900,
        csrf_token: "mock-csrf-token-111",
      });
    }
    if (body.email === "inactive@hospital.org") {
      return HttpResponse.json(
        { message: "Tu cuenta está inactiva o requiere activación." },
        { status: 403 }
      );
    }
    return HttpResponse.json(
      { message: "Credenciales inválidas." },
      { status: 401 }
    );
  }),

  // Refresh
  http.post("*/auth/refresh", ({ request }) => {
    const csrfHeader = request.headers.get("X-CSRF-Token");
    if (!csrfHeader || csrfHeader === "invalid-csrf") {
      return HttpResponse.json(
        { message: "Validación CSRF fallida o token revocado." },
        { status: 403 }
      );
    }
    return HttpResponse.json({
      access_token: "new-mock-refreshed-jwt-token-888",
      token_type: "bearer",
      expires_in: 900,
      csrf_token: "new-mock-csrf-token-222",
    });
  }),

  // Me
  http.get("*/auth/me", ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.includes("mock-jwt-access-token") || authHeader?.includes("new-mock-refreshed-jwt-token")) {
      return HttpResponse.json({
        data: {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          email: "doctor@hospital.org",
          first_name: "Ana",
          last_name: "Valero",
          roles: ["RADIOLOGIST"],
        },
        message: "Información obtenida correctamente.",
      });
    }
    return HttpResponse.json(
      { message: "No autorizado." },
      { status: 401 }
    );
  }),

  // Logout
  http.post("*/auth/logout", () => {
    return HttpResponse.json({
      data: {},
      message: "Sesión cerrada correctamente.",
    });
  }),

  // Logout All
  http.post("*/auth/logout-all", () => {
    return HttpResponse.json({
      data: {},
      message: "Todas las sesiones han sido cerradas correctamente.",
    });
  }),

  // Forgot Password
  http.post("*/auth/forgot-password", () => {
    return HttpResponse.json({
      data: {},
      message: "Si la cuenta existe, se ha enviado un enlace de recuperación.",
    });
  }),

  // Reset Password
  http.post("*/auth/reset-password", async ({ request }) => {
    const body = (await request.json()) as { token?: string };
    if (body.token === "expired-token") {
      return HttpResponse.json(
        { message: "El token de recuperación es inválido o ha expirado." },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      data: {},
      message: "Contraseña restablecida correctamente.",
    });
  }),

  // Activate Account
  http.post("*/auth/activate-account", async ({ request }) => {
    const body = (await request.json()) as { token?: string };
    if (body.token === "invalid-token") {
      return HttpResponse.json(
        { message: "El token de activación es inválido o ha expirado." },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      data: {},
      message: "Cuenta activada correctamente.",
    });
  }),

  // Invitations
  http.post("*/auth/invitations", async ({ request }) => {
    const body = (await request.json()) as { email?: string; first_name?: string; last_name?: string };
    if (!body.email) {
      return HttpResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Email es obligatorio." } },
        { status: 422 }
      );
    }
    if (body.email === "already.invited@hospital.org") {
      return HttpResponse.json(
        { error: { code: "CONFLICT", message: "El usuario ya ha sido invitado o registrado." } },
        { status: 409 }
      );
    }
    return HttpResponse.json(
      {
        data: {
          invitation_token: "mock-invitation-token-uuid-1234",
          expires_at: "2026-11-25T12:00:00Z",
        },
        message: "Invitación emitida y enviada al correo correctamente.",
      },
      { status: 201 }
    );
  }),

  // Assign user role
  http.put("*/auth/users/:userId/roles", async ({ params, request }) => {
    const { userId } = params;
    const body = (await request.json()) as { role_code?: string };
    return HttpResponse.json({
      data: { user_id: userId, role: body.role_code },
      message: "Rol asignado correctamente.",
    });
  }),
];
