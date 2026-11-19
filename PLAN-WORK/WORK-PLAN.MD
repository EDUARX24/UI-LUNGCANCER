# LUNGSEG UI — PLAN DE TRABAJO
## Etapa AUTH: React + shadcn/ui + FastAPI Render

### 1. Objetivo

Desarrollar el módulo frontend de autenticación de LungSeg, utilizando React, TypeScript y shadcn/ui, consumiendo exclusivamente los endpoints AUTH del backend FastAPI publicado en Render.

El desarrollo se realizará localmente en:

`http://localhost:5173`

No implementar todavía módulos clínicos ni dashboards administrativos.

### 2. Contexto

Frontend editable:

`UI-LUNGCANCER`

Backend de referencia, exclusivamente lectura:

`C:\Users\Eduar Garcia\Desktop\BACKEND-LUNGCANCER-API\src`

Backend publicado:

FastAPI alojado en Render.

Diseños:

Google Stitch mediante MCP.

Proyecto visual principal:

`projects/10649889997717986912`

Nombre: Lung AI Segmentation UI - REACT.

Plan de trabajo:

`PLAN-WORK/WORK-PLAN.MD`

### 3. Restricciones obligatorias

El único repositorio que puedes modificar es `UI-LUNGCANCER`.

Está prohibido:

- Modificar archivos del backend.
- Ejecutar migraciones Alembic.
- Modificar Neon PostgreSQL.
- Cambiar configuraciones de Render.
- Modificar diseños originales de Stitch.
- Exponer credenciales o secretos.
- Crear endpoints ficticios.
- Implementar lógica de autenticación exclusivamente en React.
- Utilizar credenciales administrativas reales para pruebas automatizadas.
- Deshabilitar controles de seguridad para solucionar errores de integración.

Si existe una incompatibilidad con FastAPI, documentarla y detener solamente la funcionalidad afectada.

### 4. Tecnologías

Utilizar versiones estables compatibles de:

- React.
- TypeScript.
- Vite.
- Tailwind CSS v4.
- shadcn/ui.
- React Router.
- TanStack Query.
- Axios.
- React Hook Form.
- Zod.
- Lucide React.
- Sonner.
- Vitest.
- React Testing Library.
- MSW.

Utilizar TypeScript estricto y npm con lockfile.

---

# FASE AUTH-01 — AUDITORÍA DE API Y DISEÑOS [ESTADO: COMPLETED]

> **Informe detallado:** Ver [AUTH-01-ANALISIS-API-DISENOS.md](../docs/analysis/AUTH-01-ANALISIS-API-DISENOS.md)

## Actividades

1. [x] Inspeccionar el proyecto frontend existente.
2. [x] Revisar `PLAN-WORK/WORK-PLAN.MD`.
3. [x] Consultar mediante Stitch MCP las pantallas de autenticación (`projects/10649889997717986912`).
4. [x] Identificar sus colores, tipografías, espaciados y componentes (Geist, JetBrains Mono, Dark-Field palette).
5. [x] Inspeccionar los routers AUTH del backend local (`lungseg_api/modules/auth/router.py`).
6. [x] Identificar los schemas Pydantic (`lungseg_api/schemas/auth.py`, `lungseg_api/core/responses.py`).
7. [x] Identificar constantes y códigos de error (`ErrorCode`, `ErrorMessage`).
8. [x] Revisar los mecanismos de cookies (`refresh_token`, `csrf_token`), JWT y CSRF (HMAC).
9. [x] Consultar OpenAPI del backend publicado en Render (`https://api-lungcancer-ai.onrender.com/openapi.json`).
10. [x] Comparar los contratos publicados con el código local.

Consultar los endpoints reales correspondientes a:

```text
/api/v1/auth/login             [Publicado: POST /api/v1/auth/login]
/api/v1/auth/refresh           [Publicado: POST /api/v1/auth/refresh]
/api/v1/auth/logout            [Publicado: POST /api/v1/auth/logout]
/api/v1/auth/logout-all        [Publicado: POST /api/v1/auth/logout-all]
/api/v1/auth/activate-account  [Publicado: POST /api/v1/auth/activate-account (Nota: no es /auth/activate)]
/api/v1/auth/forgot-password   [Publicado: POST /api/v1/auth/forgot-password]
/api/v1/auth/reset-password    [Publicado: POST /api/v1/auth/reset-password]
/api/v1/auth/me                [Publicado: GET /api/v1/auth/me (Nota: no es /me)]
/api/v1/auth/csrf              [Publicado: GET /api/v1/auth/csrf]
```

