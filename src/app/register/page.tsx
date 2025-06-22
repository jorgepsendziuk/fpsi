import { AuthPage } from "@refinedev/mui";
import { authProviderServer } from "@providers/auth-provider";
import { redirect } from "next/navigation";

export default async function Register() {
  const data = await getData();

  if (data.authenticated) {
    redirect(data?.redirectTo || "/");
  }

  return (
    <AuthPage 
      type="register"
      title="FPSI - Criar Nova Conta"
      wrapperProps={{
        sx: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh'
        }
      }}
      contentProps={{
        sx: {
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%'
        }
      }}
      formProps={{
        defaultValues: {
          email: "",
          password: "",
        },
      }}
    />
  );
}

async function getData() {
  const { authenticated, redirectTo, error } = await authProviderServer.check();

  return {
    authenticated,
    redirectTo,
    error,
  };
} 