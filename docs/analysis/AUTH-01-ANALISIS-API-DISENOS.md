# LUNGSEG UI — INFORME DE AUDITORÍA DE API Y DISEÑOS (FASE AUTH-01)

- **Fecha de auditoría:** 2026-11-18
- **Estado de la fase:** `COMPLETED`
- **Backend publicado (Render):** `https://api-lungcancer-ai.onrender.com`
- **Swagger UI:** `https://api-lungcancer-ai.onrender.com/docs`
- **OpenAPI JSON:** `https://api-lungcancer-ai.onrender.com/openapi.json`
- **Frontend local de desarrollo:** `http://localhost:5173`
- **URL Base de API de referencia:** `VITE_API_BASE_URL=https://api-lungcancer-ai.onrender.com/api/v1`

---

## 1. Resumen Ejecutivo

Durante la fase **AUTH-01**, se completó la auditoría integral de la interfaz de programación de aplicaciones (API) publicada en Render y se contrastó exhaustivamente contra el repositorio local de FastAPI (`BACKEND-LUNGCANCER-API\src`). Asimismo, se correlacionaron los endpoints con las pantallas diseñadas en Google Stitch MCP (proyecto principal `projects/10649889997717986912`).

### Hallazgos Críticos Principales:
1. **Consistencia de Contratos:** El backend publicado en Render refleja al 100% el código fuente local de `lungseg_api`. Los esquemas Pydantic y los endpoints coinciden exactamente.
2. **Divergencias de Nomenclatura respecto a la especificación preliminar:**
   - La activación de cuenta no es `/auth/activate`, sino **`POST /api/v1/auth/activate-account`**.
   - La consulta del perfil actual no es `/me`, sino **`GET /api/v1/auth/me`**.
   - Se cuenta con un endpoint dedicado para emisión/renovación del token CSRF: **`GET /api/v1/auth/csrf`**.
3. **CORS Verificado:** El backend en Render ya tiene configurado `http://localhost:5173` en sus orígenes permitidos con `access-control-allow-credentials: true`.
4. **Mecanismo de Doble Protección de Sesión (JWT + Cookie + CSRF HMAC):**
   - El *Access Token* viaja en el encabezado `Authorization: Bearer <token>` (expiración: 15 minutos).
   - El *Refresh Token* se emite como cookie `HttpOnly`, `Secure` con alcance limitado (`Path=/api/v1/auth`).
   - El endpoint `POST /api/v1/auth/refresh` valida estrictamente la cabecera `X-CSRF-Token` contra una cookie `csrf_token`, ambas derivadas criptográficamente mediante HMAC-SHA256 del refresh token.

---

## 2. Inventario Completo de Endpoints AUTH y Diagnóstico

Todos los endpoints están bajo el prefijo `/api/v1`:

### 2.1. `POST /api/v1/auth/login`
- **Descripción:** Autentica al usuario mediante email y contraseña.
- **Acceso:** Público (anónimo).
- **Request Body (`LoginRequest`):**
  ```json
  {
    "email": "usuario@institucion.org", // string, 1-254 chars, valid email format
    "password": "Password123!"          // string, 1-256 chars
  }
  ```
- **Cookies de Respuesta:**
  - `refresh_token`: `HttpOnly; Secure; SameSite=lax; Path=/api/v1/auth; Max-Age=604800` (7 días)
  - `csrf_token`: `HttpOnly; Secure; SameSite=lax; Path=/api/v1/auth; Max-Age=604800`
- **Response 200 (`AuthTokens`):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 900,
    "csrf_token": "a1b2c3d4..."
  }
  ```
- **Posibles Errores:**
  - `401 INVALID_CREDENTIALS`: "Credenciales inválidas."
  - `403 ACCOUNT_INACTIVE`: "La cuenta no está activa."
  - `422 VALIDATION_ERROR`: Formato de email o contraseña inválido.
  - `429 RATE_LIMIT_EXCEEDED`: Exceso de intentos fallidos consecutivos (bloqueo temporal).

---

### 2.2. `POST /api/v1/auth/refresh`
- **Descripción:** Renueva el par de tokens (`access_token` y `csrf_token`) utilizando la sesión activa.
- **Acceso:** Requiere sesión activa en cookies y token CSRF.
- **Cabeceras Obligatorias:**
  - `X-CSRF-Token`: Valor del token CSRF (recibido en el login o mediante `/auth/csrf`).
- **Cookies Obligatorias:**
  - `refresh_token`
  - `csrf_token`
- **Response 200 (`AuthTokens`):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 900,
    "csrf_token": "f5e6d7c8..."
  }
  ```
- **Posibles Errores:**
  - `401 INVALID_TOKEN`: Falta la cookie de refresh token o formato inválido.
  - `401 TOKEN_EXPIRED`: El refresh token ha expirado.
  - `401 SESSION_REVOKED`: La sesión fue revocada remotamente.
  - `403 CSRF_VALIDATION_FAILED`: La cabecera `X-CSRF-Token` no coincide con la cookie `csrf_token` o no corresponde al refresh token.

---

