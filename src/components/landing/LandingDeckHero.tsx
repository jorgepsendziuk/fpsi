"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import GavelIcon from "@mui/icons-material/Gavel";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import {
  WhatsappScene,
  WHATSAPP_SCENE_META,
  type WhatsappVisualKind,
} from "@/components/marketing/WhatsappProductScenes";
import { PRODUCT_SHOWCASE } from "@/lib/marketing/productShowcase";
import styles from "./LandingDeckHero.module.css";

const INTERVAL_MS = 5400;
const SWAP_MS = 720;

/** Slots dos 4 módulos clássicos (preview em slides / deckSlot no catálogo). */
export type LandingDeckSlot = 0 | 1 | 2 | 3;
type Slot = LandingDeckSlot;

const LEGACY_CARDS: {
  slot: Slot;
  label: string;
  caption: string;
  captionClass: string;
  toneClass: string;
}[] = [
  {
    slot: 0,
    label: "Painel",
    caption: "Indicadores e pendências — o que pede atenção hoje",
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
    label: "Gestão de Riscos",
    caption: "Priorize o crítico e acompanhe a mitigação",
    captionClass: styles.captionRisk,
    toneClass: styles.toneRisk,
  },
  {
    slot: 3,
    label: "Conformidade",
    caption: "Tratamentos, portal do titular e evidências para auditoria",
    captionClass: styles.captionConf,
    toneClass: styles.toneConf,
  },
];

const LEGACY_TONE: Record<Slot, { toneClass: string; captionClass: string }> = {
  0: { toneClass: styles.toneDash, captionClass: styles.captionDash },
  1: { toneClass: styles.toneDiag, captionClass: styles.captionDiag },
  2: { toneClass: styles.toneRisk, captionClass: styles.captionRisk },
  3: { toneClass: styles.toneConf, captionClass: styles.captionConf },
};

type DeckCard = {
  index: number;
  id: string;
  label: string;
  caption: string;
  captionClass: string;
  toneClass: string;
  visual?: WhatsappVisualKind;
  deckSlot?: Slot;
};

/** Baralho da landing = catálogo de divulgação (IA, Gov. IA, Portal, Políticas + clássicos). */
const DECK_CARDS: DeckCard[] = PRODUCT_SHOWCASE.map((step, index) => {
  if (step.visual) {
    const meta = WHATSAPP_SCENE_META[step.visual];
    return {
      index,
      id: step.id,
      label: step.label,
      caption: step.title,
      captionClass: meta.captionClass,
      toneClass: meta.tone,
      visual: step.visual,
    };
  }
  const deckSlot = (step.deckSlot ?? 0) as Slot;
  const tone = LEGACY_TONE[deckSlot];
  return {
    index,
    id: step.id,
    label: step.label,
    caption: step.title,
    captionClass: tone.captionClass,
    toneClass: tone.toneClass,
    deckSlot,
  };
});

const SLOT_COUNT = DECK_CARDS.length;

/** Cores oficiais de maturidade (escala 0–1), alinhadas ao MaturityChip. */
function maturityColor01(score01: number): string {
  if (score01 >= 0.9) return "#2E7D32";
  if (score01 >= 0.7) return "#4CAF50";
  if (score01 >= 0.5) return "#F9A825";
  if (score01 >= 0.3) return "#FF9800";
  return "#FF5252";
}

/** Domínios do card usam escala 1–5 (como na UI de diagnóstico). */
function maturityColorLevel(level: number): string {
  return maturityColor01(level / 5);
}

