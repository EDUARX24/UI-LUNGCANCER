import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un correo electrónico institucional válido."),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria.")
    .max(256, "La contraseña no debe exceder los 256 caracteres."),
  remember: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginInput = LoginFormData;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un correo electrónico institucional válido."),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ForgotPasswordInput = ForgotPasswordFormData;

export const resetPasswordSchema = z
  .object({
    token: z.string().optional(),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(256, "La contraseña no debe exceder los 256 caracteres.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Debe contener al menos una mayúscula, una minúscula y un número."
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordInput = ResetPasswordFormData;

export const activateAccountSchema = z
  .object({
    token: z.string().optional(),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(256, "La contraseña no debe exceder los 256 caracteres.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Debe contener al menos una mayúscula, una minúscula y un número."
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type ActivateAccountFormData = z.infer<typeof activateAccountSchema>;
export type ActivateAccountInput = ActivateAccountFormData;

export const inviteClinicianSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un correo institucional válido."),
  first_name: z
    .string()
    .min(1, "El nombre es obligatorio.")
    .max(100, "Máximo 100 caracteres."),
  last_name: z
    .string()
    .min(1, "Los apellidos son obligatorios.")
    .max(100, "Máximo 100 caracteres."),
  role_code: z.enum(["RADIOLOGIST", "ADMIN", "PATIENT"]).default("RADIOLOGIST"),
});

export type InviteClinicianFormData = z.infer<typeof inviteClinicianSchema>;
export type InviteClinicianInput = InviteClinicianFormData;
