import axios from "axios";

export interface ExtractedApiError {
  status?: number;
  code?: string;
  message: string;
}

/**
 * Extracts normalized error code and user-friendly message from FastAPI ErrorResponse.
 */
export function extractApiError(
  err: unknown,
  fallbackMessage = "Ocurrió un error inesperado al comunicarse con el servidor."
): ExtractedApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as
      | {
          error?: { code?: string; message?: string };
          message?: string;
          detail?: string;
        }
      | undefined;

    if (err.code === "ERR_NETWORK") {
      return {
        status,
        code: "ERR_NETWORK",
        message: "No se pudo conectar con el servidor médico. Verifica tu conexión.",
      };
    }

    const code = data?.error?.code;
    const message =
      data?.error?.message ||
      data?.message ||
      (typeof data?.detail === "string" ? data.detail : undefined) ||
      fallbackMessage;

    return { status, code, message };
  }

  if (err instanceof Error) {
    return { message: err.message || fallbackMessage };
  }

  return { message: fallbackMessage };
}
