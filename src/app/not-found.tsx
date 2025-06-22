"use client";

import { Authenticated } from "@refinedev/core";
import { ErrorComponent } from "@refinedev/mui";
import { Suspense } from "react";
import { ColorModeContextProvider } from "@contexts/color-mode";
import { RefineSnackbarProvider } from "@refinedev/mui";

export default function NotFound() {
  return (
    <ColorModeContextProvider>
      <RefineSnackbarProvider>
    <Suspense>
      <Authenticated key="not-found">
        <ErrorComponent />
      </Authenticated>
    </Suspense>
      </RefineSnackbarProvider>
    </ColorModeContextProvider>
  );
}
