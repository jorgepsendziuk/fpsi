"use client";

import { Suspense, useMemo } from "react";
import { Image, Text } from "@react-three/drei";
import { useOfficeExperience } from "../OfficeExperienceContext";
import { FPSI_LOGO_PUBLIC_URL, getProgramaLogoDisplayUrl } from "@/lib/utils/programaDemoLogo";
import {
  ANNEX_CORRIDOR_LEN,
  annexCorridorWorldZCenter,
  CORRIDOR_HALF_WIDTH,
  mainSouthOpeningHalf,
  WORLD_HALF,
} from "./worldConfig";

const flat = { roughness: 0.86, metalness: 0.05, flatShading: true as const };

function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "PR";
}

function clip(s: string, max: number) {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/** Logo com fundo claro e moldura — evita sumir na parede. */
function LogoShowcase({
  url,
  width,
  height,
  fallbackInitials,
  accent,
}: {
  url: string | null;
  width: number;
  height: number;
  fallbackInitials: string;
  accent: string;
}) {
  return (
    <group>
      {/* Fundo da vitrine */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width + 0.1, height + 0.1]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.35} {...flat} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[width + 0.02, height + 0.02]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.15} {...flat} />
      </mesh>
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#f7f9fc" emissive="#eef2f7" emissiveIntensity={0.25} {...flat} />
      </mesh>

      {url ? (
        <Suspense
          fallback={
            <Text
              position={[0, 0, 0.02]}
              fontSize={height * 0.38}
              anchorX="center"
              anchorY="middle"
              color={accent}
              outlineWidth={0.03}
              outlineColor="#fff"
            >
              {fallbackInitials}
            </Text>
          }
        >
          <Image url={url} scale={[width * 0.88, height * 0.82]} position={[0, 0, 0.02]} transparent toneMapped={false} />
        </Suspense>
      ) : (
        <>
          <mesh position={[0, 0, 0.016]}>
            <planeGeometry args={[width * 0.78, height * 0.72]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} {...flat} />
          </mesh>
          <Text
            position={[0, 0, 0.028]}
            fontSize={height * 0.42}
            anchorX="center"
            anchorY="middle"
            color="#ffffff"
            outlineWidth={0.04}
            outlineColor="#0d1b2a"
          >
            {fallbackInitials}
          </Text>
        </>
      )}
    </group>
  );
}

type BrandPlaqueProps = {
  position: [number, number, number];
  rotation: [number, number, number];
  badge: string;
  title: string;
  subtitle: string;
  line?: string;
  logoUrl: string | null;
  accent: string;
  accentSoft: string;
  fallbackInitials: string;
  width: number;
  height: number;
};

/**
 * Placa institucional com volume, logo grande e tipografia legível de longe.
 * Face externa da parede (não Billboard).
 */
