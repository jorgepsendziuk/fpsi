import { DevtoolsProvider } from "@providers/devtools";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useNotificationProvider, RefineSnackbarProvider } from "@refinedev/mui";
import routerProvider from "@refinedev/nextjs-router";
import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";
import GppGoodTwoToneIcon from '@mui/icons-material/GppGoodTwoTone';
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
  //const theme = cookieStore.get("theme");
  //const defaultMode = theme?.value === "dark" ? "dark" : "light";
  const defaultMode =  "light";
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
                    notificationProvider={useNotificationProvider}
                    resources={[ 
                      // {
                      //   name: "programa",
                      //   list: "/programa",
                      //   create: "/programa/create",
                      //   edit: "/programa/edit/:id",
                      //   show: "/programa/show/:id",
                      //   meta: {
                      //     canDelete: false
                      //   },
                      // },
                      {
                        name: "diagnostico",
                        identifier: "diagnostico",
                        list: "/diagnostico",
                        // create: "/diagnostico/create",
                        meta: {
                          canDelete: false,
                          label: "Diagnóstico" 

                        },
                      },
                      // {
                      //   name: "medida",
                      //   list: "/medida",
                      //   create: "/medida/create",
                      //   edit: "/medida/edit/:id",
                      //   show: "/medida/show/:id",
                      //   meta: {
                      //     canDelete: false,
                      //     label: "Medidas" 
                      //   },
                      // },
                      // {
                      //   name: "controle",
                      //   list: "/controle",
                      //   create: "/controle/create",
                      //   edit: "/controle/edit/:id",
                      //   show: "/controle/show/:id",
                      //   meta: {
                      //     canDelete: false,
                      //     //parent: "Manutenção",
                      //     label: "Controles" 
                      //   },
                      // },
                      // {
                      //   name: "responsavel",
                      //   list: "/responsavel",
                      //   create: "/responsavel/create",
                      //   edit: "/responsavel/edit/:id",
                      //   show: "/responsavel/show/:id",
                      //   meta: {
                      //     canDelete: false,
                      //     parent: "Tabelas Auxiliares",
                      //     label: "Responsáveis" 
                      //   },
                      // },
                    ]}
                    options={{
                      syncWithLocation: true,
                      warnWhenUnsavedChanges: true,
                      useNewQueryKeys: true,
                      projectId: "PRGNCh-Vt1Pdr-jpCKmI",
                      title: {  
                        icon: <GppGoodTwoToneIcon color="primary" />,
                        text: "FPSI",  // Replace with your custom app name
                      },  
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
