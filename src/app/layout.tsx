import { DevtoolsProvider } from "@providers/devtools";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useNotificationProvider, RefineSnackbarProvider } from "@refinedev/mui";
import routerProvider from "@refinedev/nextjs-router";
import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";
import GppGoodTwoToneIcon from '@mui/icons-material/GppGoodTwoTone';
import Image from 'next/image';
import { ColorModeContextProvider } from "@contexts/color-mode";
import { authProviderClient } from "@providers/auth-provider";
import { dataProvider } from "@providers/data-provider";

export const metadata: Metadata = {
  title: "FPSI - Framework de Privacidade e Segurança da Informação",
  description: "Sistema de diagnóstico de privacidade e segurança da informação para organizações", 
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
  const defaultMode = "light";

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
                      {
                        name: "programas",
                        identifier: "programas",
                        list: "/programas",
                        meta: {
                          canDelete: false,
                          label: "Programas",
                          icon: <GppGoodTwoToneIcon />
                        },
                      },
                      {
                        name: "diagnostico",
                        identifier: "diagnostico",
                        list: "/diagnostico",
                        meta: {
                          canDelete: false,
                          label: "Diagnóstico (Legacy)",
                          hide: true // Ocultar da navegação
                        },
                      },
                      {
                        name: "relatorio",
                        identifier: "relatorio",
                        list: "/diagnostico/relatorio",
                        meta: {
                          canDelete: false,
                          label: "Relatório",
                          dataProviderName: "default"
                        },
                      },
                    ]}
                    options={{
                      syncWithLocation: true,
                      warnWhenUnsavedChanges: true,
                      useNewQueryKeys: true,
                      projectId: "PRGNCh-Vt1Pdr-jpCKmI",
                      title: {  
                        icon: (
                          <Image 
                            src="/logo_p.png" 
                            alt="FPSI Logo" 
                            width={24} 
                            height={24} 
                          />
                        ),
                        text: "FPSI",
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
