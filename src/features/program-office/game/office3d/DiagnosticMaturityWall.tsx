"use client";

import { Text } from "@react-three/drei";
import { useOfficeExperience } from "../OfficeExperienceContext";
import { getMaturityColorHex, normalizeMaturityScore } from "@/lib/utils/maturity";
import { WORLD_HALF } from "./worldConfig";
import { Clickable3D } from "./Clickable3d";

/** Painéis na parede norte com índices reais de maturidade (cores do diagnóstico). */
export function DiagnosticMaturityWall() {
  const ctx = useOfficeExperience();
  const hw = WORLD_HALF;
  const base = ctx.base;
  const maturidade = ctx.resumo?.maturidade?.slice(0, 5) ?? [];
  const xs = [-2.4, -1.2, 0, 1.2, 2.4];

  if (ctx.resumoLoading) {
    return (
      <group position={[0, 1.25, -hw + 0.14]} rotation={[0.07, 0, 0]}>
        <Text fontSize={0.08} color="#37474f" anchorX="center">
          Carregando diagnóstico…
        </Text>
      </group>
    );
  }

  if (maturidade.length === 0) {
    return (
      <Clickable3D onClick={() => ctx.openIframe(`${base}/diagnostico`, "Diagnóstico e maturidade")} hoverScale={1.03}>
        <group position={[0, 1.28, -hw + 0.14]} rotation={[0.07, 0, 0]}>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[2.8, 0.95]} />
            <meshStandardMaterial color="#e3f2fd" emissive="#bbdefb" emissiveIntensity={0.12} />
          </mesh>
          <Text position={[0, 0.1, 0.04]} fontSize={0.09} anchorX="center" color="#0d47a1">
            Diagnóstico PPSI
          </Text>
          <Text position={[0, -0.15, 0.04]} fontSize={0.055} anchorX="center" color="#1565c0">
            Abrir maturidade e medidas
          </Text>
        </group>
      </Clickable3D>
    );
  }

  return (
    <>
      <Text
        position={[0, 1.78, -hw + 0.12]}
        rotation={[0.07, 0, 0]}
        fontSize={0.078}
        anchorX="center"
        color="#1a237e"
        outlineWidth={0.02}
        outlineColor="#e8eaf6"
      >
        Diagnóstico — índices de maturidade
      </Text>
      {maturidade.map((m, i) => {
        const score = normalizeMaturityScore(m.score);
        const color = getMaturityColorHex(score);
        const x = xs[i] ?? 0;
        const pct = Math.round(score * 100);
        return (
          <Clickable3D
            key={m.diagnostico_id}
            hoverScale={1.05}
            onClick={() =>
              ctx.openIframe(`${base}/diagnostico?diagnostico=${m.diagnostico_id}`, m.nome || "Diagnóstico")
            }
          >
            <group position={[x, 1.22, -hw + 0.14]} rotation={[0.07, 0, 0]}>
              <mesh position={[0, 0, 0.015]}>
                <planeGeometry args={[1.05, 0.92]} />
                <meshStandardMaterial color="#eceff1" roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.28, 0.018]}>
                <planeGeometry args={[0.92, 0.12]} />
                <meshStandardMaterial color="#cfd8dc" roughness={0.9} />
              </mesh>
              <mesh position={[(-0.46 * (1 - score)), -0.28, 0.024]}>
                <planeGeometry args={[0.92 * Math.max(score, 0.04), 0.1]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
              </mesh>
              <Text position={[0, 0.28, 0.04]} fontSize={0.052} maxWidth={0.95} anchorX="center" color="#1a237e">
                {m.nome.length > 18 ? `${m.nome.slice(0, 16)}…` : m.nome}
              </Text>
              <Text
                position={[0, 0.02, 0.04]}
                fontSize={0.11}
                anchorX="center"
                color={color}
                outlineWidth={0.022}
                outlineColor="#fff"
              >
                {m.label || `${pct}%`}
              </Text>
              <Text position={[0, -0.12, 0.04]} fontSize={0.048} anchorX="center" color="#455a64">
                iMC {score.toFixed(2)}
              </Text>
            </group>
          </Clickable3D>
        );
      })}
    </>
  );
}