No asumir que todas esas rutas coinciden literalmente con las publicadas.

Verificar métodos, cuerpos, cabeceras, respuestas y códigos HTTP.

## Entregables

- [x] Inventario de endpoints AUTH.
- [x] Contratos de entrada y salida.
- [x] Análisis de sesiones y cookies.
- [x] Inventario de pantallas Stitch.
- [x] Identificación de bloqueos y retos de integración.
- [x] Matriz de correspondencia pantalla-endpoint.

No modificar el backend.

---

# FASE AUTH-02 — PREPARACIÓN TÉCNICA DE REACT [ESTADO: COMPLETED]

## Actividades

1. [x] Inicializar Vite con React y TypeScript.
2. [x] Mantener el directorio actual `UI-LUNGCANCER` (preservados `.agents`, `docs`, `PLAN-WORK`).
3. [x] Instalar y configurar Tailwind CSS v4 (`@tailwindcss/vite` + `globals.css` Dark-Field).
4. [x] Instalar shadcn/ui (`components.json`, `cn` helper, componentes `Button`, `Input`, `Label`, `Card`).
5. [x] Configurar alias `@/` en `tsconfig.app.json` y `vite.config.ts`.
6. [x] Configurar React Router v6 con rutas de autenticación.
7. [x] Configurar TanStack Query v5 (`QueryProvider`).
8. [x] Configurar Axios (`apiClient` con `baseURL` y `withCredentials: true`).
9. [x] Configurar React Hook Form y Zod.
10. [x] Configurar Vitest y Testing Library (`vitest.config.ts`, `tests/setup.ts`, smoke test pasando).
11. [x] Definir scripts de ejecución (`dev`, `build`, `lint`, `test`).
12. [x] Configurar ESLint y formato (0 errores, 0 warnings).

No sobrescribir `.agents` ni `PLAN-WORK`.

## Variables de entorno

- [x] Crear `.env.example`: `VITE_API_BASE_URL=https://api-lungcancer-ai.onrender.com/api/v1`
- [x] Crear `.env.development`: `VITE_API_BASE_URL=https://api-lungcancer-ai.onrender.com/api/v1`

No incluir contraseñas, tokens ni secretos.

## Vite

Configurar el servidor local para usar el puerto 5173:

```typescript
server: {
  port: 5173,
  strictPort: true,
  proxy: {
    '/api/v1': {
      target: 'https://api-lungcancer-ai.onrender.com',
      changeOrigin: true,
      secure: true,
    },
  },
}
```

Esto evitará que Vite cambie silenciosamente a otro puerto y genere diferencias con el origen permitido en CORS.

## Criterios de aceptación

- [x] React inicia correctamente.
- [x] `http://localhost:5173` configurado estrictamente.
- [x] TypeScript compila (`npm run build` OK).
- [x] shadcn/ui funciona.
- [x] Tailwind está configurado.
- [x] Pruebas unitarias pasan (`npm run test` OK).
- [x] Linter limpio (`npm run lint` OK).
- [x] No se alteró el backend.

---

# FASE AUTH-03 — DISEÑO DE LAS PANTALLAS [ESTADO: COMPLETED]

## Objetivo

Implementar las pantallas de autenticación tomando como referencia visual principal Google Stitch.

## Pantallas Implementadas

### Login (`src/features/auth/pages/LoginPage.tsx`)
- [x] Correo electrónico institucional.
- [x] Contraseña con alternancia de visibilidad (mostrar/ocultar).
- [x] Enlace a recuperación de contraseña.
- [x] Checkbox para persistencia de sesión.
- [x] Botón de inicio de sesión con estado de carga interactivo (`Loader2`).
- [x] Manejo de errores de validación de Zod y de servidor FastAPI (`401`, `403`, `429`).
- [x] Pie de tarjeta con estado del nodo PACS DICOM y cifrado TLS 1.3.