function BrandPlaque({
  position,
  rotation,
  badge,
  title,
  subtitle,
  line,
  logoUrl,
  accent,
  accentSoft,
  fallbackInitials,
  width,
  height,
}: BrandPlaqueProps) {
  const depth = 0.08;
  const badgeH = 0.32;
  const pad = 0.1;
  const logoW = width - pad * 2.2;
  const logoH = Math.min(0.95, height * 0.42);
  const titleY = -height * 0.12;
  const subY = titleY - 0.28;
  const lineY = subY - 0.2;

  return (
    <group position={position} rotation={rotation}>
      {/* Caixa / relevo da placa */}
      <mesh position={[0, 0, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.1, height + 0.1, depth]} />
        <meshStandardMaterial color="#37474f" {...flat} />
      </mesh>
      <mesh position={[0, 0, 0.002]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.04]} />
        <meshStandardMaterial color="#fafbfd" emissive={accentSoft} emissiveIntensity={0.12} {...flat} />
      </mesh>

      {/* Faixa superior */}
      <mesh position={[0, height / 2 - badgeH / 2, 0.03]}>
        <boxGeometry args={[width, badgeH, 0.05]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} {...flat} />
      </mesh>
      <Text
        position={[0, height / 2 - badgeH / 2, 0.06]}
        fontSize={0.125}
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
        outlineWidth={0.028}
        outlineColor="#0a1628"
        letterSpacing={0.06}
        maxWidth={width - 0.16}
      >
        {badge}
      </Text>

      {/* Logo em destaque */}
      <group position={[0, height / 2 - badgeH - logoH / 2 - 0.12, 0.055]}>
        <LogoShowcase url={logoUrl} width={logoW} height={logoH} fallbackInitials={fallbackInitials} accent={accent} />
      </group>

      {/* Nome principal — bem grande */}
      <Text
        position={[0, titleY, 0.06]}
        fontSize={title.length > 18 ? 0.17 : 0.22}
        anchorX="center"
        anchorY="middle"
        color={accent}
        outlineWidth={0.045}
        outlineColor="#ffffff"
        maxWidth={width - 0.2}
        textAlign="center"
        letterSpacing={0.01}
      >
        {clip(title, 28)}
      </Text>
      <Text
        position={[0, subY, 0.06]}
        fontSize={0.09}
        anchorX="center"
        anchorY="middle"
        color="#37474f"
        outlineWidth={0.022}
        outlineColor="#ffffff"
        maxWidth={width - 0.22}
        textAlign="center"
      >
        {clip(subtitle, 42)}
      </Text>
      {line ? (
        <Text
          position={[0, lineY, 0.06]}
          fontSize={0.072}
          anchorX="center"
          anchorY="middle"
          color="#546e7a"
          outlineWidth={0.018}
          outlineColor="#ffffff"
          maxWidth={width - 0.24}
          textAlign="center"
        >
          {clip(line, 48)}
        </Text>
      ) : null}
    </group>
  );
}

/** Placa vertical nas laterais — logo + nome em tipografia grande. */
function SideBrandPlaque({
  position,
  rotation,
  badge,
  title,
  subtitle,
  logoUrl,
  accent,
  accentSoft,
  fallbackInitials,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  badge: string;
  title: string;
  subtitle: string;
  logoUrl: string | null;
  accent: string;
  accentSoft: string;
  fallbackInitials: string;
}) {
  const w = 2.55;
  const h = 1.85;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.04]} castShadow>
        <boxGeometry args={[w + 0.12, h + 0.12, 0.09]} />
        <meshStandardMaterial color="#455a64" {...flat} />
      </mesh>
      <mesh position={[0, 0, 0.002]} castShadow>
        <boxGeometry args={[w, h, 0.045]} />
        <meshStandardMaterial color="#f5f7fa" emissive={accentSoft} emissiveIntensity={0.14} {...flat} />
      </mesh>

      <mesh position={[0, h / 2 - 0.18, 0.03]}>
        <boxGeometry args={[w, 0.36, 0.05]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.38} {...flat} />
      </mesh>
      <Text
        position={[0, h / 2 - 0.18, 0.06]}
        fontSize={0.11}
        anchorX="center"
        anchorY="middle"
        color="#fff"
        outlineWidth={0.026}
        outlineColor="#0a1628"
        letterSpacing={0.05}
        maxWidth={w - 0.15}
      >
        {badge}
      </Text>

      <group position={[0, 0.28, 0.055]}>
        <LogoShowcase url={logoUrl} width={2.1} height={0.78} fallbackInitials={fallbackInitials} accent={accent} />
      </group>

      <Text
        position={[0, -0.38, 0.06]}
        fontSize={title.length > 16 ? 0.14 : 0.18}
        anchorX="center"
        anchorY="middle"
        color={accent}
        outlineWidth={0.04}
        outlineColor="#fff"
        maxWidth={w - 0.2}
        textAlign="center"
      >
        {clip(title, 24)}
      </Text>
      <Text
        position={[0, -0.62, 0.06]}
        fontSize={0.08}
        anchorX="center"
        anchorY="middle"
        color="#455a64"
        outlineWidth={0.02}
        outlineColor="#fff"
        maxWidth={w - 0.22}
        textAlign="center"
      >
        {clip(subtitle, 40)}
      </Text>
    </group>
  );
}

