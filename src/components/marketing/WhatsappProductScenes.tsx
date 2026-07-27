"use client";

import { useEffect, useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PublicIcon from "@mui/icons-material/Public";
import PolicyIcon from "@mui/icons-material/Policy";
import PsychologyIcon from "@mui/icons-material/Psychology";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import TitleIcon from "@mui/icons-material/Title";
import styles from "@/components/landing/LandingDeckHero.module.css";
import type { DeckTilt } from "@/components/landing/LandingDeckHero";

export type WhatsappVisualKind = "ai" | "portal" | "politicas" | "aigp";

const AI_BATCHES = [
  [
    { nome: "Cadastro de famílias", chips: ["Consentimento", "RH", "Identificação"] },
    { nome: "Folha de pagamento", chips: ["Obrigação legal", "Financeiro"] },
    { nome: "Atendimento ao cidadão", chips: ["Interesse legítimo", "Ouvidoria"] },
  ],
  [
    { nome: "Portal do colaborador", chips: ["Execução de contrato", "TI"] },
    { nome: "Câmeras de segurança", chips: ["Legítimo interesse", "Físico"] },
    { nome: "Newsletter institucional", chips: ["Consentimento", "Marketing"] },
  ],
  [
    { nome: "Processo seletivo", chips: ["Pré-contratual", "RH"] },
    { nome: "App de ponto", chips: ["Obrigação legal", "Biometria"] },
    { nome: "Ouvidoria digital", chips: ["Obrigação legal", "Protocolo"] },
  ],
] as const;

function AiScene({ live, fontFamily }: { live: boolean; fontFamily: string }) {
  const [batch, setBatch] = useState(0);
  const [phase, setPhase] = useState<"spark" | "items">("spark");

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    const run = () => {
      setPhase("spark");
      window.setTimeout(() => {
        if (cancelled) return;
        setPhase("items");
      }, 480);
    };
    run();
    const id = window.setInterval(() => {
      setBatch((b) => (b + 1) % AI_BATCHES.length);
      run();
    }, 3200);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [live]);

  const items = AI_BATCHES[batch];

  return (
    <div className={`${styles.stage} ${styles.stageAi} ${live ? styles.live : ""}`} style={{ fontFamily }}>
      <div className={styles.stageHead}>
        <div className={`${styles.stageIcon} ${styles.stageIconAi}`}>
          <AutoAwesomeIcon sx={{ fontSize: 18 }} />
        </div>
        <div>
          <div className={styles.stageTitle}>Mapeamento por IA</div>
          <div className={styles.stageSub}>Sugestões · base legal · você decide</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.shine} />
        {phase === "spark" ? (
          <div className={styles.aiSparkWrap} key={`spark-${batch}`}>
            <span className={styles.aiSparkBurst} />
            <AutoAwesomeIcon className={styles.aiSparkIcon} />
            <div className={styles.aiSparkLabel}>Gerando sugestões…</div>
          </div>
        ) : (
          <div className={styles.aiSuggestList} key={`items-${batch}`}>
            {items.map((s, i) => (
              <div
                key={s.nome}
                className={styles.aiSuggestRow}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <span className={styles.aiCheck} aria-hidden />
                <div className={styles.aiSuggestBody}>
                  <div className={styles.aiSuggestName}>{s.nome}</div>
                  <div className={styles.aiChipRow}>
                    {s.chips.map((c) => (
                      <span key={c} className={styles.aiChip}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className={styles.aiFooter}>
          <span className={styles.aiPill}>Revisão humana</span>
          <span className={styles.aiCtaFake}>Gravar no mapeamento</span>
        </div>
      </div>

      <span className={`${styles.badge} ${styles.badgePos1} ${styles.badgeToneA}`}>IA</span>
      <span className={`${styles.badge} ${styles.badgePos2} ${styles.badgeToneB}`}>Mapeamento</span>
      <span className={`${styles.badge} ${styles.badgePos3} ${styles.badgeToneG}`}>Revisão</span>
    </div>
  );
}

function PortalScene({ live, fontFamily }: { live: boolean; fontFamily: string }) {
  const rights = [
    { label: "Acesso", Icon: VisibilityOutlinedIcon },
    { label: "Correção", Icon: EditOutlinedIcon },
    { label: "Eliminação", Icon: DeleteOutlineIcon },
    { label: "Portab.", Icon: SwapHorizIcon },
  ];

  return (
    <div className={`${styles.stage} ${styles.stagePortal} ${live ? styles.live : ""}`} style={{ fontFamily }}>
      <div className={styles.stageHead}>
        <div className={`${styles.stageIcon} ${styles.stageIconPortal}`}>
          <PublicIcon sx={{ fontSize: 18 }} />
        </div>
        <div>
          <div className={styles.stageTitle}>Portal do titular</div>
          <div className={styles.stageSub}>Pedidos · protocolo</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.shine} />
        <div className={styles.portalHeroLine}>sua-org.exemplo</div>
        <div className={`${styles.portalRights} ${styles.portalRightsCompact}`}>
          {rights.map(({ label, Icon }) => (
            <div key={label} className={styles.portalRight}>
              <Icon sx={{ fontSize: 14, color: "#0288D1" }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className={`${styles.portalForm} ${styles.portalFormCompact}`}>
          <div className={styles.portalFieldRow}>
            <div className={styles.portalFieldHalf}>
              <div className={styles.portalLabel}>Nome</div>
              <div className={styles.portalInput}>Maria Silva</div>
            </div>
            <div className={styles.portalFieldHalf}>
              <div className={styles.portalLabel}>E-mail</div>
              <div className={styles.portalInput}>maria@email.com</div>
            </div>
          </div>
          <div className={styles.portalLabel}>Tipo de pedido</div>
          <div className={`${styles.portalInput} ${styles.portalSelect}`}>Acesso aos meus dados ▾</div>
          <div className={styles.portalBtn}>Enviar pedido</div>
        </div>
      </div>

      <span className={`${styles.badge} ${styles.badgePos1} ${styles.badgeToneB}`}>Público</span>
      <span className={`${styles.badge} ${styles.badgePos2} ${styles.badgeToneA}`}>Pedidos</span>
      <span className={`${styles.badge} ${styles.badgePos3} ${styles.badgeToneB}`}>LGPD</span>
    </div>
  );
}

function PoliticasScene({ live, fontFamily }: { live: boolean; fontFamily: string }) {
  return (
    <div className={`${styles.stage} ${styles.stagePol} ${live ? styles.live : ""}`} style={{ fontFamily }}>
      <div className={styles.stageHead}>
        <div className={`${styles.stageIcon} ${styles.stageIconPol}`}>
          <PolicyIcon sx={{ fontSize: 18 }} />
        </div>
        <div>
          <div className={styles.stageTitle}>Editor de Políticas</div>
          <div className={styles.stageSub}>Rich text · v2.1 · assistência IA</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.shine} />
        <div className={styles.polEditor}>
          <div className={styles.polToolbar}>
            <span className={styles.polToolActive}>
              <FormatBoldIcon sx={{ fontSize: 14 }} />
            </span>
            <span className={styles.polTool}>
              <FormatItalicIcon sx={{ fontSize: 14 }} />
            </span>
            <span className={styles.polTool}>
              <TitleIcon sx={{ fontSize: 14 }} />
            </span>
            <span className={styles.polTool}>
              <FormatListBulletedIcon sx={{ fontSize: 14 }} />
            </span>
            <span className={styles.polToolSep} />
            <span className={`${styles.polAiChip} ${live ? styles.polAiChipLive : ""}`}>
              <AutoAwesomeIcon sx={{ fontSize: 11 }} />
              Sugerir
            </span>
            <span className={styles.polToolHint}>Salvo há 2s</span>
          </div>
          <div className={styles.polDoc}>
            <div className={styles.polH1}>1. Objetivo</div>
            <div className={styles.polP}>
              Estabelecer diretrizes para proteger a confidencialidade, integridade e
              disponibilidade das informações da organização
              <span className={styles.polCaret} />
            </div>
            <div className={styles.polH1}>2. Escopo</div>
            <div className={styles.polPDim}>
              Aplica-se a colaboradores, prestadores e sistemas sob responsabilidade do controlador.
            </div>
            <div className={styles.polH1}>3. Responsabilidades</div>
            <div className={styles.polBullet}>• Gestor de SI — coordenação</div>
            <div className={styles.polBullet}>• DPO — orientação LGPD</div>
          </div>
        </div>
      </div>

      <span className={`${styles.badge} ${styles.badgePos1} ${styles.badgeToneA}`}>IA</span>
      <span className={`${styles.badge} ${styles.badgePos2} ${styles.badgeToneG}`}>Versão</span>
      <span className={`${styles.badge} ${styles.badgePos3} ${styles.badgeToneB}`}>PDF</span>
    </div>
  );
}

function AigpScene({ live, fontFamily }: { live: boolean; fontFamily: string }) {
  const systems = [
    { nome: "Chatbot atendimento", risk: "Médio", color: "#F9A825" },
    { nome: "Triagem de currículos", risk: "Alto", color: "#E53935" },
    { nome: "Assistente interno GenAI", risk: "Médio", color: "#F9A825" },
  ];
  const refs = ["NIST AI RMF", "ISO 42001", "OECD AI", "LGPD × IA"];

  return (
    <div className={`${styles.stage} ${styles.stageAigp} ${live ? styles.live : ""}`} style={{ fontFamily }}>
      <div className={styles.stageHead}>
        <div className={`${styles.stageIcon} ${styles.stageIconAigp}`}>
          <PsychologyIcon sx={{ fontSize: 18 }} />
        </div>
        <div>
          <div className={styles.stageTitle}>Governança de IA</div>
          <div className={styles.stageSub}>10 controles · 54 medidas</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.shine} />
        <div className={styles.aigpTop}>
          <div className={styles.aigpRing} style={{ ["--p" as string]: 58, ["--ring" as string]: "#5E35B1" }}>
            <div className={styles.aigpRingInner}>
              <div className={styles.aigpScore}>2.9</div>
              <div className={styles.aigpScoreUnit}>índice</div>
            </div>
          </div>
          <div>
            <div className={styles.aigpMetaTitle}>Inventário de sistemas</div>
            <div className={styles.aigpMetaLine}>Risco · dono · vínculo LGPD</div>
            <div className={styles.aigpMetaLine}>Govern · Map · Measure · Manage</div>
          </div>
        </div>
        <div className={styles.aigpSysList}>
          {systems.map((s) => (
            <div key={s.nome} className={styles.aigpSys}>
              <span className={styles.aigpSysDot} style={{ ["--dot" as string]: s.color }} />
              <span className={styles.aigpSysName}>{s.nome}</span>
              <span className={styles.aigpSysRisk} style={{ ["--risk" as string]: s.color }}>
                {s.risk}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.aigpRefs}>
          {refs.map((r) => (
            <span key={r} className={styles.aigpRef}>
              {r}
            </span>
          ))}
        </div>
      </div>

      <span className={`${styles.badge} ${styles.badgePos1} ${styles.badgeToneA}`}>Gov. IA</span>
      <span className={`${styles.badge} ${styles.badgePos2} ${styles.badgeToneB}`}>NIST</span>
      <span className={`${styles.badge} ${styles.badgePos3} ${styles.badgeToneG}`}>LGPD</span>
    </div>
  );
}

export const WHATSAPP_SCENE_META: Record<
  WhatsappVisualKind,
  { tone: string; caption: string; captionClass: string }
> = {
  ai: {
    tone: styles.toneAi,
    caption: "Mapeamento por IA — sugestões novas, você escolhe o que grava",
    captionClass: styles.captionDiag,
  },
  portal: {
    tone: styles.tonePortal,
    caption: "Portal do titular com direitos e protocolo",
    captionClass: styles.captionConf,
  },
  politicas: {
    tone: styles.tonePol,
    caption: "Editor de políticas com assistência — versão e PDF",
    captionClass: styles.captionDash,
  },
  aigp: {
    tone: styles.toneAigp,
    caption: "Governança de IA — inventário, risco e maturidade",
    captionClass: styles.captionDiag,
  },
};

/** Cena pura (sem frame) — uso no baralho da landing. */
export function WhatsappScene({
  kind,
  live,
  fontFamily,
}: {
  kind: WhatsappVisualKind;
  live: boolean;
  fontFamily: string;
}) {
  if (kind === "ai") return <AiScene live={live} fontFamily={fontFamily} />;
  if (kind === "portal") return <PortalScene live={live} fontFamily={fontFamily} />;
  if (kind === "politicas") return <PoliticasScene live={live} fontFamily={fontFamily} />;
  return <AigpScene live={live} fontFamily={fontFamily} />;
}

/** Card visual estilo baralho para slides WhatsApp (IA, portal, políticas). */
export function WhatsappProductPreview({
  kind,
  fontFamily,
  tilt = "pos",
  compact = false,
}: {
  kind: WhatsappVisualKind;
  fontFamily: string;
  tilt?: DeckTilt;
  compact?: boolean;
}) {
  const meta = WHATSAPP_SCENE_META[kind];
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
          <div className={`${styles.cardFrame} ${meta.tone}`}>
            <WhatsappScene kind={kind} live fontFamily={fontFamily} />
          </div>
        </div>
      </div>
      <div className={`${styles.caption} ${meta.captionClass}`} style={{ fontFamily }}>
        {meta.caption}
      </div>
    </div>
  );
}
