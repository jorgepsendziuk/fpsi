"use client";

import { Montserrat } from "next/font/google";
import { LandingDeckScenePreview } from "@/components/landing/LandingDeckHero";
import { WhatsappProductPreview } from "@/components/marketing/WhatsappProductScenes";
import type { WhatsappVisualKind } from "@/components/marketing/WhatsappProductScenes";
import { LinkedInShowcaseFrame } from "./LinkedInShowcaseFrame";
import {
  LinkedInInteractiveRiscosShowcase,
} from "./LinkedInInteractiveRiscosShowcase";
import {
  LinkedInLandingTeaser,
  LinkedInNormasShowcase,
  LinkedInOpenSourceShowcase,
  LinkedInProgramModulesShowcase,
} from "./LinkedInCustomShowcases";
import { getShowcaseMeta, type LinkedInShowcaseId } from "./types";

const brandFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ff = brandFont.style.fontFamily;

type Props = {
  id: LinkedInShowcaseId;
  compact?: boolean;
  hideFrameFooter?: boolean;
};

function SceneBody({ id }: { id: LinkedInShowcaseId }) {
  switch (id) {
    case "landing-teaser":
      return <LinkedInLandingTeaser />;
    case "program-modules":
      return <LinkedInProgramModulesShowcase />;
    case "program-dashboard":
      return <LandingDeckScenePreview slot={0} fontFamily={ff} tilt="none" compact />;
    case "diagnostico":
      return <LandingDeckScenePreview slot={1} fontFamily={ff} tilt="none" compact />;
    case "diagnostico-normas":
      return <LinkedInNormasShowcase />;
    case "ai-mapeamento":
      return <WhatsappProductPreview kind="ai" fontFamily={ff} tilt="none" compact />;
    case "aigp":
      return <WhatsappProductPreview kind="aigp" fontFamily={ff} tilt="none" compact />;
    case "program-portal":
      return <WhatsappProductPreview kind="portal" fontFamily={ff} tilt="none" compact />;
    case "riscos-interactive":
      return <LinkedInInteractiveRiscosShowcase />;
    case "riscos-matrix":
      return <LandingDeckScenePreview slot={2} fontFamily={ff} tilt="none" compact />;
    case "conformidade":
      return <LandingDeckScenePreview slot={3} fontFamily={ff} tilt="none" compact />;
    case "opensource-hub":
      return <LinkedInOpenSourceShowcase />;
    default:
      return null;
  }
}

/** Vitrine viva — reutiliza cenas da landing e componentes reais (ex.: heatmap de riscos). */
export function LinkedInShowcase({ id, compact, hideFrameFooter }: Props) {
  const meta = getShowcaseMeta(id);
  return (
    <LinkedInShowcaseFrame meta={meta} compact={compact} hideCaption={hideFrameFooter}>
      <SceneBody id={id} />
    </LinkedInShowcaseFrame>
  );
}

export function LinkedInShowcaseBare({ id }: { id: LinkedInShowcaseId }) {
  return <SceneBody id={id} />;
}

export type { WhatsappVisualKind };
