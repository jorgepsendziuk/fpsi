import { DevtoolsProvider } from "@providers/devtools";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useNotificationProvider, RefineSnackbarProvider } from "@refinedev/mui";
import routerProvider from "@refinedev/nextjs-router";
import { Metadata, Viewport } from "next";
import Script from "next/script";
import React, { Suspense } from "react";
import GppGoodTwoToneIcon from '@mui/icons-material/GppGoodTwoTone';
import Image from 'next/image';
import { ColorModeContextProvider } from "@contexts/color-mode";
import { authProviderClient } from "@providers/auth-provider";
import { dataProvider } from "@providers/data-provider";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "FPSI - Framework de Privacidade e Segurança da Informação",
  description: "Sistema de diagnóstico de privacidade e segurança da informação para organizações",
  applicationName: "FPSI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FPSI",
  },
  icons: {
    icon: [
      { url: "/ico_p.png", sizes: "any" },
      { url: "/ico_p.png", type: "image/png" },
    ],
    shortcut: "/ico_p.png",
    apple: "/ico_p.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#667eea",
}; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultMode = "light";

  return (
    <html lang="pt-BR">
      <body>
        {process.env.NODE_ENV === "development" && (
          <Script id="fpsi-dev-clear-sw-cache" strategy="beforeInteractive">
            {`(function(){var p=Promise.resolve();if(typeof navigator!=="undefined"&&"serviceWorker"in navigator){p=navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){return r.unregister();}));});}p.then(function(){if(typeof caches!=="undefined"){return caches.keys().then(function(keys){return Promise.all(keys.map(function(k){return caches.delete(k);}));});}}).catch(function(){});})();`}
          </Script>
        )}
        <Suspense>
          <RefineKbarProvider>
            <ColorModeContextProvider defaultMode={defaultMode}>
              <RefineSnackbarProvider preventDuplicate>
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
                        list: "/dashboard",
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
                        list: "/dashboard",
                        meta: {
                          canDelete: false,
                          label: "Relatório (diagnóstico)",
                          hide: true,
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
                      breadcrumb: false,
                    }}
                  >
                    {children}
                    <RefineKbar />
                  </Refine>
                <Analytics />
                </DevtoolsProvider>
              </RefineSnackbarProvider>
            </ColorModeContextProvider>
          </RefineKbarProvider>
        </Suspense>
      </body>
    </html>
  );
}
