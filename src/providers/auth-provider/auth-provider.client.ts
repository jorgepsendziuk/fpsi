"use client";

import type { AuthProvider } from "@refinedev/core";
import { supabaseBrowserClient } from "@utils/supabase/client";

/** Origem para OAuth e reset de senha: no browser, usa o host atual (www vs apex). */
function getPublicOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  return fromEnv || "";
}

export const authProviderClient: AuthProvider = {
  login: async ({ email, password, providerName }) => {
    // Login social (OAuth)
    if (providerName) {
      if (providerName === "google") {
        const redirect = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
        const nextPath = redirect ? (redirect.startsWith("/") ? redirect : `/${redirect}`) : "/dashboard";
        window.location.href = `/api/auth/google?next=${encodeURIComponent(nextPath)}`;
        return { success: true };
      }
      return {
        success: false,
        error: { name: "OAuthError", message: "Provedor não suportado" },
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

      const redirect = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
      return {
        success: true,
        redirectTo: redirect || "/dashboard",
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
    const origin = getPublicOrigin();
    const redirectTo = origin
      ? `${origin}/auth/callback?next=${encodeURIComponent("/login")}`
      : undefined;

    const { error } = await supabaseBrowserClient.auth.resetPasswordForEmail(
      email,
      redirectTo ? { redirectTo } : undefined
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
      const origin = getPublicOrigin();
      const emailRedirectTo = origin
        ? `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`
        : undefined;

      const { data, error } = await supabaseBrowserClient.auth.signUp({
        email,
        password,
        options: emailRedirectTo ? { emailRedirectTo } : undefined,
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      // Sem sessão (ex.: confirmação de e-mail ainda ligada): tenta login imediato.
      // Em fase de testes o projeto usa mailer_autoconfirm — a sessão costuma vir no signUp.
      if (data && !data.session && email && password) {
        const { data: loginData, error: loginError } =
          await supabaseBrowserClient.auth.signInWithPassword({
            email,
            password,
          });
        if (!loginError && loginData?.session) {
          await supabaseBrowserClient.auth.setSession(loginData.session);
        }
      } else if (data?.session) {
        await supabaseBrowserClient.auth.setSession(data.session);
      }

      if (data) {
        fetch("/api/profiles/verify", { method: "POST" }).catch(() => {});
        try {
          sessionStorage.setItem("fpsi-just-registered", "1");
        } catch {
          /* ignore */
        }
        // A página /register controla o feedback + CTA; não redirecionar aqui.
        return {
          success: true,
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

    if (user) {
      return {
        authenticated: true,
      };
    }

    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (res.ok) {
        const body = (await res.json()) as { authenticated?: boolean };
        if (body.authenticated) {
          return { authenticated: true };
        }
      }
    } catch {
      /* ignore */
    }

    return {
      authenticated: false,
      redirectTo: "/",
      logout: Boolean(error),
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

    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (res.ok) {
        const body = (await res.json()) as {
          authenticated?: boolean;
          user?: { id: string; email: string; name: string | null };
        };
        if (body.authenticated && body.user) {
          return {
            id: body.user.id,
            email: body.user.email,
            name: body.user.name ?? body.user.email,
          };
        }
      }
    } catch {
      /* ignore */
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
