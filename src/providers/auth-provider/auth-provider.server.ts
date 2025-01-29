import type { AuthProvider } from "@refinedev/core";
import { createSupabaseServerClient } from "@utils/supabase/server";

export const authProviderServer: Pick<AuthProvider, "check"> = {
  check: async () => {
    const supabaseClient = await createSupabaseServerClient();
    const { data, error } = await supabaseClient.auth.getUser();
    const { user } = data;

    if (error) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }

    if (user) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },
};
