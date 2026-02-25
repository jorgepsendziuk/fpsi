"use client";

import type { AuthProvider } from "@refinedev/core";
import { supabaseBrowserClient } from "@utils/supabase/client";

export const authProviderClient: AuthProvider = {
  login: async ({ email, password, providerName }) => {
    // Login social (OAuth)
    if (providerName) {
      const { data, error } =
        await supabaseBrowserClient.auth.signInWithOAuth({
          provider: providerName as "google" | "github" | "azure" | "facebook",
          options: {
            redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
          },
        });

      if (error) {
        return { success: false, error };
      }
      if (data?.url) {
        window.location.href = data.url;
        return { success: true };
      }
      return {
        success: false,
        error: { name: "OAuthError", message: "Erro ao iniciar login social" },
      };
    }

    // Login com email e senha
    const { data, error } = await supabaseBrowserClient.auth.signInWithPassword({
      email: email ?? "",
      password: password ?? "",
    });

    if (error) {
      return {
        success: false,
        error,
      };
    }

    if (data?.session) {
      await supabaseBrowserClient.auth.setSession(data.session);

      fetch("/api/profiles/verify", { method: "POST" }).catch(() => {});

      return {
        success: true,
        redirectTo: "/dashboard",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    const { error } = await supabaseBrowserClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      redirectTo: "/",
    };
  },
  updatePassword: async ({ password }) => {
    const { error } = await supabaseBrowserClient.auth.updateUser({ password });

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
    };
  },
  forgotPassword: async ({ email }) => {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : "/login";

    const { error } = await supabaseBrowserClient.auth.resetPasswordForEmail(
      email,
      { redirectTo }
    );

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
    };
  },
  register: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseBrowserClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data) {
        return {
          success: true,
          redirectTo: "/dashboard",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: false,
      error: {
        message: "Register failed",
        name: "Invalid email or password",
      },
    };
  },
  check: async () => {
    const { data, error } = await supabaseBrowserClient.auth.getUser();
    const { user } = data;

    if (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    }

    if (user) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  // Permissões reais vêm de programa_users via useUserPermissions(programaId) e GET /api/users.
  // Este retorno não é usado para autorização na app; mantemos null para deixar explícito.
  getPermissions: async () => {
    return null;
  },
  getIdentity: async () => {
    const { data } = await supabaseBrowserClient.auth.getUser();

    if (data?.user) {
      return {
        ...data.user,
        name: data.user.email,
      };
    }

    return null;
  },
  onError: async (error) => {
    if (error?.code === "PGRST301" || error?.code === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
};
