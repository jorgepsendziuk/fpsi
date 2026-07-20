"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import GavelIcon from "@mui/icons-material/Gavel";
import styles from "./LandingDeckHero.module.css";

const INTERVAL_MS = 5400;
const SWAP_MS = 720;
const SLOT_COUNT = 4;

type Slot = 0 | 1 | 2 | 3;

const CARDS: {
  slot: Slot;
  label: string;
  caption: string;
  captionClass: string;
  toneClass: string;
}[] = [
  {
    slot: 0,
    label: "Dashboard",
    caption: "Painel operacional — KPIs e pendências do programa",
    captionClass: styles.captionDash,
    toneClass: styles.toneDash,
  },
  {
    slot: 1,
    label: "Diagnóstico",
    caption: "Maturidade por domínio com visão consolidada",
    captionClass: styles.captionDiag,
    toneClass: styles.toneDiag,
  },
  {
    slot: 2,
    label: "Riscos",
    caption: "Matriz de risco — probabilidade × impacto",
    captionClass: styles.captionRisk,
    toneClass: styles.toneRisk,
  },
  {
    slot: 3,
    label: "Conformidade",
    caption: "LGPD — ROPA, RIPD e canais do titular",
    captionClass: styles.captionConf,
    toneClass: styles.toneConf,
  },
];

function DashboardScene({ live, fontFamily }: { live: boolean; fontFamily: string }) {
  const kpis = [
    { label: "Maturidade", value: "68%", color: "#1565C0" },
    { label: "DSAR", value: "2", color: "#0288D1" },
    { label: "Reportes", value: "1", color: "#F9A825" },
    { label: "Riscos", value: "2", color: "#C62828" },
  ];
  const pends = [
    { text: "Reporte: vulnerabilidade", sev: "#C62828" },
    { text: "Pedido DSAR em análise", sev: "#F9A825" },
    { text: "Política aguardando revisão", sev: "#0288D1" },
  ];

  return (
    <div className={`${styles.stage} ${styles.stageDash} ${live ? styles.live : ""}`} style={{ fontFamily }}>
      <div className={styles.stageHead}>
        <div className={`${styles.stageIcon} ${styles.stageIconDash}`}>
          <DashboardCustomizeIcon sx={{ fontSize: 18 }} />
        </div>
        <div>
          <div className={styles.stageTitle}>Dashboard</div>
          <div className={styles.stageSub}>Postura do programa · visão do dia</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.shine} />
        <div className={styles.kpiGrid}>
          {kpis.map((k) => (
            <div key={k.label} className={styles.kpiTile} style={{ ["--kpi" as string]: k.color }}>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiValue}>{k.value}</div>
            </div>
          ))}
        </div>
        <div className={styles.pendTitle}>Pendências</div>
        <div className={styles.pendList}>
          {pends.map((p) => (
            <div key={p.text} className={styles.pendItem}>
              <span className={styles.pendDot} style={{ ["--sev" as string]: p.sev }} />
              {p.text}
            </div>
          ))}
        </div>
      </div>

      <span className={`${styles.badge} ${styles.badgePos1} ${styles.badgeToneA}`}>KPIs</span>
      <span className={`${styles.badge} ${styles.badgePos2} ${styles.badgeToneR}`}>Alertas</span>
      <span className={`${styles.badge} ${styles.badgePos3} ${styles.badgeToneB}`}>Operacional</span>
    </div>
  );
}