### Activación de cuenta (`src/features/auth/pages/ActivateAccountPage.tsx`)
- [x] Validación de token de invitación hospitalaria (parámetro query `?token=` o manual).
- [x] Nueva contraseña clínica y confirmación.
- [x] Matriz de políticas de seguridad en tiempo real (Argon2id / ENS Alta Disponibilidad).
- [x] Notificaciones para enlace inválido o expirado.
- [x] Confirmación de activación y enlace directo al login.
- [x] Riel lateral de soporte de emergencia clínica 24/7 (Ext. 4402).

### Recuperación de contraseña (`src/features/auth/pages/ForgotPasswordPage.tsx`)
- [x] Campo de correo con etiqueta ID CLÍNICO.
- [x] Validación Zod de correo institucional.
- [x] Envío de solicitud con indicador de progreso.
- [x] Mensaje neutral para mitigar enumeración de cuentas.
- [x] Vista de confirmación con instrucción de 15 minutos de validez y opción de reintento.

### Restablecimiento de contraseña (`src/features/auth/pages/ResetPasswordPage.tsx`)
- [x] Detección y validación de token desde URL `?token=...`.
- [x] Nueva contraseña y confirmación de contraseña.
- [x] Medidor de fortaleza de contraseña en 4 niveles (Débil, Aceptable, Fuerte, Excelente).
- [x] Lista de comprobación criptográfica en tiempo real (4 parámetros).
- [x] Manejo de errores para token inválido o expirado.
- [x] Pantalla de éxito con redirección guiada al portal seguro.

### Sesión autenticada (`src/features/auth/pages/SessionPage.tsx`)
- [x] Identidad del usuario autenticado (nombre, email, ID) vía `GET /api/v1/auth/me`.
- [x] Roles clínicos asignados (`RADIOLOGIST`, `ADMIN`).
- [x] Diagnóstico de tokens en tiempo de ejecución (JWT en memoria, CSRF Token y Cookies).
- [x] Botón interactivo de prueba de renovación de sesión (`POST /api/v1/auth/refresh`).
- [x] Botones de cierre de sesión local y remota en todos los dispositivos (`POST /api/v1/auth/logout` y `/logout-all`).
- [x] Monitor de telemetría de salud de la API (`GET /api/v1/health`).

## Diseño visual y accesibilidad
- [x] Tema Dark-Field obsidian fiel a Stitch (`#09090b` / `#121215`).
- [x] Paleta violeta / cian / esmeralda de Google Stitch MCP (`projects/10649889997717986912`).
- [x] Tipografías Geist y JetBrains Mono.
- [x] Layout unificado (`AuthLayout.tsx`) con cabecera de versión y pie de cumplimiento RGPD/HIPAA.
- [x] Suite de tests unitarios completa (11/11 tests pasando en Vitest).
- [x] Compilación limpia (`npm run build`) y linter sin advertencias (`npm run lint`).

---

# FASE AUTH-04 — CLIENTE HTTP E INTEGRACIÓN [ESTADO: COMPLETED]

## Objetivo

Conectar React con FastAPI en Render.

## Entregables Completados

### Cliente Axios (`src/lib/api/client.ts`)
- [x] Configuración de `baseURL` (`import.meta.env.VITE_API_BASE_URL || "/api/v1"`).
- [x] Timeout de 20,000ms con `withCredentials: true` para cookies `HttpOnly` (`refresh_token`, `csrf_token`).
- [x] Interceptor de petición para inyección automática de cabecera `Authorization: Bearer <access_token>`.
- [x] Inyección de cabecera `X-CSRF-Token` en solicitudes de renovación `/auth/refresh`.
- [x] Interceptor de respuesta con Mutex y Cola de Espera (`failedQueue`) para evitar múltiples peticiones concurrentes a `/auth/refresh`.
- [x] Normalización de respuestas y desacoplamiento para evitar bucles infinitos en 401 de login/refresh.

