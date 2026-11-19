import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { ClinicalLayout } from "@/app/layouts/ClinicalLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { ActivateAccountPage } from "@/features/auth/pages/ActivateAccountPage";
import { SessionPage } from "@/features/auth/pages/SessionPage";
import { ForbiddenPage } from "@/features/auth/pages/ForbiddenPage";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { PatientStudiesPage } from "@/features/patient/pages/PatientStudiesPage";
import { RootRedirect } from "./RootRedirect";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      {
        element: <ClinicalLayout />,
        children: [
          {
            path: "admin",
            element: (
              <ProtectedRoute requiredRoles={["ADMIN", "RADIOLOGIST"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "my-studies",
            element: (
              <ProtectedRoute requiredRoles={["PATIENT", "ADMIN"]}>
                <PatientStudiesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "session",
            element: (
              <ProtectedRoute>
                <SessionPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: (
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            ),
          },
          {
            path: "forgot-password",
            element: (
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>
            ),
          },
          {
            path: "reset-password",
            element: <ResetPasswordPage />,
          },
          {
            path: "activate",
            element: <ActivateAccountPage />,
          },
          {
            path: "forbidden",
            element: <ForbiddenPage />,
          },
        ],
      },
    ],
  },
]);
