import { http, HttpResponse } from "msw";

export const handlers = [
  // Health & Readiness
  http.get("*/health", () => {
    return HttpResponse.json({
      status: "healthy",
      service: "lungseg-api",
    });
  }),

  http.get("*/ready", () => {
    return HttpResponse.json({
      status: "ready",
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

  // Assign user role (legacy auth path & new roles path)
  http.put("*/auth/users/:userId/roles", async ({ params, request }) => {
    const { userId } = params;
    const body = (await request.json()) as { role_code?: string };
    return HttpResponse.json({
      data: { user_id: userId, role_code: body.role_code },
      message: "Rol asignado correctamente.",
    });
  }),

  http.put("*/users/:userId/roles", async ({ params, request }) => {
    const { userId } = params;
    const body = (await request.json()) as { role_code?: string };
    return HttpResponse.json({
      data: { user_id: userId, role_code: body.role_code },
      message: "Rol asignado correctamente.",
    });
  }),

  http.delete("*/users/:userId/roles/:roleCode", ({ params }) => {
    return HttpResponse.json({
      data: { user_id: params.userId, role_code: params.roleCode },
      message: "Rol revocado correctamente.",
    });
  }),

  // Auth Sessions
  http.get("*/auth/sessions", () => {
    return HttpResponse.json({
      data: [
        {
          id: "sess-1",
          created_at: "2026-11-25T08:30:00Z",
          expires_at: "2026-12-02T08:30:00Z",
          revoked_at: null,
          last_used_at: "2026-11-25T13:50:00Z",
          ip_address: "192.168.20.104",
          user_agent: "Chrome 131 · Windows 11",
          is_current: true,
        },
        {
          id: "sess-2",
          created_at: "2026-11-24T10:00:00Z",
          expires_at: "2026-12-01T10:00:00Z",
          revoked_at: null,
          last_used_at: "2026-11-24T18:15:00Z",
          ip_address: "10.200.4.22",
          user_agent: "Firefox 132 · Ubuntu 22.04",
          is_current: false,
        },
      ],
      message: "Sesiones obtenidas correctamente.",
    });
  }),

  http.delete("*/auth/sessions/:sessionId", () => {
    return HttpResponse.json({
      data: {},
      message: "Sesión revocada correctamente.",
    });
  }),

  // Admin Users Directory
  http.get("*/users", ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get("search") || "").toLowerCase();
    const status = url.searchParams.get("status") || "";
    const role = url.searchParams.get("role") || "";
    const page = Number(url.searchParams.get("page") || "1");
    const size = Number(url.searchParams.get("size") || "20");

    const allUsers = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        email: "c.mendoza@hcsancarlos.es",
        first_name: "Carlos",
        last_name: "Mendoza",
        status: "active",
        email_verified_at: "2026-11-20T09:00:00Z",
        last_login_at: "2026-11-25T12:00:00Z",
        created_at: "2026-11-18T10:00:00Z",
        updated_at: "2026-11-25T12:00:00Z",
        roles: ["RADIOLOGIST"],
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        email: "m.figueroa@hcsancarlos.es",
        first_name: "Marcos",
        last_name: "Figueroa",
        status: "suspended",
        email_verified_at: "2026-11-19T09:00:00Z",
        last_login_at: null,
        created_at: "2026-11-17T10:00:00Z",
        updated_at: "2026-11-24T15:00:00Z",
        roles: ["PATIENT"],
      },
    ];

    const filtered = allUsers.filter((u) => {
      if (status && u.status !== status) return false;
      if (role && !u.roles.includes(role)) return false;
      if (
        search &&
        !`${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search)
      ) {
        return false;
      }
      return true;
    });

    return HttpResponse.json({
      data: filtered,
      total: filtered.length,
      page,
      size,
    });
  }),

  http.get("*/users/:userId", ({ params }) => {
    return HttpResponse.json({
      id: params.userId,
      email: "c.mendoza@hcsancarlos.es",
      first_name: "Carlos",
      last_name: "Mendoza",
      status: "active",
      email_verified_at: "2026-11-20T09:00:00Z",
      last_login_at: "2026-11-25T12:00:00Z",
      created_at: "2026-11-18T10:00:00Z",
      updated_at: "2026-11-25T12:00:00Z",
      roles: ["RADIOLOGIST"],
    });
  }),

  http.patch("*/users/:userId", async ({ params, request }) => {
    const body = (await request.json()) as {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
    if (body.email === "conflict@hcsancarlos.es") {
      return HttpResponse.json(
        {
          error: {
            code: "RESOURCE_CONFLICT",
            message: "La operación entra en conflicto con el estado del recurso.",
          },
        },
        { status: 409 }
      );
    }
    return HttpResponse.json({
      id: params.userId,
      email: body.email || "c.mendoza@hcsancarlos.es",
      first_name: body.first_name || "Carlos",
      last_name: body.last_name || "Mendoza",
      status: "active",
      email_verified_at: "2026-11-20T09:00:00Z",
      last_login_at: "2026-11-25T12:00:00Z",
      created_at: "2026-11-18T10:00:00Z",
      updated_at: "2026-11-25T13:00:00Z",
      roles: ["RADIOLOGIST"],
    });
  }),

  http.patch("*/users/:userId/status", async ({ params, request }) => {
    const body = (await request.json()) as { status: string };
    return HttpResponse.json({
      id: params.userId,
      email: "c.mendoza@hcsancarlos.es",
      first_name: "Carlos",
      last_name: "Mendoza",
      status: body.status,
      email_verified_at: "2026-11-20T09:00:00Z",
      last_login_at: "2026-11-25T12:00:00Z",
      created_at: "2026-11-18T10:00:00Z",
      updated_at: "2026-11-25T13:05:00Z",
      roles: ["RADIOLOGIST"],
    });
  }),

  // Roles & Permissions Catalogs
  http.get("*/roles", () => {
    return HttpResponse.json({
      data: [
        {
          id: "role-1",
          code: "ADMIN",
          name: "Administrador",
          description: "Rol de administración de la institución.",
          is_system: true,
        },
        {
          id: "role-2",
          code: "RADIOLOGIST",
          name: "Radiólogo",
          description: "Rol de especialista en radiología.",
          is_system: true,
        },
        {
          id: "role-3",
          code: "PATIENT",
          name: "Paciente",
          description: "Rol de acceso al portal del paciente.",
          is_system: true,
        },
      ],
      total: 3,
      page: 1,
      size: 20,
    });
  }),

  http.get("*/permissions", () => {
    return HttpResponse.json({
      data: [
        { id: "perm-1", code: "users:read", description: "Consultar cuentas de usuario." },
        { id: "perm-2", code: "users:update", description: "Actualizar cuentas de usuario." },
        { id: "perm-3", code: "audit:read", description: "Consultar eventos de auditoría." },
      ],
      total: 3,
      page: 1,
      size: 20,
    });
  }),

  // Audit Events
  http.get("*/audit/events", ({ request }) => {
    const url = new URL(request.url);
    const eventType = url.searchParams.get("event_type") || "";
    const allEvents = [
      {
        id: "evt-1",
        actor_user_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        target_user_id: "11111111-1111-1111-1111-111111111111",
        event_type: "ROLE_ASSIGNED",
        outcome: "success",
        ip_address: "192.168.20.104",
        user_agent: "Chrome",
        request_id: "req-101",
        occurred_at: "2026-11-25T13:10:00Z",
        metadata: { role_code: "RADIOLOGIST" },
      },
      {
        id: "evt-2",
        actor_user_id: null,
        target_user_id: "11111111-1111-1111-1111-111111111111",
        event_type: "account.login",
        outcome: "failure",
        ip_address: "10.0.0.12",
        user_agent: "Chrome",
        request_id: "req-102",
        occurred_at: "2026-11-25T12:45:00Z",
        metadata: { reason: "invalid_credentials" },
      },
    ];
    const filtered = eventType
      ? allEvents.filter((e) => e.event_type.includes(eventType))
      : allEvents;
    return HttpResponse.json({
      data: filtered,
      total: filtered.length,
      page: 1,
      size: 20,
    });
  }),
];
