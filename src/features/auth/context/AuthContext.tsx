import { createContext, useContext, ReactNode, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { getAccessToken } from "@/lib/api/client";
import type { UserProfile, LoginPayload } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Query to fetch currently authenticated user (/auth/me)
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<UserProfile | null>({
    queryKey: ["authUser"],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) {
        return null;
      }
      try {
        return await authService.getCurrentUser();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      await authService.login(credentials);
      await refetch();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSettled: () => {
      queryClient.setQueryData(["authUser"], null);
      queryClient.clear(); // Clear all sensitive medical data from cache
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      await authService.logoutAll();
    },
    onSettled: () => {
      queryClient.setQueryData(["authUser"], null);
      queryClient.clear();
    },
  });

  const login = useCallback(
    async (credentials: LoginPayload) => {
      await loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const logoutAll = useCallback(async () => {
    await logoutAllMutation.mutateAsync();
  }, [logoutAllMutation]);

  const refreshToken = useCallback(async () => {
    await authService.refreshToken();
    await refetch();
  }, [refetch]);

  const refetchUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value: AuthContextType = {
    user: user ?? null,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    logoutAll,
    refreshToken,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: async (credentials) => {
        await authService.login(credentials);
      },
      logout: async () => {
        await authService.logout();
      },
      logoutAll: async () => {
        await authService.logoutAll();
      },
      refreshToken: async () => {
        await authService.refreshToken();
      },
      refetchUser: async () => {},
    };
  }
  return context;
}
