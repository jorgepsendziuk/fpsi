"use client";

import { AccountPrivacyConsentGate } from "./AccountPrivacyConsentGate";
import { CookieConsentBanner } from "./CookieConsentBanner";

/** Banner de cookies + aceite de aviso (usuário logado) em todas as rotas. */
export function AppPrivacyChrome() {
  return (
    <>
      <CookieConsentBanner />
      <AccountPrivacyConsentGate />
    </>
  );
}
