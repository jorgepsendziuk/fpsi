"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Link as MuiLink,
  Alert,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Send as SendIcon, Search as SearchIcon } from "@mui/icons-material";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";
import LinkIcon from "@mui/icons-material/Link";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { getProgramaLogoDisplayUrl } from "@/lib/utils/programaDemoLogo";
import type { PortalPublicData } from "@/lib/portal/portalPublicTypes";
import { resolvePortalDocHref, type PortalLegalDoc } from "@/lib/portal/portalLegalLinks";
import { portalPdfHref } from "@/lib/portal/portalPublicPaths";
import { landing } from "@/components/landing/landingTokens";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { portalPanelSx, portalPanelBodySx } from "@/lib/portal/portalPublicUi";
import { PortalPublicHeaderSync } from "@/components/portal/PortalPublicHeaderContext";
import { PortalSectionHeader } from "@/components/portal/PortalSectionHeader";

function PortalDocLink({
  slug,
  doc,
  external,
  published,
  children,
}: {
  slug: string;
  doc: PortalLegalDoc;
  external: string | null;
  published?: boolean;
  children: React.ReactNode;
}) {
  const href = resolvePortalDocHref(slug, external, doc, { preferInternal: Boolean(published) });
  const isRemote = /^https?:\/\//i.test(href);
  if (isRemote) {
    return (
      <MuiLink href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </MuiLink>
    );
  }
  return (
    <MuiLink component={Link} href={href}>
      {children}
    </MuiLink>
  );
}

const RESERVED_SLUGS = new Set([
  "programas", "login", "sobre", "perfil", "api", "auth", "register", "forgot-password", "artigo", "favicon.ico",
]);

const TIPOS_DSAR = [
  { value: "acesso", label: "Acesso aos dados" },
  { value: "correcao", label: "Correção" },
  { value: "exclusao", label: "Exclusão" },
  { value: "portabilidade", label: "Portabilidade" },
  { value: "revogacao_consentimento", label: "Revogação de consentimento" },
  { value: "info_compartilhamento", label: "Informação sobre compartilhamento" },
  { value: "oposicao", label: "Oposição" },
];

const STATUS_PEDIDO: Record<string, string> = {
  recebido: "Recebido",
  em_analise: "Em análise",
  atendido: "Atendido",
  recusado: "Recusado",
  parcial: "Parcial",
};

type PedidoComplemento = {
  texto: string;
  created_at: string;
  prazo_resposta?: string | null;
};

type PedidoConsulta = {
  protocolo: string | null;
  tipo: string;
  status: string;
  data_prazo_resposta: string | null;
  data_resposta: string | null;
  created_at: string;
  updated_at?: string | null;
  nome_titular?: string;
  email_titular?: string;
  documento_titular?: string | null;
  descricao_pedido?: string | null;
  complementos?: PedidoComplemento[];
};

type PedidoConfirmacao = {
  protocolo: string;
  tipo: string;
  nome_titular: string;
  email_titular: string;
  documento_titular: string;
  descricao_pedido: string;
  registradoEm: string;
  data_prazo_resposta: string | null;
};

function formatDatePt(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return iso.includes("T") ? d.toLocaleString("pt-BR") : d.toLocaleDateString("pt-BR");
}

function prazoResumo(iso: string | null | undefined) {
  if (!iso) return { texto: "Não definido", vencido: false };
  const target = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const dias = Math.round((target.getTime() - today.getTime()) / 86400000);
  const data = formatDatePt(iso);
  if (dias > 1) return { texto: `${data} · ${dias} dias restantes`, vencido: false };
  if (dias === 1) return { texto: `${data} · 1 dia restante`, vencido: false };
  if (dias === 0) return { texto: `${data} · vence hoje`, vencido: false };
  return { texto: `${data} · vencido há ${Math.abs(dias)} dia(s)`, vencido: true };
}

function chipStatusColor(status: string): "default" | "info" | "warning" | "success" | "error" {
  if (status === "recebido") return "info";
  if (status === "em_analise" || status === "parcial") return "warning";
  if (status === "atendido") return "success";
  if (status === "recusado") return "error";
  return "default";
}

