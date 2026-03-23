"use client";

import {
  DevtoolsPanel,
  DevtoolsProvider as DevtoolsProviderBase,
} from "@refinedev/devtools";
import React from "react";

/**
 * Refine Devtools abre WebSocket em ws://localhost:5001 (REFINE_DEVTOOLS_PORT).
 * Com `npm run dev` esse servidor não existe → erro no console.
 * Ative só quando usar o devtools server (ex.: refine dev com devtools ou servidor na 5001):
 * NEXT_PUBLIC_REFINE_DEVTOOLS=true
 */
const refineDevtoolsEnabled =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_REFINE_DEVTOOLS === "true";

export const DevtoolsProvider = (props: React.PropsWithChildren) => {
  if (!refineDevtoolsEnabled) {
    return <>{props.children}</>;
  }
  return (
    <DevtoolsProviderBase>
      {props.children}
      <DevtoolsPanel />
    </DevtoolsProviderBase>
  );
};
