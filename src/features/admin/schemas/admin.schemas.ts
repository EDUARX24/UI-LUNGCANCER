import { z } from "zod";

export const userUpdateSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "Máximo 100 caracteres."),
  last_name: z
    .string()
    .trim()
    .min(1, "Los apellidos son obligatorios.")
    .max(100, "Máximo 100 caracteres."),
  email: z
    .string()
    .trim()
    .min(3, "El correo es obligatorio.")
    .max(254, "Máximo 254 caracteres.")
    .email("Ingresa un correo electrónico institucional válido."),
});

export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
