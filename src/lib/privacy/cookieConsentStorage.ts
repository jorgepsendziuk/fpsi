export const COOKIE_CONSENT_STORAGE_KEY = "fpsi_cookie_consent_v1";

export const COOKIE_CONSENT_CHANGED_EVENT = "fpsi-cookie-consent-changed";

export type StoredCookieConsent = {
  /** Sempre true quando há registro de decisão */
  essential: true;
  /** Medição/analytics (ex.: Vercel Analytics) */
  analytics: boolean;
  decidedAt: string;
};

function parseStored(raw: string | null): StoredCookieConsent | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<StoredCookieConsent>;
    if (v.essential !== true || typeof v.analytics !== "boolean" || typeof v.decidedAt !== "string") {
      return null;
    }
    return { essential: true, analytics: v.analytics, decidedAt: v.decidedAt };
  } catch {
    return null;
  }
}

export function readCookieConsent(): StoredCookieConsent | null {
  if (typeof window === "undefined") return null;
  return parseStored(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
}

export function writeCookieConsent(consent: Omit<StoredCookieConsent, "essential" | "decidedAt"> & { analytics: boolean }): void {
  if (typeof window === "undefined") return;
  const full: StoredCookieConsent = {
    essential: true,
    analytics: consent.analytics,
    decidedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(full));
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
}

/** Sem decisão ainda: não dispara analytics (privacidade por padrão). */
export function hasAnalyticsConsent(): boolean {
  const c = readCookieConsent();
  return c?.analytics === true;
}

export function hasCookieDecision(): boolean {
  return readCookieConsent() !== null;
}
