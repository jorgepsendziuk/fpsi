import { DevtoolsProvider } from "@providers/devtools";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { notificationProvider, RefineSnackbarProvider } from "@refinedev/mui";
import routerProvider from "@refinedev/nextjs-router";
import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";

import { ColorModeContextProvider } from "@contexts/color-mode";
import { authProviderClient } from "@providers/auth-provider";
import { dataProvider } from "@providers/data-provider";

export const metadata: Metadata = {
  title: "FPSI",
  description: "FPSI", 
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme");
  const defaultMode = theme?.value === "dark" ? "dark" : "light";

  return (
    <html lang="pt-BR">
      <body>
        <Suspense>
          <RefineKbarProvider>
            <ColorModeContextProvider defaultMode={defaultMode}>
              <RefineSnackbarProvider>
                <DevtoolsProvider>
                  <Refine
                    routerProvider={routerProvider}
                    authProvider={authProviderClient}
                    dataProvider={dataProvider}
                    notificationProvider={notificationProvider}
                    resources={[
                      {
                        name: "programa",
                        list: "/programa",
                        create: "/programa/create",
                        edit: "/programa/edit/:id",
                        show: "/programa/show/:id",
                        meta: {
                          canDelete: true
                        },
                      },
                      {
                        name: "controle",
                        identifier: "diagnostico",
                        list: "/diagnostico",
                        meta: {
                          canDelete: false,
                          label: "Diagnóstico" 

                        },
                      },
                      {
                        name: "Tabelas Auxiliares",
                      },        
                      {
                        name: "medida",
                        list: "/medida",
                        create: "/medida/create",
                        edit: "/medida/edit/:id",
                        show: "/medida/show/:id",
                        meta: {
                          canDelete: true,
                          parent: "Tabelas Auxiliares",
                          label: "Medidas" 
                        },
                      },
                      {
                        name: "controle",
                        list: "/controle",
                        create: "/controle/create",
                        edit: "/controle/edit/:id",
                        show: "/controle/show/:id",
                        meta: {
                          canDelete: false,
                          parent: "Tabelas Auxiliares",
                          label: "Controles" 
                        },
                      },
                      {
                        name: "responsavel",
                        list: "/responsavel",
                        create: "/responsavel/create",
                        edit: "/responsavel/edit/:id",
                        show: "/responsavel/show/:id",
                        meta: {
                          canDelete: false,
                          parent: "Tabelas Auxiliares",
                          label: "Responsáveis" 
                        },
                      },
                    ]}
                    options={{
                      syncWithLocation: true,
                      warnWhenUnsavedChanges: true,
                      useNewQueryKeys: true,
                      projectId: "PRGNCh-Vt1Pdr-jpCKmI",
                    }}
                  >
                    {children}
                    <RefineKbar />
                  </Refine>
                </DevtoolsProvider>
              </RefineSnackbarProvider>
            </ColorModeContextProvider>
          </RefineKbarProvider>
        </Suspense>
      </body>
    </html>
  );
}
