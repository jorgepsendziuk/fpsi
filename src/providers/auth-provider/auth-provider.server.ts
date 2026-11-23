import type { AuthProvider } from "@refinedev/core";
import { cookies } from "next/headers";

import { fpsiSessionCookieName, verifyFpsiSessionToken } from "@/lib/server/fpsi-session";
import { createSupabaseServerClient } from "@utils/supabase/server";

export const authProviderServer: Pick<AuthProvider, "check"> = {
  check: async () => {
    const supabaseClient = await createSupabaseServerClient();
    const { data, error } = await supabaseClient.auth.getUser();
    const { user } = data;

    if (user) {
      return {
        authenticated: true,
      };
    }

    const jar = await cookies();
    const fpsiToken = jar.get(fpsiSessionCookieName())?.value;
    if (fpsiToken) {
      const sessionUser = await verifyFpsiSessionToken(fpsiToken);
      if (sessionUser) {
        return { authenticated: true };
      }
    }

    return {
      authenticated: false,
      logout: Boolean(error),
      redirectTo: "/",
    };
  },
};
