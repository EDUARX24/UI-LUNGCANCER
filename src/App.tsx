import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/features/auth/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col font-sans">
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
        <Toaster position="top-right" theme="dark" richColors />
      </div>
    </AuthProvider>
  );
}