### Servicio de Autenticación (`src/features/auth/services/auth.service.ts`)
- [x] `login(payload)` &rarr; `POST /api/v1/auth/login` (recibe y resguarda tokens).
- [x] `refreshToken()` &rarr; `POST /api/v1/auth/refresh` (renovación silenciosa con HMAC CSRF).
- [x] `getCsrfToken()` &rarr; `GET /api/v1/auth/csrf` (recuperación de token CSRF ligado a cookie).
- [x] `getCurrentUser()` &rarr; `GET /api/v1/auth/me` (perfil clínico del usuario autenticado).
- [x] `logout()` &rarr; `POST /api/v1/auth/logout` (revocación de sesión actual en backend).
- [x] `logoutAll()` &rarr; `POST /api/v1/auth/logout-all` (revocación en todos los dispositivos).
- [x] `forgotPassword(payload)` &rarr; `POST /api/v1/auth/forgot-password` (emisión de enlace de recuperación).
- [x] `resetPassword(payload)` &rarr; `POST /api/v1/auth/reset-password` (establecimiento de nueva contraseña con token firmado).
- [x] `activateAccount(payload)` &rarr; `POST /api/v1/auth/activate-account` (activación de credencial inicial para nuevos especialistas).
- [x] `checkHealth()` &rarr; `GET /api/v1/health` (monitor de telemetría y disponibilidad de Render).

### Tipado y Manejo de Errores
- [x] Esquemas Pydantic replicados como interfaces TypeScript en `src/features/auth/types/index.ts`.
- [x] Errores categorizados (400, 401, 403, 422, 429, red) con mensajes legibles para el clínico sin exposición de stack traces.
- [x] Tests de integración y cliente HTTP pasando (14/14 tests en Vitest).

---

# FASE AUTH-05 — AUTENTICACIÓN Y SESIONES [ESTADO: COMPLETED]

## Login e Integración de Sesión
- [x] Formularios validados estrictamente con React Hook Form y Zod (`loginSchema`).
- [x] Gestión de tokens en memoria y sincronización no bloqueante con `sessionStorage`.
- [x] Delegación de cookies de sesión segura (`refresh_token`, `csrf_token`) como First-Party gracias al proxy de Vite.
- [x] Contexto global y hook `useAuth()` con TanStack Query (`src/features/auth/context/AuthContext.tsx`).
- [x] Recuperación y caché de perfil (`/api/v1/auth/me`) con invalidación tras 5 minutos o logout.

## Renovación de Sesión y Logout
- [x] Renovación silenciosa con protección anti-bucles y mutex/cola de espera en peticiones concurrentes (`src/lib/api/client.ts`).
- [x] Implementación de logout unitario (`/auth/logout`) y global en todos los dispositivos (`/auth/logout-all`).
- [x] Limpieza completa de caché médica en TanStack Query (`queryClient.clear()`) para prevenir exposición de datos sensibles.

## Rutas Protegidas y Control de Acceso
- [x] Guardián de rutas protegidas (`src/features/auth/components/ProtectedRoute.tsx`) con preservación de ruta de origen y soporte opcional de roles.
- [x] Guardián de rutas públicas (`src/features/auth/components/PublicOnlyRoute.tsx`) que redirige a `/session` si el usuario ya está autenticado.
- [x] Pantalla técnica de Acceso Denegado 403 (`src/features/auth/pages/ForbiddenPage.tsx`).
- [x] Soporte de roles clínicos reales recibidos de FastAPI (`ADMIN`, `RADIOLOGIST`, `PATIENT`).

---

# FASE AUTH-06 — PRUEBAS Y VALIDACIÓN [ESTADO: COMPLETED]

## Pruebas de Componentes y Páginas
- [x] Cobertura unitaria y de renderizado para `LoginPage`: correo, contraseña, toggle mostrar/ocultar, checkbox remember, estados de carga y validaciones.
- [x] Cobertura para `ForgotPasswordPage`: envío de correo, validación y confirmación.
- [x] Cobertura para `ResetPasswordPage`: checklist criptográfico, medidor de entropía y actualización con token.
- [x] Cobertura para `ActivateAccountPage`: activación con código hospitalario, validación y confirmación.
- [x] Cobertura de guardianes de ruta (`ProtectedRoute`, `PublicOnlyRoute`, redirección a `/forbidden`).

