"use client";

import { useContext, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  DarkModeOutlined,
  LightModeOutlined,
} from "@mui/icons-material";
import LinkNext from "next/link";
import { ColorModeContext } from "@contexts/color-mode";
import {
  BACKLOG,
  BACKLOG_STATUS_LABEL,
  BENEFICIOS,
  CANVAS_BLOCOS,
  OFERTA_COMERCIAL,
  CSD,
  DIRECIONAMENTO,
  GESTAO_META,
  HIPOTESE_STATUS_LABEL,
  HIPOTESES,
  PERSONAS,
  POEMS,
  PREMISSAS,
  RESTRICOES,
  SMART,
  SPRINTS,
  type BacklogStatus,
  type CanvasBloco,
} from "@/lib/gestao/projetoAplicado";

const NAV: { href: string; label: string }[] = [
  { href: "#canvas", label: "1. Canvas" },
  { href: "#desafio", label: "1.1 Desafio" },
  { href: "#solucao", label: "1.2 Solução" },
  { href: "#sprints", label: "2. Experimentação" },
  { href: "#foco", label: "Direcionamento" },
];

const STATUS_COLOR: Record<
  BacklogStatus,
  "default" | "success" | "primary" | "info" | "warning" | "error"
> = {
  feito: "success",
  agora: "primary",
  seguinte: "info",
  depois: "default",
  "nao-fazer": "error",
};

const CANVAS_GRID: Record<CanvasBloco["id"], { col: string; row: string }> = {
  parceiros: { col: "1", row: "1 / 3" },
  atividades: { col: "2", row: "1" },
  recursos: { col: "2", row: "2" },
  proposta: { col: "3", row: "1 / 3" },
  relacionamento: { col: "4", row: "1" },
  canais: { col: "4", row: "2" },
  segmentos: { col: "5", row: "1 / 3" },
  custos: { col: "1 / 4", row: "3" },
  receitas: { col: "4 / 6", row: "3" },
};

function SectionTitle({
  kicker,
  title,
}: {
  kicker?: string;
  title: string;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      {kicker && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}
        >
          {kicker}
        </Typography>
      )}
      <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
    </Box>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
      {items.map((item) => (
        <Typography key={item} component="li" variant="body2" sx={{ mb: 0.75, lineHeight: 1.55 }}>
          {item}
        </Typography>
      ))}
    </Box>
  );
}

