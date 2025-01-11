import { AuthPage } from "@refinedev/mui";
import { authProviderServer } from "@providers/auth-provider";
import { redirect } from "next/navigation";
import { AuthPageProps } from "@refinedev/core";

export default async function ForgotPassword() {
  const data = await getData();

  if (data.authenticated) {
    redirect(data?.redirectTo || "/");
  }
  return <AuthPage type="forgotPassword" {...({} as AuthPageProps)} />;
  


}

async function getData() {
  const { authenticated, redirectTo, error } = await authProviderServer.check();

  return {
    authenticated,
    redirectTo,
    error,
  };
}