function ConfirmacaoLinha({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" },
        gap: { xs: 0.25, sm: 1.5 },
        py: 0.65,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function PortalPrivacidadePage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const slug = params.slug as string;
  const [data, setData] = useState<PortalPublicData | null>(null);
  const [loading, setLoading] = useState(!!slug);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    tipo: "acesso",
    nome_titular: "",
    email_titular: "",
    documento_titular: "",
    descricao_pedido: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState<PedidoConfirmacao | null>(null);
  const [protocoloCopiado, setProtocoloCopiado] = useState(false);

  const [formReportar, setFormReportar] = useState({ tipo: "vulnerabilidade" as "vulnerabilidade" | "incidente", nome: "", email: "", descricao: "" });
  const [submittingReportar, setSubmittingReportar] = useState(false);
  const [reportarOk, setReportarOk] = useState(false);
  const [reportarError, setReportarError] = useState<string | null>(null);

  const [formContato, setFormContato] = useState({ nome: "", email: "", assunto: "", mensagem: "" });
  const [submittingContato, setSubmittingContato] = useState(false);
  const [contatoOk, setContatoOk] = useState(false);
  const [contatoError, setContatoError] = useState<string | null>(null);

  const [consultaForm, setConsultaForm] = useState({ protocolo: "", email: "", documento: "" });
  const [consultaLoading, setConsultaLoading] = useState(false);
  const [consultaPedidos, setConsultaPedidos] = useState<PedidoConsulta[]>([]);
  const [consultaError, setConsultaError] = useState<string | null>(null);
  const [consultaFezBusca, setConsultaFezBusca] = useState(false);
  const [pedidoAberto, setPedidoAberto] = useState<PedidoConsulta | null>(null);
  const [complementoTexto, setComplementoTexto] = useState("");
  const [complementoEmail, setComplementoEmail] = useState("");
  const [complementoDocumento, setComplementoDocumento] = useState("");
  const [complementoSending, setComplementoSending] = useState(false);
  const [complementoError, setComplementoError] = useState<string | null>(null);
  const [complementoOk, setComplementoOk] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Slug não informado");
      return;
    }
    if (RESERVED_SLUGS.has(slug.toLowerCase())) {
      setLoading(false);
      setError("Página não encontrada");
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/portal/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Programa não encontrado");
          if (res.status === 503) throw new Error("Serviço temporariamente indisponível. Tente novamente mais tarde.");
          throw new Error("Erro ao carregar dados");
        }
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => {
        setError(err.message ?? "Programa não encontrado");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !form.nome_titular.trim() || !form.email_titular.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/solicitar-dados/${encodeURIComponent(slug)}/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: form.tipo,
          nome_titular: form.nome_titular.trim(),
          email_titular: form.email_titular.trim(),
          documento_titular: form.documento_titular.trim() || null,
          descricao_pedido: form.descricao_pedido.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error ?? "Não foi possível enviar. Tente novamente.");
        return;
      }
      setConfirmacao({
        protocolo: json.protocolo ?? "",
        tipo: form.tipo,
        nome_titular: form.nome_titular.trim(),
        email_titular: form.email_titular.trim(),
        documento_titular: form.documento_titular.trim(),
        descricao_pedido: form.descricao_pedido.trim(),
        registradoEm: new Date().toLocaleString("pt-BR"),
        data_prazo_resposta: json.data_prazo_resposta ?? null,
      });
      setProtocoloCopiado(false);
      setForm({ tipo: "acesso", nome_titular: "", email_titular: "", documento_titular: "", descricao_pedido: "" });
    } catch (err) {
      setSubmitError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const fecharConfirmacao = () => {
    setConfirmacao(null);
    setProtocoloCopiado(false);
  };

  const copiarProtocolo = async () => {
    if (!confirmacao?.protocolo) return;
    try {
      await navigator.clipboard.writeText(confirmacao.protocolo);
      setProtocoloCopiado(true);
      window.setTimeout(() => setProtocoloCopiado(false), 2500);
    } catch {
      setProtocoloCopiado(false);
    }
  };

  const voltarEAcompanhar = () => {
    if (confirmacao?.protocolo) {
      setConsultaForm((f) => ({ ...f, protocolo: confirmacao.protocolo }));
    }
    fecharConfirmacao();
    window.requestAnimationFrame(() => {
      document.getElementById("acompanhar")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleReportar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !formReportar.email.trim() || !formReportar.descricao.trim()) return;
    setSubmittingReportar(true);
    setReportarError(null);
    setReportarOk(false);
    try {
      const res = await fetch(`/api/portal/${encodeURIComponent(slug)}/reportar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: formReportar.tipo,
          nome: formReportar.nome.trim() || null,
          email: formReportar.email.trim(),
          descricao: formReportar.descricao.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setReportarError(json.error ?? "Não foi possível enviar.");
        return;
      }
      setReportarOk(true);
      setFormReportar({ tipo: "vulnerabilidade", nome: "", email: "", descricao: "" });
    } catch (err) {
      setReportarError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmittingReportar(false);
    }
  };

  const handleContato = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !formContato.nome.trim() || !formContato.email.trim() || !formContato.mensagem.trim()) return;
    setSubmittingContato(true);
    setContatoError(null);
    setContatoOk(false);
    try {
      const res = await fetch(`/api/portal/${encodeURIComponent(slug)}/contato`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formContato.nome.trim(),
          email: formContato.email.trim(),
          assunto: formContato.assunto.trim() || null,
          mensagem: formContato.mensagem.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setContatoError(json.error ?? "Não foi possível enviar.");
        return;
      }
      setContatoOk(true);
      setFormContato({ nome: "", email: "", assunto: "", mensagem: "" });
    } catch (err) {
      setContatoError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmittingContato(false);
    }
  };

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    const { protocolo, email, documento } = consultaForm;
    const p = protocolo.trim();
    const em = email.trim().toLowerCase();
    const doc = documento.trim().replace(/\D/g, "");
    if (!p && !em && !doc) {
      setConsultaError("Informe ao menos um: protocolo, e-mail ou documento (CPF).");
      return;
    }
    if (!slug) return;
    setConsultaLoading(true);
    setConsultaError(null);
    setConsultaFezBusca(true);
    try {
      const q = new URLSearchParams();
      if (p) q.set("protocolo", p);
      if (em) q.set("email", em);
      if (doc) q.set("documento", doc);
      const res = await fetch(`/api/solicitar-dados/${encodeURIComponent(slug)}/consultar?${q.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setConsultaPedidos([]);
        setPedidoAberto(null);
        setConsultaError(json.error ?? "Não foi possível consultar.");
        return;
      }
      const lista = (json.pedidos ?? []) as PedidoConsulta[];
      setConsultaPedidos(lista);
      setPedidoAberto(lista.length === 1 ? lista[0] : null);
      setComplementoTexto("");
      setComplementoError(null);
      setComplementoOk(null);
    } catch (err) {
      setConsultaPedidos([]);
      setPedidoAberto(null);
      setConsultaError("Erro de conexão. Tente novamente.");
    } finally {
      setConsultaLoading(false);
    }
  };

  const fecharPedidoAberto = () => {
    setPedidoAberto(null);
    setComplementoTexto("");
    setComplementoError(null);
    setComplementoOk(null);
  };

  const handleComplementar = async () => {
    if (!slug || !pedidoAberto?.protocolo) return;
    const texto = complementoTexto.trim();
    const emailId = consultaForm.email.trim() || complementoEmail.trim();
    const docId = consultaForm.documento.trim() || complementoDocumento.trim();
    if (!emailId && !docId) {
      setComplementoError("Informe o e-mail ou o CPF do pedido para confirmar a identidade.");
      return;
    }
    if (texto.length < 8) {
      setComplementoError("Descreva o detalhe (mínimo 8 caracteres).");
      return;
    }
    setComplementoSending(true);
    setComplementoError(null);
    setComplementoOk(null);
    try {
      const res = await fetch(`/api/solicitar-dados/${encodeURIComponent(slug)}/complementar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocolo: pedidoAberto.protocolo,
          email: emailId || null,
          documento: docId || null,
          texto,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setComplementoError(json.error ?? "Não foi possível registrar o detalhe.");
        return;
      }
      const atualizado = json.pedido as PedidoConsulta;
      setPedidoAberto(atualizado);
      setConsultaPedidos((prev) =>
        prev.map((p) => (p.protocolo === atualizado.protocolo ? atualizado : p))
      );
      setComplementoTexto("");
      setComplementoOk(json.mensagem ?? "Detalhe registrado.");
    } catch {
      setComplementoError("Erro de conexão. Tente novamente.");
    } finally {
      setComplementoSending(false);
    }
  };

  const nomeExibicao = data?.nome_fantasia || data?.razao_social || data?.nome || "Portal do Titular";

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 3.5 } }}>
        <Skeleton variant="text" width="60%" height={56} />
        <Skeleton variant="rectangular" height={320} sx={{ mt: 2, borderRadius: 1.5 }} />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 2.5, md: 3.5 } }}>
        <Typography variant="h5" fontWeight="bold" color="error" gutterBottom>
          {error ?? "Programa não encontrado"}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5 }}>
          Verifique o endereço ou entre em contato com a organização.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/")}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Voltar para a página inicial
        </Button>
      </Container>
    );
  }

  const portalLogoUrl = getProgramaLogoDisplayUrl(data);
  const tipoConfirmacaoLabel = confirmacao
    ? TIPOS_DSAR.find((t) => t.value === confirmacao.tipo)?.label ?? confirmacao.tipo
    : "";

  return (
    <>
      <PortalPublicHeaderSync
        slug={slug}
        orgName={nomeExibicao}
        logoUrl={portalLogoUrl}
        orgDetails={{
          razao_social: data.razao_social,
          cnpj: data.cnpj,
          dpo_nome: data.dpo_nome,
          dpo_email: data.dpo_email,
          dpo_tipo_pessoa: data.dpo_tipo_pessoa,
          dpo_pessoa_natural_nome: data.dpo_pessoa_natural_nome,
          dpo_cnpj: data.dpo_cnpj,
          atendimento_fone: data.atendimento_fone,
          atendimento_email: data.atendimento_email,
          atendimento_site: data.atendimento_site,
        }}
      />
    <Container maxWidth={false} sx={{ maxWidth: 1440, py: { xs: 1.5, md: 2 }, px: { xs: 2, sm: 3, lg: 4 } }}>

      {/* 50/50: documentos + segurança | direitos + requisição */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3, alignItems: "start" }}>
        <Stack spacing={2.5}>
          {/* Documentos hospedados no portal (ou links externos configurados no cadastro) */}
          <Paper elevation={0} sx={{ ...portalPanelSx(theme, { accentTop: true }) }}>
            <Box sx={portalPanelBodySx}>
            <PortalSectionHeader
              icon={<MenuBookIcon />}
              title="Documentos e transparência"
              subtitle="Políticas e avisos publicados pela organização"
              tone="neutral"
            />
            <List dense disablePadding>
              <ListItem
                disablePadding
                sx={{ mb: 1, alignItems: "flex-start", pr: 5 }}
                secondaryAction={
                  <IconButton component={Link} href={portalPdfHref(slug, "termo")} size="small" aria-label="Baixar PDF do Termo de Uso" sx={{ mt: 0.15 }}>
                    <PictureAsPdfIcon fontSize="small" color="primary" />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                  <LinkIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <PortalDocLink slug={slug} doc="termo" external={data.link_termo_uso} published={Boolean(data.documentos_publicados?.termo?.length)}>
                      Termo de Uso do serviço
                    </PortalDocLink>
                  }
                  secondary="Condições de adesão, direitos e responsabilidades (modelo PPSI)."
                />
              </ListItem>
              <ListItem
                disablePadding
                sx={{ mb: 1, alignItems: "flex-start", pr: 5 }}
                secondaryAction={
                  <IconButton component={Link} href={portalPdfHref(slug, "politica")} size="small" aria-label="Baixar PDF da Política de Privacidade" sx={{ mt: 0.15 }}>
                    <PictureAsPdfIcon fontSize="small" color="primary" />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                  <LinkIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <PortalDocLink slug={slug} doc="politica" external={data.link_politica_privacidade} published={Boolean(data.documentos_publicados?.politica?.length)}>
                      Política de Privacidade
                    </PortalDocLink>
                  }
                  secondary="Finalidades, bases legais e direitos do titular."
                />
              </ListItem>
              <ListItem
                disablePadding
                sx={{ mb: 1, alignItems: "flex-start", pr: 5 }}
                secondaryAction={
                  <IconButton component={Link} href={portalPdfHref(slug, "aviso")} size="small" aria-label="Baixar PDF do Aviso do Portal" sx={{ mt: 0.15 }}>
                    <PictureAsPdfIcon fontSize="small" color="primary" />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                  <LinkIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <PortalDocLink slug={slug} doc="aviso" external={data.link_aviso_titular} published={Boolean(data.documentos_publicados?.aviso?.length)}>
                      Aviso do Portal do Titular
                    </PortalDocLink>
                  }
                  secondary="Como usar este canal e o que esperar do atendimento."
                />
              </ListItem>
              <ListItem
                disablePadding
                sx={{ mb: 1, alignItems: "flex-start", pr: 5 }}
                secondaryAction={
                  <IconButton component={Link} href={portalPdfHref(slug, "cookies")} size="small" aria-label="Baixar PDF da Política de Cookies" sx={{ mt: 0.15 }}>
                    <PictureAsPdfIcon fontSize="small" color="primary" />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                  <LinkIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <PortalDocLink slug={slug} doc="cookies" external={data.link_cookies} published={Boolean(data.documentos_publicados?.cookies?.length)}>
                      Política de Cookies
                    </PortalDocLink>
                  }
                  secondary="Uso de cookies e tecnologias similares."
                />
              </ListItem>
              <ListItem
                disablePadding
                sx={{ alignItems: "flex-start", pr: 5 }}
                secondaryAction={
                  <IconButton component={Link} href={portalPdfHref(slug, "declaracao")} size="small" aria-label="Baixar PDF da Declaração de Segurança" sx={{ mt: 0.15 }}>
                    <PictureAsPdfIcon fontSize="small" color="primary" />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                  <LinkIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <PortalDocLink slug={slug} doc="declaracao" external={data.link_declaracao_seguranca} published={Boolean(data.documentos_publicados?.declaracao?.length)}>
                      Declaração de Segurança
                    </PortalDocLink>
                  }
                  secondary="Compromisso com boas práticas de segurança da informação."
                />
              </ListItem>
            </List>
            </Box>
          </Paper>

          {/* Segurança: formulários de reportar e contato */}
          <Accordion
            defaultExpanded
            elevation={0}
            sx={{
              ...portalPanelSx(theme, { accentTop: true, tint: "shield" }),
              "&:before": { display: "none" },
              borderRadius: "12px !important",
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: { xs: 2, sm: 2.5 }, py: 1, bgcolor: alpha(landing.shield, theme.palette.mode === "dark" ? 0.12 : 0.06) }}
            >
              <PortalSectionHeader
                icon={<SecurityIcon />}
                title="Segurança"
                subtitle="Reporte incidentes ou envie mensagem"
                tone="shield"
                mb={0}
              />
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, px: { xs: 2, sm: 2.5 }, pb: { xs: 2, sm: 2.5 } }}>
              {data.link_reportar_vulnerabilidade && /^https?:\/\//i.test(data.link_reportar_vulnerabilidade.trim()) && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Canal adicional de reporte:{" "}
                  <MuiLink href={data.link_reportar_vulnerabilidade.trim()} target="_blank" rel="noopener noreferrer">
                    abrir link oficial
                  </MuiLink>
                </Typography>
              )}

              <Accordion defaultExpanded={false} elevation={0} sx={{ border: "1px solid", borderColor: "divider", "&:before": { display: "none" }, borderRadius: 1, mb: 1, bgcolor: "background.default" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <WarningAmberIcon fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight="600">Reportar vulnerabilidade / incidente</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <form onSubmit={handleReportar}>
                    <Stack spacing={1.5}>
                      {reportarError && <Alert severity="error" onClose={() => setReportarError(null)}>{reportarError}</Alert>}
                      {reportarOk && <Alert severity="success">Reporte recebido com sucesso.</Alert>}
                      <FormControl size="small" fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select value={formReportar.tipo} label="Tipo" onChange={(e) => setFormReportar((f) => ({ ...f, tipo: e.target.value as "vulnerabilidade" | "incidente" }))}>
                          <MenuItem value="vulnerabilidade">Vulnerabilidade</MenuItem>
                          <MenuItem value="incidente">Incidente</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField size="small" fullWidth label="Nome (opcional)" value={formReportar.nome} onChange={(e) => setFormReportar((f) => ({ ...f, nome: e.target.value }))} />
                      <TextField size="small" fullWidth required type="email" label="E-mail" value={formReportar.email} onChange={(e) => setFormReportar((f) => ({ ...f, email: e.target.value }))} />
                      <TextField size="small" fullWidth required multiline rows={2} label="Descrição" value={formReportar.descricao} onChange={(e) => setFormReportar((f) => ({ ...f, descricao: e.target.value }))} />
                      <Button type="submit" variant="outlined" size="small" disabled={submittingReportar || !formReportar.email.trim() || !formReportar.descricao.trim()}>
                        {submittingReportar ? "Enviando…" : "Enviar reporte"}
                      </Button>
                    </Stack>
                  </form>
                </AccordionDetails>
              </Accordion>

              <Accordion defaultExpanded={false} elevation={0} sx={{ border: "1px solid", borderColor: "divider", "&:before": { display: "none" }, borderRadius: 1, bgcolor: "background.default" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ContactMailIcon fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight="600">Contato</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <form onSubmit={handleContato}>
                    <Stack spacing={1.5}>
                      {contatoError && <Alert severity="error" onClose={() => setContatoError(null)}>{contatoError}</Alert>}
                      {contatoOk && <Alert severity="success">Mensagem enviada com sucesso.</Alert>}
                      <TextField size="small" fullWidth required label="Nome" value={formContato.nome} onChange={(e) => setFormContato((f) => ({ ...f, nome: e.target.value }))} />
                      <TextField size="small" fullWidth required type="email" label="E-mail" value={formContato.email} onChange={(e) => setFormContato((f) => ({ ...f, email: e.target.value }))} />
                      <TextField size="small" fullWidth label="Assunto (opcional)" value={formContato.assunto} onChange={(e) => setFormContato((f) => ({ ...f, assunto: e.target.value }))} />
                      <TextField size="small" fullWidth required multiline rows={2} label="Mensagem" value={formContato.mensagem} onChange={(e) => setFormContato((f) => ({ ...f, mensagem: e.target.value }))} />
                      <Button type="submit" variant="outlined" size="small" disabled={submittingContato || !formContato.nome.trim() || !formContato.email.trim() || !formContato.mensagem.trim()}>
                        {submittingContato ? "Enviando…" : "Enviar mensagem"}
                      </Button>
                    </Stack>
                  </form>
                </AccordionDetails>
              </Accordion>
            </AccordionDetails>
          </Accordion>
        </Stack>

        {/* Coluna direita: direitos + formulário DSAR */}
        <Paper
          elevation={0}
          sx={{
            ...portalPanelSx(theme, { accentTop: true, tint: "primary" }),
            scrollMarginTop: { xs: 96, md: 108 },
          }}
          id="solicitar"
        >
          <Box sx={portalPanelBodySx}>
          <PortalSectionHeader
            icon={<GavelIcon />}
            title="Seus direitos (LGPD)"
            subtitle="Art. 18 — acesso, correção, exclusão e demais direitos do titular"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Envie sua requisição abaixo. A organização responde em até <strong>15 dias</strong> quando aplicável.
            Guarde o <strong>protocolo</strong> para acompanhar o andamento.
          </Typography>
          <Divider sx={{ mb: 2.5 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Os dados informados serão usados somente para atendimento do pedido.
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {submitError && <Alert severity="error" onClose={() => setSubmitError(null)}>{submitError}</Alert>}
              <FormControl fullWidth required size="small">
                <InputLabel>Tipo de pedido</InputLabel>
                <Select value={form.tipo} label="Tipo de pedido" onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
                  {TIPOS_DSAR.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField fullWidth required size="small" label="Nome completo" value={form.nome_titular} onChange={(e) => setForm((f) => ({ ...f, nome_titular: e.target.value }))} />
              <TextField fullWidth required type="email" size="small" label="E-mail" value={form.email_titular} onChange={(e) => setForm((f) => ({ ...f, email_titular: e.target.value }))} />
              <TextField fullWidth size="small" label="Documento (CPF – opcional)" value={form.documento_titular} onChange={(e) => setForm((f) => ({ ...f, documento_titular: e.target.value }))} />
              <TextField fullWidth multiline rows={3} size="small" label="Descrição ou justificativa (opcional)" value={form.descricao_pedido} onChange={(e) => setForm((f) => ({ ...f, descricao_pedido: e.target.value }))} />
              <Button type="submit" variant="contained" size="large" fullWidth startIcon={<SendIcon />} disabled={submitting || !form.nome_titular.trim() || !form.email_titular.trim()}>
                {submitting ? "Enviando…" : "Enviar pedido"}
              </Button>
            </Stack>
          </form>

          <Box id="acompanhar" sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider", scrollMarginTop: { xs: 96, md: 108 } }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Acompanhar sua requisição</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Consulte o status com o número de protocolo, o CPF ou o e-mail informados no pedido.
            </Typography>
            <form onSubmit={handleConsultar}>
              <Stack spacing={1.5}>
                {consultaError && <Alert severity="error" onClose={() => setConsultaError(null)}>{consultaError}</Alert>}
                <TextField size="small" fullWidth label="Protocolo" value={consultaForm.protocolo} onChange={(e) => setConsultaForm((f) => ({ ...f, protocolo: e.target.value }))} placeholder="Ex.: PT-org-2026-A3F9C2B1E0" />
                <TextField size="small" fullWidth type="email" label="E-mail" value={consultaForm.email} onChange={(e) => setConsultaForm((f) => ({ ...f, email: e.target.value }))} />
                <TextField size="small" fullWidth label="Documento (CPF)" value={consultaForm.documento} onChange={(e) => setConsultaForm((f) => ({ ...f, documento: e.target.value }))} placeholder="Apenas números" />
                <Button type="submit" variant="outlined" size="medium" fullWidth startIcon={<SearchIcon />} disabled={consultaLoading || (!consultaForm.protocolo.trim() && !consultaForm.email.trim() && !consultaForm.documento.trim())}>
                  {consultaLoading ? "Consultando…" : "Consultar"}
                </Button>
              </Stack>
            </form>
            {consultaFezBusca && (
              <Box sx={{ mt: 2 }}>
                {consultaPedidos.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Nenhuma requisição encontrada com os dados informados.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {consultaPedidos.map((ped, i) => {
                      const prazo = prazoResumo(ped.data_prazo_resposta);
                      return (
                      <Paper
                        key={ped.protocolo ?? i}
                        variant="outlined"
                        sx={{ p: 1.5, cursor: "pointer", "&:hover": { borderColor: "primary.main" } }}
                        onClick={() => {
                          setPedidoAberto(ped);
                          setComplementoTexto("");
                          setComplementoError(null);
                          setComplementoOk(null);
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={0.5}>
                          <Typography variant="body2" fontWeight="bold">{ped.protocolo ?? "—"}</Typography>
                          <Chip size="small" label={STATUS_PEDIDO[ped.status] ?? ped.status} color={chipStatusColor(ped.status)} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">{TIPOS_DSAR.find((t) => t.value === ped.tipo)?.label ?? ped.tipo}</Typography>
                        <Typography variant="caption" color={prazo.vencido ? "error" : "text.secondary"}>
                          Aberto em {formatDatePt(ped.created_at)}
                          {ped.data_prazo_resposta ? ` · Prazo: ${prazo.texto}` : ""}
                        </Typography>
                        <Typography variant="caption" color="primary" sx={{ display: "block", mt: 0.5, fontWeight: 700 }}>
                          Ver detalhes
                        </Typography>
                      </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            )}
          </Box>
          </Box>
        </Paper>
      </Box>
    </Container>

      <Dialog
        open={Boolean(confirmacao)}
        onClose={fecharConfirmacao}
        fullWidth
        maxWidth="sm"
        aria-labelledby="pedido-registrado-titulo"
      >
        {confirmacao && (
          <>
            <DialogTitle id="pedido-registrado-titulo" sx={{ position: "relative", pr: 6, pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                <CheckCircleOutlineIcon color="success" sx={{ mt: 0.35 }} />
                <Box>
                  <Typography variant="h6" fontWeight={800} component="span">
                    Pedido registrado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
                    Recebemos sua requisição. Ela será analisada conforme os prazos da LGPD.
                  </Typography>
                </Box>
              </Box>
              <IconButton
                aria-label="Fechar"
                onClick={fecharConfirmacao}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Box
                sx={{
                  mt: 1,
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                }}
              >
                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                  Protocolo
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                  <Typography variant="h6" fontFamily="monospace" fontWeight={800} sx={{ wordBreak: "break-all" }}>
                    {confirmacao.protocolo || "—"}
                  </Typography>
                  {confirmacao.protocolo ? (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={protocoloCopiado ? <CheckIcon /> : <ContentCopyIcon />}
                      onClick={() => void copiarProtocolo()}
                      sx={{ textTransform: "none", fontWeight: 700, flexShrink: 0 }}
                    >
                      {protocoloCopiado ? "Copiado" : "Copiar protocolo"}
                    </Button>
                  ) : null}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  Guarde este número. Depois você pode acompanhar o pedido nesta mesma página usando o
                  protocolo ou o CPF (se informado). O e-mail também pode ser usado na consulta.
                </Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                Confirme os dados da requisição
              </Typography>
              <ConfirmacaoLinha label="Tipo" value={tipoConfirmacaoLabel} />
              <ConfirmacaoLinha label="Nome" value={confirmacao.nome_titular} />
              <ConfirmacaoLinha label="E-mail" value={confirmacao.email_titular} />
              <ConfirmacaoLinha
                label="CPF"
                value={confirmacao.documento_titular || "Não informado"}
              />
              <ConfirmacaoLinha
                label="Descrição"
                value={confirmacao.descricao_pedido || "Não informada"}
              />
              <ConfirmacaoLinha label="Registrado em" value={confirmacao.registradoEm} />
              <ConfirmacaoLinha label="Status" value="Recebido" />
              <ConfirmacaoLinha
                label="Prazo de resposta"
                value={confirmacao.data_prazo_resposta ? prazoResumo(confirmacao.data_prazo_resposta).texto : "15 dias (LGPD)"}
              />
            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap", justifyContent: "space-between" }}>
              <Button
                onClick={voltarEAcompanhar}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Acompanhar pedido
              </Button>
              <Button
                variant="contained"
                onClick={fecharConfirmacao}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Voltar ao portal
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={Boolean(pedidoAberto)}
        onClose={fecharPedidoAberto}
        fullWidth
        maxWidth="sm"
        aria-labelledby="pedido-acompanhar-titulo"
      >
        {pedidoAberto && (
          <>
            <DialogTitle id="pedido-acompanhar-titulo" sx={{ position: "relative", pr: 6, pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                <CheckCircleOutlineIcon color="primary" sx={{ mt: 0.35 }} />
                <Box>
                  <Typography variant="h6" fontWeight={800} component="span">
                    Acompanhar requisição
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
                    Confira o status, os prazos e, se precisar, acrescente detalhes ao pedido.
                  </Typography>
                </Box>
              </Box>
              <IconButton
                aria-label="Fechar"
                onClick={fecharPedidoAberto}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Box
                sx={{
                  mt: 1,
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                }}
              >
                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                  Protocolo
                </Typography>
                <Typography variant="h6" fontFamily="monospace" fontWeight={800} sx={{ wordBreak: "break-all", mt: 0.5 }}>
                  {pedidoAberto.protocolo || "—"}
                </Typography>
                <Chip
                  size="small"
                  sx={{ mt: 1 }}
                  label={STATUS_PEDIDO[pedidoAberto.status] ?? pedidoAberto.status}
                  color={chipStatusColor(pedidoAberto.status)}
                />
              </Box>

              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                Dados da requisição
              </Typography>
              <ConfirmacaoLinha label="Tipo" value={TIPOS_DSAR.find((t) => t.value === pedidoAberto.tipo)?.label ?? pedidoAberto.tipo} />
              <ConfirmacaoLinha label="Nome" value={pedidoAberto.nome_titular || "—"} />
              <ConfirmacaoLinha label="E-mail" value={pedidoAberto.email_titular || "—"} />
              <ConfirmacaoLinha label="CPF" value={pedidoAberto.documento_titular || "Não informado"} />
              <ConfirmacaoLinha label="Descrição" value={pedidoAberto.descricao_pedido || "Não informada"} />
              <ConfirmacaoLinha label="Aberto em" value={formatDatePt(pedidoAberto.created_at)} />
              <ConfirmacaoLinha
                label="Prazo de resposta"
                value={prazoResumo(pedidoAberto.data_prazo_resposta).texto}
              />
              {pedidoAberto.data_resposta ? (
                <ConfirmacaoLinha label="Respondido em" value={formatDatePt(pedidoAberto.data_resposta)} />
              ) : null}
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25, mb: 0.5 }}>
                O prazo legal é de 15 dias, prorrogável por mais 15 mediante justificativa (LGPD, art. 18, § 3º).
                Novos detalhes renovam o prazo em 15 dias enquanto o pedido estiver em andamento.
              </Typography>

              {(pedidoAberto.complementos?.length ?? 0) > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                    Detalhes acrescentados
                  </Typography>
                  <Stack spacing={1}>
                    {(pedidoAberto.complementos ?? []).map((c, i) => (
                      <Paper key={i} variant="outlined" sx={{ p: 1.25 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDatePt(c.created_at)}
                          {c.prazo_resposta ? ` · prazo: ${formatDatePt(c.prazo_resposta)}` : ""}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                          {c.texto}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}

              {pedidoAberto.status !== "atendido" && pedidoAberto.status !== "recusado" ? (
                <Box sx={{ mt: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.75 }}>
                    Acrescentar detalhes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Inclua informações que ajudem no atendimento. O prazo de resposta será atualizado para 15 dias a
                    partir de hoje.
                  </Typography>
                  {complementoError && (
                    <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setComplementoError(null)}>
                      {complementoError}
                    </Alert>
                  )}
                  {complementoOk && (
                    <Alert severity="success" sx={{ mb: 1.5 }} onClose={() => setComplementoOk(null)}>
                      {complementoOk}
                    </Alert>
                  )}
                  {!consultaForm.email.trim() && !consultaForm.documento.trim() && (
                    <Stack spacing={1.5} sx={{ mb: 1.5 }}>
                      <TextField
                        size="small"
                        fullWidth
                        type="email"
                        label="E-mail do pedido"
                        value={complementoEmail}
                        onChange={(e) => setComplementoEmail(e.target.value)}
                      />
                      <TextField
                        size="small"
                        fullWidth
                        label="CPF do pedido"
                        value={complementoDocumento}
                        onChange={(e) => setComplementoDocumento(e.target.value)}
                      />
                    </Stack>
                  )}
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    rows={3}
                    label="Novo detalhe"
                    value={complementoTexto}
                    onChange={(e) => setComplementoTexto(e.target.value)}
                    placeholder="Ex.: complemento de dados, documentos, esclarecimento do pedido…"
                  />
                  <Button
                    variant="contained"
                    sx={{ mt: 1.5, textTransform: "none", fontWeight: 700 }}
                    disabled={complementoSending || complementoTexto.trim().length < 8}
                    onClick={() => void handleComplementar()}
                  >
                    {complementoSending ? "Enviando…" : "Registrar detalhe e atualizar prazo"}
                  </Button>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Este pedido já foi encerrado. Para novas informações, abra outra requisição ou use o contato do portal.
                </Alert>
              )}
            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button variant="contained" onClick={fecharPedidoAberto} sx={{ textTransform: "none", fontWeight: 700 }}>
                Voltar ao portal
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
