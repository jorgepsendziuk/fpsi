"use client";

import { PanoramaPageChrome } from "@/components/diagnostico/panorama/PanoramaPageChrome";

export default function PanoramaShortUrlLayout({ children }: { children: React.ReactNode }) {
  return <PanoramaPageChrome>{children}</PanoramaPageChrome>;
}