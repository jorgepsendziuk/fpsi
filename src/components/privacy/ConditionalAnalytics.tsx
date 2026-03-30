"use client";

import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";
import { COOKIE_CONSENT_CHANGED_EVENT, hasAnalyticsConsent } from "@/lib/privacy/cookieConsentStorage";

export function ConditionalAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(hasAnalyticsConsent());
    sync();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, sync);
  }, []);

  if (!enabled) return null;
  return <Analytics />;
}