/** Marca FPSI + programa nas faces externas — placas grandes com logo. */
export function OfficeBrandingTotems() {
  const { programa } = useOfficeExperience();
  const hw = WORLD_HALF;
  const wallT = 0.22;
  const annexMid = annexCorridorWorldZCenter(hw);
  const openingHalf = mainSouthOpeningHalf(CORRIDOR_HALF_WIDTH);
  const southXHalf = hw + wallT;
  const southSegCenterX = (southXHalf + openingHalf) / 2;
  /** Face externa da parede sul (pátio). */
  const southZ = hw + wallT / 2 + 0.06;
  const eastX = hw + wallT / 2 + 0.06;
  const westX = -hw - wallT / 2 - 0.06;

  const programTitle = useMemo(() => {
    const nf = programa.nome_fantasia?.trim();
    const n = programa.nome?.trim();
    return nf || n || "Programa";
  }, [programa.nome, programa.nome_fantasia]);

  const programSubtitle = useMemo(() => {
    const n = programa.nome?.trim();
    const nf = programa.nome_fantasia?.trim();
    if (nf && n && nf !== n) return clip(n, 40);
    if (programa.slug) return `Programa ativo · /${programa.slug}`;
    return "Programa ativo neste escritório";
  }, [programa.nome, programa.nome_fantasia, programa.slug]);

  const programLogo = getProgramaLogoDisplayUrl(programa);
  const programInitials = initialsFromName(programTitle);
  const orgLine = programa.razao_social?.trim() || null;

  return (
    <>
      {/* Sul — ao lado da porta, face para quem chega */}
      <BrandPlaque
        position={[-southSegCenterX, 1.22, southZ]}
        rotation={[0.04, 0, 0]}
        badge="PLATAFORMA"
        title="FPSI"
        subtitle="Software de governança"
        line="PPSI 2.0 · Diagnóstico · Políticas · LGPD"
        logoUrl={FPSI_LOGO_PUBLIC_URL}
        accent="#1a237e"
        accentSoft="#e8eaf6"
        fallbackInitials="FP"
        width={3.35}
        height={1.95}
      />
      <BrandPlaque
        position={[southSegCenterX, 1.22, southZ]}
        rotation={[0.04, 0, 0]}
        badge="PROGRAMA ATIVO"
        title={programTitle}
        subtitle={programSubtitle}
        line={orgLine ? clip(orgLine, 44) : "Comités · Setores · Conformidade"}
        logoUrl={programLogo}
        accent="#00695c"
        accentSoft="#e0f2f1"
        fallbackInitials={programInitials}
        width={3.35}
        height={1.95}
      />

      {/* Laterais da sala principal */}
      <SideBrandPlaque
        position={[westX, 1.15, 0.35]}
        rotation={[0, -Math.PI / 2, 0]}
        badge="ESCRITÓRIO VIRTUAL"
        title="FPSI"
        subtitle="Mesa de governança PPSI"
        logoUrl={FPSI_LOGO_PUBLIC_URL}
        accent="#283593"
        accentSoft="#e8eaf6"
        fallbackInitials="FP"
      />
      <SideBrandPlaque
        position={[eastX, 1.15, -0.25]}
        rotation={[0, Math.PI / 2, 0]}
        badge="PROGRAMA"
        title={programTitle}
        subtitle={programa.slug ? `/${programa.slug}` : "Em execução"}
        logoUrl={programLogo}
        accent="#00695c"
        accentSoft="#e0f2f1"
        fallbackInitials={programInitials}
      />

      {/* Anexo — identidade nas paredes longas */}
      <SideBrandPlaque
        position={[-hw - 0.1, 1.1, annexMid - ANNEX_CORRIDOR_LEN * 0.18]}
        rotation={[0, -Math.PI / 2, 0]}
        badge="ANEXO DE SETORES"
        title="Salas"
        subtitle="Departamentos · corredor sul"
        logoUrl={FPSI_LOGO_PUBLIC_URL}
        accent="#455a64"
        accentSoft="#eceff1"
        fallbackInitials="ST"
      />
      <SideBrandPlaque
        position={[hw + 0.1, 1.1, annexMid + ANNEX_CORRIDOR_LEN * 0.15]}
        rotation={[0, Math.PI / 2, 0]}
        badge="GOVERNANÇA"
        title={clip(programTitle, 18)}
        subtitle="Comités e conformidade"
        logoUrl={programLogo}
        accent="#3949ab"
        accentSoft="#e8eaf6"
        fallbackInitials={programInitials}
      />
    </>
  );
}