## Pruebas de Integración con Mock Service Worker (MSW)
- [x] Configuración de MSW en `tests/mocks/handlers.ts` y `tests/mocks/server.ts` simulando todos los endpoints FastAPI.
- [x] Handshake de login exitoso (200), credenciales inválidas (401), cuenta inactiva (403).
- [x] Renovación con validación CSRF HMAC exitosa y fallida.
- [x] Consulta de perfil médico `/auth/me` con roles.
- [x] Cierre de sesión individual y global.
- [x] Solicitud de restablecimiento, activación de cuenta y telemetría de salud (`/health`).

## Verificación de Calidad
- [x] `npm run test`: **28 pruebas pasando (8 suites de test, 0 fallos)** en Vitest.
- [x] `npm run lint`: **0 errores, 0 advertencias** en ESLint.
- [x] `npm run build`: **Compilación de producción exitosa en Vite + TypeScript estricto** en dist/.
- [x] Servidor de desarrollo preparado en puerto 5173 con proxy transparente hacia Render (`https://api-lungcancer-ai.onrender.com`).

---

# ESTRUCTURA OBJETIVO

```text
UI-LUNGCANCER/
├── .agents/
├── PLAN-WORK/
│   └── WORK-PLAN.MD
├── public/
├── src/
│   ├── app/
│   │   ├── layouts/
│   │   │   └── AuthLayout.tsx
│   │   ├── providers/
│   │   └── router/
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   ├── features/
│   │   └── auth/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── schemas/
│   │       └── types/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── errors.ts
│   │   │   └── generated/
│   │   ├── constants/
│   │   └── utils.ts
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── tests/
├── .env.example
├── .env.development
├── package.json
├── package-lock.json
├── vite.config.ts
└── README.md
```

Adaptar esta estructura cuando las necesidades reales del código lo justifiquen. No crear archivos vacíos innecesarios.

---

# CRITERIOS DE ACEPTACIÓN

- [x] React funcional en localhost:5173.
- [x] TypeScript configurado.
- [x] shadcn/ui integrado.
- [x] Diseño AUTH basado en Stitch.
- [x] Formularios funcionales.
- [x] Validaciones Zod.
- [x] Cliente Axios centralizado.
- [x] Integración con Render.
- [x] CORS verificado.
- [x] Cookies y CSRF verificados.
- [x] Login real.
- [x] Consulta del usuario autenticado.
- [x] Renovación de sesión.
- [x] Logout.
- [x] Activación de cuentas.
- [x] Recuperación de contraseña.
- [x] Rutas protegidas.
- [x] Errores HTTP controlados.
- [x] Pruebas automatizadas (42/42 tests passing en 12 suites).
- [x] Build satisfactorio (Vite dist).
- [x] Backend sin modificaciones.
- [x] Documentación actualizada.

---

# ETAPA ADMIN — PANEL DE CONTROL CLÍNICO & INVITACIONES (`/admin`) [ESTADO: COMPLETED]

Implementación completada según el diseño Stitch `c802af66366345dfb91ac6ed083a38e2` (*PulmoScan AI - Panel de Administración Clínica*).

### Subfases Realizadas:
1. **ADMIN-01: Contratos y Schemas**
   - Interfaces `AccountInvitationPayload` y `RoleAssignmentPayload`.
   - Schema Zod `inviteClinicianSchema` y tipos inferidos.
   - Métodos `authService.inviteAccount` y `authService.assignUserRole`.
2. **ADMIN-02: Shell y Layout de Estación Clínica (`ClinicalLayout.tsx`)**
   - Sidebar interactivo (ancho 72 / 18rem) con navegación por módulos clínicos.
   - Telemetría de hardware en tiempo real: CPU EPYC 28%, VRAM GPU 64% (51.2 GB), Cluster A100.
   - Topbar clínica fija con selector de hospital, estado de red PACS (TLS 1.3), buscador y chip de usuario autenticado con botón de logout.