### 2.3. `GET /api/v1/auth/csrf`
- **Descripción:** Obtiene un nuevo token CSRF enlazado a la cookie de refresco existente.
- **Acceso:** Requiere cookie `refresh_token`.
- **Response 200 (`CSRFTokenResponse`):**
  ```json
  {
    "csrf_token": "a1b2c3d4e5f6..."
  }
  ```
- **Cookies de Respuesta:** Renueva la cookie `csrf_token`.
- **Posibles Errores:**
  - `401 INVALID_TOKEN`: No se encontró la cookie de refresh token.

---

### 2.4. `GET /api/v1/auth/me`
- **Descripción:** Retorna el perfil y los roles del usuario autenticado.
- **Acceso:** Requiere `Authorization: Bearer <access_token>`.
- **Response 200 (`MeResponse`):**
  ```json
  {
    "data": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "doctor@hospital.org",
      "first_name": "Ana",
      "last_name": "Valero",
      "roles": ["RADIOLOGIST"]
    },
    "message": "Información obtenida correctamente."
  }
  ```
- **Posibles Errores:**
  - `401 INVALID_TOKEN`: Token no provisto o inválido.
  - `401 TOKEN_EXPIRED`: Access token expirado (debe ejecutarse refresh).
  - `401 SESSION_REVOKED`: Sesión cerrada o invalidada.
  - `403 ACCOUNT_INACTIVE`: Usuario desactivado.

---

### 2.5. `POST /api/v1/auth/logout`
- **Descripción:** Revoca la sesión actual en el backend y elimina las cookies `refresh_token` y `csrf_token`.
- **Acceso:** Requiere `Authorization: Bearer <access_token>`.
- **Response 200 (`SuccessResponse`):**
  ```json
  {
    "data": {},
    "message": "Sesión cerrada correctamente."
  }
  ```
- **Cookies de Respuesta:** `Set-Cookie` eliminando `refresh_token` y `csrf_token` (`Max-Age=0`).

---

### 2.6. `POST /api/v1/auth/logout-all`
- **Descripción:** Revoca todas las sesiones activas del usuario en todos los dispositivos.
- **Acceso:** Requiere `Authorization: Bearer <access_token>`.
- **Response 200 (`SuccessResponse`):**
  ```json
  {
    "data": {},
    "message": "Todas las sesiones han sido cerradas correctamente."
  }
  ```

---

### 2.7. `POST /api/v1/auth/forgot-password`
- **Descripción:** Solicita un correo de restablecimiento de contraseña. Siempre retorna mensaje neutral para mitigar enumeración de cuentas.
- **Acceso:** Público.
- **Request Body (`PasswordResetRequest`):**
  ```json
  {
    "email": "usuario@institucion.org"
  }
  ```
- **Response 200 (`SuccessResponse`):**
  ```json
  {
    "data": {},
    "message": "Si la cuenta existe, se ha enviado un enlace de recuperación."
  }
  ```
- **Posibles Errores:**
  - `422 VALIDATION_ERROR`: Email mal formado.
  - `429 RATE_LIMIT_EXCEEDED`: Máximo de solicitudes de restablecimiento alcanzado por ventana de tiempo.

---

### 2.8. `POST /api/v1/auth/reset-password`
- **Descripción:** Restablece la contraseña utilizando el token recibido por correo electrónico.
- **Acceso:** Público (con token firmado).
- **Request Body (`PasswordSetRequest`):**
  ```json
  {
    "token": "token_firmado_seguro_8_a_1024_chars",
    "password": "NuevoPassword123!"
  }
  ```
- **Response 200 (`SuccessResponse`):**
  ```json
  {
    "data": {},
    "message": "Contraseña restablecida correctamente."
  }
  ```
- **Posibles Errores:**
  - `400 PASSWORD_RESET_INVALID`: Token corrupto, no coincidente o expirado (>30 min).
  - `422 VALIDATION_ERROR`: Longitud de contraseña < 8 caracteres.

---

### 2.9. `POST /api/v1/auth/activate-account`
- **Descripción:** Activa una cuenta recién invitada estableciendo la contraseña inicial del especialista.
- **Acceso:** Público (con token de invitación).
- **Request Body (`AccountActivationRequest`):**
  ```json
  {
    "token": "token_invitacion_8_a_1024_chars",
    "password": "PasswordInicialSeguro123!"
  }
  ```
- **Response 200 (`SuccessResponse`):**
  ```json
  {
    "data": {},
    "message": "Cuenta activada correctamente."
  }
  ```
- **Posibles Errores:**
  - `400 INVITATION_INVALID`: Token de invitación expirado (>24h) o ya utilizado.

---

### 2.10. Endpoints Administrativos de Cuentas (Restringidos a rol `ADMIN`)
- **`POST /api/v1/auth/invitations`** (201 Created): Invita a un nuevo médico o personal clínico (`email`, `first_name`, `last_name`).
- **`PUT /api/v1/auth/users/{user_id}/roles`** (200 OK): Asigna roles (`role_code`, ej. `RADIOLOGIST`, `ADMIN`).

---

