import { Header } from "@components/header";
import { authProviderServer } from "@providers/auth-provider";
import { Box } from "@mui/material";
import { redirect } from "next/navigation";
import React from "react";

async function getData() {
  const data = await authProviderServer.check();
  return data;
}

export default async function Layout({ children }: React.PropsWithChildren) {
  const data = await getData();

  if (!data.authenticated) {
    return redirect(data?.redirectTo || "/login");
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header sticky />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        {children}
      </Box>
    </Box>
  );
}