function DiagnosticoScene({ live, fontFamily }: { live: boolean; fontFamily: string }) {
  const domains = [
    { name: "Governança", score: "3.6", pips: 4 },
    { name: "Segurança", score: "2.9", pips: 3 },
    { name: "Privacidade", score: "4.1", pips: 4 },
    { name: "IA / AIGP", score: "2.4", pips: 2 },
  ];

  return (
    <div className={`${styles.stage} ${styles.stageDiag} ${live ? styles.live : ""}`} style={{ fontFamily }}>
      <div className={styles.stageHead}>
        <div className={`${styles.stageIcon} ${styles.stageIconDiag}`}>
          <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
        </div>
        <div>
          <div className={styles.stageTitle}>Diagnóstico</div>
          <div className={styles.stageSub}>Dash de maturidade · níveis 1–5</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.scanLine} />
        <div className={styles.shine} />
        <div className={styles.diagTop}>
          <div className={styles.scoreRing} style={{ ["--p" as string]: 72 }}>
            <div className={styles.scoreInner}>
              <div className={styles.scoreNum}>72</div>
              <div className={styles.scoreUnit}>índice</div>
            </div>
          </div>
          <div className={styles.diagMeta}>
            <div className={styles.diagMetaTitle}>Visão consolidada</div>
            <div className={styles.diagMetaLine}>4 domínios · PPSI + AIGP</div>
            <div className={styles.diagMetaLine}>Última avaliação · há 2 dias</div>
          </div>
        </div>
        <div className={styles.domainGrid}>
          {domains.map((d) => (
            <div key={d.name} className={styles.domainCard}>
              <div className={styles.domainName}>{d.name}</div>
              <div className={styles.domainScore}>{d.score}</div>
              <div className={styles.domainLvl}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`${styles.lvlPip} ${i <= d.pips ? styles.lvlPipOn : ""}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className={`${styles.badge} ${styles.badgePos1} ${styles.badgeToneG}`}>Domínios</span>
      <span className={`${styles.badge} ${styles.badgePos2} ${styles.badgeToneA}`}>AIGP</span>
      <span className={`${styles.badge} ${styles.badgePos3} ${styles.badgeToneG}`}>PPSI</span>
    </div>
  );
}

/** Matriz 5×5 — impacto (Y) × probabilidade (X), com células quentes. */
function RiscosScene({ live, fontFamily }: { live: boolean; fontFamily: string }) {
  // score 1–5 mapeia cor; alguns com contagem
  const grid: { heat: number; n?: number; pulse?: boolean }[][] = [
    [{ heat: 1 }, { heat: 1 }, { heat: 2 }, { heat: 3, n: 1 }, { heat: 4 }],
    [{ heat: 1 }, { heat: 2 }, { heat: 3, n: 2 }, { heat: 4, n: 1, pulse: true }, { heat: 5 }],
    [{ heat: 2 }, { heat: 2 }, { heat: 3 }, { heat: 4, n: 1 }, { heat: 5 }],
    [{ heat: 2 }, { heat: 3 }, { heat: 4 }, { heat: 5, n: 1 }, { heat: 5 }],
    [{ heat: 3 }, { heat: 4 }, { heat: 5 }, { heat: 5 }, { heat: 5 }],
  ];

  const heatColor = (h: number) => {
    const map: Record<number, string> = {
      1: "#E8F5E9",
      2: "#FFF9C4",
      3: "#FFE0B2",
      4: "#FFCCBC",
      5: "#EF5350",
    };
    return map[h] ?? "#eee";
  };

  return (
    <div className={`${styles.stage} ${styles.stageRisk} ${live ? styles.live : ""}`} style={{ fontFamily }}>
      <div className={styles.stageHead}>
        <div className={`${styles.stageIcon} ${styles.stageIconRisk}`}>
          <WarningAmberIcon sx={{ fontSize: 18 }} />
        </div>
        <div>
          <div className={styles.stageTitle}>Gestão de riscos</div>
          <div className={styles.stageSub}>Matriz probabilidade × impacto</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.shine} />
        <div className={styles.matrixWrap}>
          <div className={styles.matrixYLabel}>Impacto →</div>
          <div className={styles.matrixMain}>
            <div className={styles.matrix}>
              {[...grid].reverse().flatMap((row, ri) =>
                row.map((cell, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className={`${styles.cell} ${cell.heat >= 4 ? styles.cellHot : ""} ${
                      cell.pulse ? styles.cellPulse : ""
                    }`}
                    style={{ background: heatColor(cell.heat) }}
                  >
                    {cell.n ?? ""}
                  </div>
                ))
              )}
            </div>
            <div className={styles.matrixXLabel}>Probabilidade →</div>
          </div>
        </div>
        <div className={styles.riskLegend}>
          <span className={styles.riskChip} style={{ ["--bg" as string]: "#FFCDD2", ["--fg" as string]: "#B71C1C" }}>
            2 críticos
          </span>
          <span className={styles.riskChip} style={{ ["--bg" as string]: "#FFF3E0", ["--fg" as string]: "#E65100" }}>
            3 em tratamento
          </span>
        </div>
      </div>

      <span className={`${styles.badge} ${styles.badgePos1} ${styles.badgeToneR}`}>Matriz</span>
      <span className={`${styles.badge} ${styles.badgePos2} ${styles.badgeToneA}`}>Residual</span>
      <span className={`${styles.badge} ${styles.badgePos3} ${styles.badgeToneR}`}>Críticos</span>
    </div>
  );
}

function ConformidadeScene({ live, fontFamily }: { live: boolean; fontFamily: string }) {
  return (
    <div className={`${styles.stage} ${styles.stageConf} ${live ? styles.live : ""}`} style={{ fontFamily }}>
      <div className={styles.stageHead}>
        <div className={`${styles.stageIcon} ${styles.stageIconConf}`}>
          <GavelIcon sx={{ fontSize: 18 }} />
        </div>
        <div>
          <div className={styles.stageTitle}>Conformidade LGPD</div>
          <div className={styles.stageSub}>ROPA · RIPD · titulares</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.readLine} />
        <div className={styles.shine} />
        <div className={styles.confStats}>
          <div className={styles.confStat}>
            <div className={styles.confStatN}>12</div>
            <div className={styles.confStatL}>ROPA</div>
          </div>
          <div className={styles.confStat}>
            <div className={styles.confStatN}>3</div>
            <div className={styles.confStatL}>RIPD</div>
          </div>
          <div className={styles.confStat}>
            <div className={styles.confStatN}>5</div>
            <div className={styles.confStatL}>Pedidos</div>
          </div>
        </div>
        <div className={styles.docHead}>Operação · Cadastro de famílias</div>
        <div className={styles.docLines}>
          <div className={styles.docLine} style={{ width: "92%" }} />
          <div className={styles.docLine} style={{ width: "78%" }} />
          <div className={styles.docLine} style={{ width: "64%" }} />
          <div className={styles.docLine} style={{ width: "85%" }} />
        </div>
      </div>

      <span className={`${styles.badge} ${styles.badgePos1} ${styles.badgeToneB}`}>ROPA</span>
      <span className={`${styles.badge} ${styles.badgePos2} ${styles.badgeToneB}`}>RIPD</span>
      <span className={`${styles.badge} ${styles.badgePos3} ${styles.badgeToneA}`}>Titulares</span>
    </div>
  );
}

function Scene({ slot, live, fontFamily }: { slot: Slot; live: boolean; fontFamily: string }) {
  switch (slot) {
    case 0:
      return <DashboardScene live={live} fontFamily={fontFamily} />;
    case 1:
      return <DiagnosticoScene live={live} fontFamily={fontFamily} />;
    case 2:
      return <RiscosScene live={live} fontFamily={fontFamily} />;
    default:
      return <ConformidadeScene live={live} fontFamily={fontFamily} />;
  }
}

/** Baralho: Dashboard → Diagnóstico → Riscos → Conformidade. */
export function LandingDeckHero({ fontFamily }: { fontFamily: string }) {
  const [frontSlot, setFrontSlot] = useState<Slot>(0);
  const [animating, setAnimating] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const nextOf = useCallback((s: Slot): Slot => ((s + 1) % SLOT_COUNT) as Slot, []);

  const swap = useCallback(() => {
    if (reducedMotion) {
      setFrontSlot((s) => nextOf(s));
      return;
    }
    setAnimating(true);
    requestAnimationFrame(() => {
      setFrontSlot((s) => nextOf(s));
    });
    window.setTimeout(() => setAnimating(false), SWAP_MS);
  }, [reducedMotion, nextOf]);

  useEffect(() => {
    const id = window.setInterval(swap, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [swap]);

  const goTo = (slot: Slot) => {
    if (slot === frontSlot || animating) return;
    // Avança até o alvo (no máximo 3 swaps) sem reiniciar conteúdo
    const steps = (slot - frontSlot + SLOT_COUNT) % SLOT_COUNT;
    if (steps === 1) {
      swap();
      return;
    }
    // Salto direto: liga animação e seta front (carta intermediária some no parked)
    if (reducedMotion) {
      setFrontSlot(slot);
      return;
    }
    setAnimating(true);
    requestAnimationFrame(() => setFrontSlot(slot));
    window.setTimeout(() => setAnimating(false), SWAP_MS);
  };

  const backSlot = useMemo(() => nextOf(frontSlot), [frontSlot, nextOf]);
  const meta = CARDS[frontSlot];

  const posClass = (slot: Slot) => {
    if (slot === frontSlot) return styles.cardFront;
    if (slot === backSlot) return styles.cardBack;
    return styles.cardParked;
  };

  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.blob} />

      <div className={`${styles.deck} ${animating ? styles.deckAnimating : ""}`}>
        {CARDS.map((card) => {
          const isFront = card.slot === frontSlot;
          const isBack = card.slot === backSlot;
          return (
            <div key={card.slot} className={`${styles.card} ${posClass(card.slot)}`}>
              <div className={`${styles.cardFrame} ${card.toneClass}`}>
                <Scene slot={card.slot} live={isFront} fontFamily={fontFamily} />
              </div>
              {isBack && !animating && <span className={styles.backLabel}>{card.label}</span>}
            </div>
          );
        })}
      </div>

      <div
        className={`${styles.caption} ${meta.captionClass} ${animating ? styles.captionDim : ""}`}
        style={{ fontFamily }}
      >
        {meta.caption}
      </div>

      <div className={styles.dots}>
        {CARDS.map((card) => (
          <button
            key={card.slot}
            type="button"
            aria-label={`Mostrar ${card.label}`}
            className={`${styles.dot} ${
              frontSlot === card.slot
                ? styles.dotActive
                : animating && backSlot === card.slot
                  ? styles.dotNext
                  : ""
            }`}
            onClick={() => goTo(card.slot)}
          />
        ))}
      </div>
    </div>
  );
}