3. **ADMIN-03: Panel de Control de Administración (`AdminDashboardPage.tsx`)**
   - Command Bar con badge animado "ENLACE DICOM ACTIVO" y botones de acción rápida.
   - 4 Tarjetas de KPIs clínicos (Estudios TC procesados hoy con +12.4% y 99.4% precisión, Nódulos detectados con conteo de malignidad crítica, Latencia media PACS DICOM 18.2ms y Carga GPU Cluster 68%).
   - Gráfico SVG vectorial de rendimiento en 24h (`InferencePerformanceChart.tsx`) con filtros Hoy/7D/30D, gradientes violeta y esmeralda.
   - Cola de Trabajo TC en tiempo real (`StudiesQueueTable.tsx`) con 5 casos clínicos anonimizados, badges de severidad y acciones (Visor 3D, cancelación, priorización).
   - Tarjetas de salud de Infraestructura DICOM (`InfrastructureStatusCard.tsx`) y flujo de auditoría clínica en tiempo real (`AuditStreamCard.tsx`).
4. **ADMIN-04: Diálogo Modal de Invitación a Facultativos (`InviteClinicianDialog.tsx`)**
   - Modal accesible con selección de rol clínico (`RADIOLOGIST`, `ADMIN`, `PATIENT`).
   - Envío asíncrono a `/api/v1/auth/invitations` con spinner y alerta de errores.
   - Visualización y copia del token de activación generado.
5. **ADMIN-05: Enrutamiento y Verificación de Calidad**
   - Configuración en `src/app/router/index.tsx` montando `/admin` bajo `ClinicalLayout` y `ProtectedRoute`.
   - Redirección inteligente post-login hacia la estación clínica `/admin`.
   - Cobertura de pruebas unitarias completa con 40 pruebas pasando exitosamente en 11 suites.
   - ESLint con 0 errores y 0 warnings.
   - Compilación exitosa en Vite production build.
6. **ADMIN-06: Control de Acceso Basado en Roles (RBAC) & Portal de Paciente**
   - Diferenciación visual y operativa completa en `ClinicalLayout.tsx` según `user.roles`:
     - Para `PATIENT`: Subtítulo "Portal del Paciente", menú simplificado ("Mis Estudios e Informes TC", "Mi Perfil & Seguridad"), insignia de "Cifrado E2EE Activo", y ocultamiento total de telemetría de GPUs y consolas de infraestructura PACS.
     - Para `ADMIN` / `RADIOLOGIST`: Subtítulo "Admin Console" / "Estación Radiológica", telemetría de hardware A100 y administración de nodos.
   - Creación de la vista dedicada `PatientStudiesPage.tsx` (`/my-studies`) con exploraciones, informes validados y descarga de PDFs.
   - Redirección dinámica basada en roles (`RootRedirect.tsx`): los pacientes van automáticamente a `/my-studies` y los administradores a `/admin`.
   - Adaptación de `SessionPage.tsx` mostrando dinámicamente "PERFIL DEL PACIENTE" o "PERFIL DE FACULTATIVO".
   - Blindaje de la ruta `/admin` restringida exclusivamente a `ADMIN` y `RADIOLOGIST`.
   - Suite de pruebas ampliada a 42/42 tests pasando (12 suites).

---

# CONTROL DE EJECUCIÓN

Actualizar `PLAN-WORK/WORK-PLAN.MD` con los estados:

- PENDING
- IN_PROGRESS
- BLOCKED
- COMPLETED

Ejecutar las fases en orden.

Antes de iniciar implementaciones que dependan de la API, verificar los contratos reales publicados.

No avanzar a pacientes, estudios, dashboards o modelos de IA.

Al finalizar AUTH-01, entregar los hallazgos y continuar con AUTH-02 únicamente si el contrato publicado y los requisitos de integración están claros.

Al finalizar toda la etapa AUTH, entregar:

1. Resumen de funcionalidades.
2. Archivos creados.
3. Endpoints integrados.
4. Pantallas implementadas.
5. Pruebas ejecutadas.
6. Resultado de integración con Render.
7. Problemas de CORS o cookies.
8. Funcionalidades bloqueadas.
9. Recomendaciones para la siguiente etapa.

**Objetivo final: un frontend AUTH profesional, basado en Stitch, conectado a FastAPI Render y sin modificar el backend.**