function DashboardScene({ live, fontFamily }: { live: boolean; fontFamily: string }) {
  const kpis = [
    { label: "Maturidade", value: "68%", color: "#1565C0" },
    { label: "Pedidos", value: "2", color: "#0288D1" },
    { label: "Reportes", value: "1", color: "#F9A825" },
    { label: "Riscos", value: "2", color: "#C62828" },
  ];
  const pends = [
    { text: "Reporte: vulnerabilidade", sev: "#C62828" },
    { text: "Pedido de titular em análise", sev: "#F9A825" },
    { text: "Política aguardando revisão", sev: "#0288D1" },
  ];

  return (
    <div className={`${styles.stage} ${styles.stageDash} ${live ? styles.live : ""}`} style={{ fontFamily }}>
      <div className={styles.stageHead}>
        <div className={`${styles.stageIcon} ${styles.stageIconDash}`}>
          <DashboardCustomizeIcon sx={{ fontSize: 18 }} />
        </div>
        <div>
          <div className={styles.stageTitle}>Painel</div>
          <div className={styles.stageSub}>Indicadores · pendências · alertas</div>
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
  const indexPct = 72;
  const indexColor = maturityColor01(indexPct / 100);
  const domains = [
    { name: "Governança", score: 3.6, pips: 4 },
    { name: "Segurança", score: 2.9, pips: 3 },
    { name: "Privacidade", score: 4.1, pips: 4 },
    { name: "Gov. de IA", score: 2.4, pips: 2 },
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
          <div
            className={styles.scoreRing}
            style={{
              ["--p" as string]: indexPct,
              ["--ring" as string]: indexColor,
            }}
          >
            <div className={styles.scoreInner}>
              <div className={styles.scoreNum} style={{ color: indexColor }}>
                {indexPct}
              </div>
              <div className={styles.scoreUnit} style={{ color: `${indexColor}99` }}>
                índice
              </div>
            </div>
          </div>
          <div className={styles.diagMeta}>
            <div className={styles.diagMetaTitle}>Visão consolidada</div>
            <div className={styles.diagMetaLine}>4 domínios · PPSI + Gov. de IA</div>
            <div className={styles.diagMetaLine}>Última avaliação · há 2 dias</div>
          </div>
        </div>
        <div className={styles.domainGrid}>
          {domains.map((d) => {
            const color = maturityColorLevel(d.score);
            return (
              <div
                key={d.name}
                className={styles.domainCard}
                style={{
                  ["--accent" as string]: color,
                  background: `linear-gradient(180deg, ${color}14, #fff)`,
                  borderColor: `${color}33`,
                }}
              >
                <div className={styles.domainName}>{d.name}</div>
                <div className={styles.domainScore} style={{ color }}>
                  {d.score.toFixed(1)}
                </div>
                <div className={styles.domainLvl}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={styles.lvlPip}
                      style={{
                        background: i <= d.pips ? color : `${color}28`,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <span className={`${styles.badge} ${styles.badgePos1} ${styles.badgeToneG}`}>Domínios</span>
      <span className={`${styles.badge} ${styles.badgePos2} ${styles.badgeToneA}`}>Gov. IA</span>
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
          <div className={styles.stageTitle}>Gestão de Riscos</div>
          <div className={styles.stageSub}>Críticos primeiro · mitigação</div>
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
  const treatments = [
    { nome: "Cadastro de famílias", base: "Consentimento", cats: "Identificação · contato" },
    { nome: "Folha de pagamento", base: "Obrigação legal", cats: "Financeiro · RH" },
  ];
  const evidences = [
    { file: "termo_consentimento.pdf", medida: "Medida 12" },
    { file: "print_controle_acesso.png", medida: "Medida 41" },
    { file: "ata_comissao.docx", medida: "Medida 3" },
  ];

  return (
    <div className={`${styles.stage} ${styles.stageConf} ${live ? styles.live : ""}`} style={{ fontFamily }}>
      <div className={styles.stageHead}>
        <div className={`${styles.stageIcon} ${styles.stageIconConf}`}>
          <GavelIcon sx={{ fontSize: 18 }} />
        </div>
        <div>
          <div className={styles.stageTitle}>Conformidade</div>
          <div className={styles.stageSub}>ROPA · pedidos · provas anexadas</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.readLine} />
        <div className={styles.shine} />
        <div className={styles.confStats}>
          <div className={styles.confStat}>
            <div className={styles.confStatN}>12</div>
            <div className={styles.confStatL}>Tratamentos</div>
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
        <div className={styles.confBlockTitle}>Registro de tratamentos</div>
        <div className={styles.confTreatList}>
          {treatments.map((t) => (
            <div key={t.nome} className={styles.confTreat}>
              <div className={styles.confTreatName}>{t.nome}</div>
              <div className={styles.confTreatMeta}>
                <span>{t.base}</span>
                <span>·</span>
                <span>{t.cats}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.confBlockTitle}>Evidências recentes</div>
        <div className={styles.confEvidList}>
          {evidences.map((e) => (
            <div key={e.file} className={styles.confEvid}>
              <AttachFileIcon className={styles.confEvidIcon} sx={{ fontSize: 14 }} />
              <span className={styles.confEvidFile}>{e.file}</span>
              <span className={styles.confEvidMed}>{e.medida}</span>
            </div>
          ))}
        </div>
      </div>

      <span className={`${styles.badge} ${styles.badgePos1} ${styles.badgeToneB}`}>ROPA</span>
      <span className={`${styles.badge} ${styles.badgePos2} ${styles.badgeToneB}`}>Portal</span>
      <span className={`${styles.badge} ${styles.badgePos3} ${styles.badgeToneA}`}>Evidências</span>
    </div>
  );
}

function LegacyScene({ slot, live, fontFamily }: { slot: Slot; live: boolean; fontFamily: string }) {
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

function DeckCardScene({
  card,
  live,
  fontFamily,
}: {
  card: DeckCard;
  live: boolean;
  fontFamily: string;
}) {
  if (card.visual) {
    return <WhatsappScene kind={card.visual} live={live} fontFamily={fontFamily} />;
  }
  return <LegacyScene slot={card.deckSlot ?? 0} live={live} fontFamily={fontFamily} />;
}

export type DeckTilt = "pos" | "neg" | "none";

/** Preview estático de um módulo do baralho — uso em marketing / slides verticais. */
export function LandingDeckScenePreview({
  slot,
  fontFamily,
  tilt = "pos",
  compact = false,
}: {
  slot: Slot;
  fontFamily: string;
  tilt?: DeckTilt;
  /** Menor altura — evita cobrir título/corpo nos slides. */
  compact?: boolean;
}) {
  const meta = LEGACY_CARDS[slot];
  const tiltClass =
    tilt === "neg" ? styles.wrapTiltNeg : tilt === "none" ? styles.wrapTiltNone : styles.wrapTiltPos;
  return (
    <div
      className={`${styles.wrap} ${tiltClass} ${compact ? styles.wrapCompact : ""}`}
      aria-hidden
      style={compact ? undefined : { minHeight: 280 }}
    >
      <div className={styles.blob} />
      <div className={styles.deck}>
        <div className={`${styles.card} ${styles.cardFront}`}>
          <div className={`${styles.cardFrame} ${meta.toneClass}`}>
            <LegacyScene slot={slot} live fontFamily={fontFamily} />
          </div>
        </div>
      </div>
      <div className={`${styles.caption} ${meta.captionClass}`} style={{ fontFamily }}>
        {meta.caption}
      </div>
    </div>
  );
}

type LandingDeckHeroProps = {
  fontFamily: string;
  /** Índice controlado no catálogo PRODUCT_SHOWCASE (0…n-1). */
  slot?: number;
  onSlotChange?: (slot: number) => void;
  /** Autoplay só no modo não controlado (default true). */
  autoPlay?: boolean;
  hideDots?: boolean;
  hideCaption?: boolean;
  captionOverride?: string;
};

/** Baralho: mesmos cards de /divulgacao (IA, Gov. IA, diagnóstico, portal…). */
export function LandingDeckHero({
  fontFamily,
  slot: controlledSlot,
  onSlotChange,
  autoPlay = true,
  hideDots = false,
  hideCaption = false,
  captionOverride,
}: LandingDeckHeroProps) {
  const controlled = controlledSlot !== undefined;
  const [internalSlot, setInternalSlot] = useState(0);
  const frontSlot = controlled ? controlledSlot : internalSlot;
  const [animating, setAnimating] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const prevSlotRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setFrontSlot = useCallback(
    (next: number | ((prev: number) => number)) => {
      const resolve = (prev: number) => (typeof next === "function" ? next(prev) : next);
      if (controlled) {
        const value = resolve(controlledSlot);
        onSlotChange?.(value);
        return;
      }
      setInternalSlot((prev) => {
        const value = resolve(prev);
        onSlotChange?.(value);
        return value;
      });
    },
    [controlled, controlledSlot, onSlotChange],
  );

  useEffect(() => {
    if (!controlled) return;
    if (prevSlotRef.current === null) {
      prevSlotRef.current = controlledSlot;
      return;
    }
    if (prevSlotRef.current === controlledSlot) return;
    prevSlotRef.current = controlledSlot;
    if (reducedMotion) return;
    setAnimating(true);
    const t = window.setTimeout(() => setAnimating(false), SWAP_MS);
    return () => window.clearTimeout(t);
  }, [controlled, controlledSlot, reducedMotion]);

  const nextOf = useCallback((s: number) => (s + 1) % SLOT_COUNT, []);

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
  }, [reducedMotion, nextOf, setFrontSlot]);

  useEffect(() => {
    if (controlled || !autoPlay) return;
    const id = window.setInterval(swap, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [swap, controlled, autoPlay]);

  const goTo = (target: number) => {
    if (target === frontSlot || animating) return;
    const steps = (target - frontSlot + SLOT_COUNT) % SLOT_COUNT;
    if (steps === 1) {
      swap();
      return;
    }
    if (reducedMotion) {
      setFrontSlot(target);
      return;
    }
    setAnimating(true);
    requestAnimationFrame(() => setFrontSlot(target));
    window.setTimeout(() => setAnimating(false), SWAP_MS);
  };

  const backSlot = useMemo(() => nextOf(frontSlot), [frontSlot, nextOf]);
  const meta = DECK_CARDS[frontSlot] ?? DECK_CARDS[0];

  const posClass = (i: number) => {
    if (i === frontSlot) return styles.cardFront;
    if (i === backSlot) return styles.cardBack;
    return styles.cardParked;
  };

  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.blob} />

      <div className={`${styles.deck} ${animating ? styles.deckAnimating : ""}`}>
        {DECK_CARDS.map((card) => {
          const isFront = card.index === frontSlot;
          const isBack = card.index === backSlot;
          return (
            <div key={card.id} className={`${styles.card} ${posClass(card.index)}`}>
              <div className={`${styles.cardFrame} ${card.toneClass}`}>
                <DeckCardScene card={card} live={isFront} fontFamily={fontFamily} />
              </div>
              {isBack && !animating && <span className={styles.backLabel}>{card.label}</span>}
            </div>
          );
        })}
      </div>

      {!hideCaption ? (
        <div
          className={`${styles.caption} ${meta.captionClass} ${animating ? styles.captionDim : ""}`}
          style={{ fontFamily }}
        >
          {captionOverride ?? meta.caption}
        </div>
      ) : null}

      {!hideDots ? (
        <div className={styles.dots}>
          {DECK_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              aria-label={`Mostrar ${card.label}`}
              className={`${styles.dot} ${
                frontSlot === card.index
                  ? styles.dotActive
                  : animating && backSlot === card.index
                    ? styles.dotNext
                    : ""
              }`}
              onClick={() => goTo(card.index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