function CanvasBoard() {
  return (
    <Box id="canvas" sx={{ scrollMarginTop: 112 }}>
      <SectionTitle kicker="1" title="Canvas do projeto aplicado" />
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 820 }}>
        Leitura atual do negócio — não o canvas de 2024. A proposta de valor no centro é o
        antídoto à tentação de virar “escritório + plataforma”.
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(5, minmax(0, 1fr))",
          },
          gridTemplateRows: { md: "auto auto auto" },
        }}
      >
        {CANVAS_BLOCOS.map((bloco) => {
          const pos = CANVAS_GRID[bloco.id];
          return (
            <Paper
              key={bloco.id}
              variant="outlined"
              sx={{
                p: 2,
                gridColumn: { md: pos.col },
                gridRow: { md: pos.row },
                bgcolor: bloco.destaque ? "action.hover" : "background.paper",
                borderColor: bloco.destaque ? "primary.main" : "divider",
                borderWidth: bloco.destaque ? 2 : 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.25 }}>
                {bloco.titulo}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.25 }}>
                {bloco.pergunta}
              </Typography>
              <BulletList items={bloco.itens} />
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

function DesafioSection() {
  return (
    <Box id="desafio" sx={{ scrollMarginTop: 112 }}>
      <SectionTitle kicker="1.1" title="Desafio" />
      <Typography variant="body1" sx={{ mb: 3, maxWidth: 820 }}>
        Depois de dois anos, o desafio deixou de ser “existe sistema?”. Passou a ser:{" "}
        <strong>para quem isto é a ferramenta certa, e o que não devemos virar</strong> — em especial
        diante de ofertas comerciais que vendem assessoria e mencionam a plataforma de passagem.
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
        1.1.1 Análise de contexto
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        1.1.1.1 Matriz CSD
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          mb: 4,
        }}
      >
        {(
          [
            { title: "Certezas", items: CSD.certezas, color: "success.main" },
            { title: "Suposições", items: CSD.suposicoes, color: "warning.main" },
            { title: "Dúvidas", items: CSD.duvidas, color: "info.main" },
          ] as const
        ).map((col) => (
          <Paper key={col.title} variant="outlined" sx={{ p: 2, borderTop: 3, borderTopColor: col.color }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              {col.title}
            </Typography>
            <BulletList items={col.items} />
          </Paper>
        ))}
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        1.1.1.2 Observação POEMS
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(5, minmax(0, 1fr))" },
          mb: 4,
        }}
      >
        {(
          [
            ["People", POEMS.people],
            ["Objects", POEMS.objects],
            ["Environment", POEMS.environment],
            ["Messages", POEMS.messages],
            ["Services", POEMS.services],
          ] as const
        ).map(([title, items]) => (
          <Paper key={title} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              {title}
            </Typography>
            <BulletList items={items} />
          </Paper>
        ))}
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
        1.1.2 Personas
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          mb: 4,
        }}
      >
        {PERSONAS.map((p) => (
          <Paper key={p.id} variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {p.nome}
            </Typography>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
              {p.papel}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.25, mb: 1.5, color: "text.secondary" }}>
              {p.recorte}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }} display="block">
              Dores
            </Typography>
            <BulletList items={p.dores} />
            <Typography variant="caption" sx={{ fontWeight: 800, mt: 1.25 }} display="block">
              Quer
            </Typography>
            <BulletList items={p.oQueQuer} />
            <Typography variant="caption" sx={{ fontWeight: 800, mt: 1.25 }} display="block">
              Não quer
            </Typography>
            <BulletList items={p.oQueNaoQuer} />
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2">{p.relacaoFpsi}</Typography>
          </Paper>
        ))}
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
        1.1.3 Benefícios e justificativas
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          mb: 4,
        }}
      >
        {BENEFICIOS.map((b) => (
          <Paper key={b.titulo} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.75 }}>
              {b.titulo}
            </Typography>
            <Typography variant="body2">{b.texto}</Typography>
          </Paper>
        ))}
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
        1.1.4 Hipóteses
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {HIPOTESES.map((h) => (
          <Paper key={h.id} variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, flexWrap: "wrap" }}>
              <Chip size="small" label={h.id} />
              <Chip
                size="small"
                label={HIPOTESE_STATUS_LABEL[h.status]}
                color={h.status === "em-curso" ? "primary" : "default"}
                variant={h.status === "a-testar" ? "outlined" : "filled"}
              />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              {h.enunciado}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Como testar:</strong> {h.comoTestar}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Critério:</strong> {h.criterio}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function SolucaoSection({
  filtro,
  onFiltro,
}: {
  filtro: BacklogStatus | "todos";
  onFiltro: (v: BacklogStatus | "todos") => void;
}) {
  const items = useMemo(
    () => (filtro === "todos" ? BACKLOG : BACKLOG.filter((b) => b.status === filtro)),
    [filtro],
  );

  return (
    <Box id="solucao" sx={{ scrollMarginTop: 112 }}>
      <SectionTitle kicker="1.2" title="Solução" />

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        1.2.1 Objetivo SMART
      </Typography>
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          {SMART.frase}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          }}
        >
          {(
            [
              ["Específico", SMART.especifico],
              ["Mensurável", SMART.mensuravel],
              ["Atingível", SMART.atingivel],
              ["Relevante", SMART.relevante],
              ["Temporal", SMART.temporal],
            ] as const
          ).map(([k, v]) => (
            <Box key={k}>
              <Typography variant="caption" sx={{ fontWeight: 800 }} color="text.secondary">
                {k}
              </Typography>
              <Typography variant="body2">{v}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        1.2.2 Premissas e restrições
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          mb: 3,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
            Premissas
          </Typography>
          <BulletList items={PREMISSAS} />
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
            Restrições
          </Typography>
          <BulletList items={RESTRICOES} />
        </Paper>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        1.2.3 Backlog de produto
      </Typography>
      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2 }}>
        <Chip
          size="small"
          label="Todos"
          onClick={() => onFiltro("todos")}
          color={filtro === "todos" ? "primary" : "default"}
          variant={filtro === "todos" ? "filled" : "outlined"}
        />
        {(Object.keys(BACKLOG_STATUS_LABEL) as BacklogStatus[]).map((s) => (
          <Chip
            key={s}
            size="small"
            label={BACKLOG_STATUS_LABEL[s]}
            onClick={() => onFiltro(s)}
            color={filtro === s ? STATUS_COLOR[s] : "default"}
            variant={filtro === s ? "filled" : "outlined"}
          />
        ))}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.map((item) => (
          <Paper key={item.id} variant="outlined" sx={{ p: 1.75 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800 }} color="text.secondary">
                {item.id}
              </Typography>
              <Chip size="small" label={item.prioridade} variant="outlined" />
              <Chip
                size="small"
                label={BACKLOG_STATUS_LABEL[item.status]}
                color={STATUS_COLOR[item.status]}
              />
              <Chip size="small" label={item.persona} variant="outlined" />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {item.titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.motivo}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function SprintsSection() {
  return (
    <Box id="sprints" sx={{ scrollMarginTop: 112 }}>
      <SectionTitle kicker="2" title="Área de experimentação" />
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 820 }}>
        Sprints 1–3 são macrociclos reconstruídos a partir do que o produto já é — não sprints
        de duas semanas inventadas. A Sprint 4 é a atual.
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {SPRINTS.map((s) => (
          <Paper key={s.id} variant="outlined" sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mb: 1 }}>
              <Chip
                size="small"
                label={s.retrospectiva ? "Retrospectiva" : "Em curso"}
                color={s.retrospectiva ? "default" : "primary"}
              />
              <Typography variant="caption" color="text.secondary">
                {s.periodo}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {s.nome}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.75, mb: 2 }}>
              {s.objetivo}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Planejamento
            </Typography>
            <BulletList items={s.planejamento} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1.5 }}>
              Execução
            </Typography>
            <BulletList items={s.execucao} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1.5 }}>
              Resultados
            </Typography>
            <BulletList items={s.resultados} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1.5 }}>
              Lições aprendidas
            </Typography>
            {s.licoes.map((l) => (
              <Box key={l.titulo} sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {l.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {l.texto}
                </Typography>
              </Box>
            ))}
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function FocoSection() {
  return (
    <Box id="foco" sx={{ scrollMarginTop: 112 }}>
      <SectionTitle kicker="Leitura de mercado" title="Direcionamento" />
      <Typography variant="body1" sx={{ mb: 3, maxWidth: 860 }}>
        O mercado de compliance já entende um tipo de oferta: banca na frente, software no fundo.
        Serve de espelho — não de modelo a copiar.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
          O que esse tipo de oferta é
        </Typography>
        <Typography variant="body2">{OFERTA_COMERCIAL.oQueE}</Typography>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          mb: 3,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.5, borderTop: 3, borderTopColor: "success.main" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
            Absorver
          </Typography>
          {OFERTA_COMERCIAL.absorver.map((a) => (
            <Box key={a.item} sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {a.item}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {a.detalhe}
              </Typography>
            </Box>
          ))}
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, borderTop: 3, borderTopColor: "error.main" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
            Recusar
          </Typography>
          {OFERTA_COMERCIAL.recusar.map((a) => (
            <Box key={a.item} sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {a.item}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {a.detalhe}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, bgcolor: "action.hover" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
          Veredito
        </Typography>
        <Typography variant="body1">{OFERTA_COMERCIAL.veredito}</Typography>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        Wedge
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, maxWidth: 720 }}>
        {DIRECIONAMENTO.wedge}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
        Isto não é
      </Typography>
      <BulletList items={DIRECIONAMENTO.naoE} />

      <Typography variant="h6" sx={{ fontWeight: 800, mt: 3, mb: 1 }}>
        90 dias
      </Typography>
      <BulletList items={DIRECIONAMENTO.noventaDias} />

      <Paper variant="outlined" sx={{ p: 2.5, mt: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
          Sobre o medo de falhar tarde
        </Typography>
        <Typography variant="body1">{DIRECIONAMENTO.medo}</Typography>
      </Paper>
    </Box>
  );
}

export function GestaoProjetoPage() {
  const { mode, setMode } = useContext(ColorModeContext);
  const [filtro, setFiltro] = useState<BacklogStatus | "todos">("todos");

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{ bgcolor: "background.paper", color: "text.primary" }}
      >
        <Toolbar>
          <IconButton component={LinkNext} href="/" aria-label="Voltar" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }} noWrap>
              {GESTAO_META.titulo}
            </Typography>
          </Box>
          <Chip size="small" label={GESTAO_META.status} sx={{ mr: 1, display: { xs: "none", sm: "inline-flex" } }} />
          <Tooltip title={mode === "dark" ? "Modo claro" : "Modo escuro"}>
            <IconButton color="inherit" onClick={() => setMode()}>
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
        </Toolbar>
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            px: 2,
            pb: 1,
            overflowX: "auto",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          {NAV.map((item) => (
            <Button
              key={item.href}
              href={item.href}
              size="small"
              sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap", minWidth: "auto" }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, pb: 10 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1, maxWidth: 800 }}>
          {GESTAO_META.subtitulo}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 4 }}>
          {GESTAO_META.periodo} · atualizado em {GESTAO_META.atualizadoEm}
        </Typography>

        <CanvasBoard />
        <Divider sx={{ my: 5 }} />
        <DesafioSection />
        <Divider sx={{ my: 5 }} />
        <SolucaoSection filtro={filtro} onFiltro={setFiltro} />
        <Divider sx={{ my: 5 }} />
        <SprintsSection />
        <Divider sx={{ my: 5 }} />
        <FocoSection />

        <Box sx={{ mt: 5, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button variant="contained" component={LinkNext} href="/demo/login">
            Abrir demo
          </Button>
          <Button variant="outlined" component={LinkNext} href="/sobre">
            Sobre o projeto
          </Button>
          <Button variant="outlined" component={LinkNext} href="/artigo">
            Artigo
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