### 2.11. Diagnóstico de Infraestructura
- **`GET /api/v1/health`** (200 OK): `{"status": "healthy", "service": "lungseg-api"}`
- **`GET /api/v1/ready`** (200 OK): Comprueba conectividad con PostgreSQL.

---

## 3. Matriz de Correspondencia: Pantallas Stitch vs Endpoints FastAPI

| Pantalla Stitch (Proyecto `10649889997717986912`) | Ruta Frontend Sugerida | Endpoints Backend Requeridos |
| :--- | :--- | :--- |
| **Iniciar Sesión - PulmoScan** (`405d0333...`) | `/login` | `POST /api/v1/auth/login`<br>`GET /api/v1/auth/me` |
| **Recuperar Contraseña - PulmoScan** (`f38b61cc...`) | `/forgot-password` | `POST /api/v1/auth/forgot-password` |
| **Confirmación de Correo Enviado** (`65a8e894...`) | `/forgot-password/sent` | *(Estado local tras 200 de forgot-password)* |
| **Restablecer Contraseña - PulmoScan** (`de5bc9ff...`) | `/reset-password` | `POST /api/v1/auth/reset-password` |
| **Contraseña Actualizada con Éxito** (`5e4143a8...`) | `/reset-password/success` | *(Estado local / navegación post-200)* |
| **Activación Clínica Hospitalaria** (`7af7e04f...`) | `/activate` | `POST /api/v1/auth/activate-account` |
| **Sesión Activa / Perfil Técnico** *(Mockup / Session)* | `/session` (técnica) | `GET /api/v1/auth/me`<br>`POST /api/v1/auth/refresh`<br>`POST /api/v1/auth/logout` |

---

## 4. Análisis de Dificultades y Retos de Integración desde `http://localhost:5173`

### 4.1. CORS y Verificación Preflight
- **Estado Actual:** Verificado satisfactoriamente. Render devuelve:
  - `access-control-allow-origin: http://localhost:5173`
  - `access-control-allow-credentials: true`
  - `access-control-allow-headers: Authorization, Content-Type, X-CSRF-Token, X-Request-ID`
- **Condición Estricta:** Las solicitudes de Axios deben incluir obligatoriamente `{ withCredentials: true }`.

### 4.2. Aislamiento Cross-Site de Cookies en Navegadores Modernos
- **Problema Potencial:**
  - El frontend reside en `http://localhost:5173` (HTTP no seguro, dominio local).
  - El backend reside en `https://api-lungcancer-ai.onrender.com` (HTTPS, dominio público).
  - Dado que los dominios difieren completamente (`localhost` vs `onrender.com`), las cookies emitidas por el backend son tratadas por el navegador como **cookies de terceros (Third-Party Cookies)** o **Cross-Site**.
  - Si el backend utiliza `SameSite=Lax` (por defecto en FastAPI si no es `production+none`), el navegador **no enviará la cookie `refresh_token`** en solicitudes XHR/Fetch cross-site, rompiendo `POST /api/v1/auth/refresh`.
  - Adicionalmente, el path de las cookies es restrictivo: `Path=/api/v1/auth`.
- **Estrategia de Solución para Vite en Desarrollo:**
  - Configurar en `vite.config.ts` un proxy de desarrollo:
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
  - **Ventajas del Proxy:**
    1. Las peticiones viajan a `http://localhost:5173/api/v1/...` (Mismo origen).
    2. Las cookies se almacenan como **First-Party**, garantizando compatibilidad 100% con `SameSite=Lax`, sin bloqueos de privacidad de Chrome/Safari.
    3. No se requiere depender de configuraciones especiales de cookies en producción para el entorno de desarrollo local.
    4. En producción, el frontend y backend se pueden desplegar bajo el mismo dominio o configurar `SameSite=None; Secure`.

### 4.3. Ciclo de Renovación y Validación Doble CSRF
- El frontend debe almacenar el `csrf_token` (obtenido en el cuerpo JSON de `/login` o `/refresh`) en memoria/estado de la aplicación.
- Cada llamada a `POST /api/v1/auth/refresh` debe inyectar la cabecera `X-CSRF-Token` con ese valor.
- Para evitar solicitudes concurrentes de renovación (que revocarían o desincronizarían la sesión), el interceptor de Axios debe implementar una cola de reintentos (*refresh token mutex/queue*).

### 4.4. Cold Start de Render
- Las instancias gratuitas o estándar de Render entran en reposo tras inactividad. La primera petición puede demorar de 30 a 50 segundos.
- El cliente frontend debe configurar un timeout adecuado (mínimo 15-20s para operaciones normales) y mostrar indicadores de carga amigables con retry automático sobre `/api/v1/health` si se detecta latencia inicial.

---

## 5. Conclusión y Próximos Pasos

La fase **AUTH-01** concluye exitosamente con el inventario completo, los esquemas de validación identificados y las consideraciones de integración documentadas.

El plan de trabajo se encuentra listo para iniciar la fase **AUTH-02** (Inicialización de React + Vite + TypeScript + shadcn/ui en `UI-LUNGCANCER`).
