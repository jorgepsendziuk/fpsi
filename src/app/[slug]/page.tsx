"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Policy as PrivacyIcon, Send as SendIcon, Search as SearchIcon } from "@mui/icons-material";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";
import LinkIcon from "@mui/icons-material/Link";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ContactMailIcon from "@mui/icons-material/ContactMail";

type PortalData = {
  id: number;
  nome: string | null;
  slug: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | number | null;
  atendimento_fone: string | null;
  atendimento_email: string | null;
  atendimento_site: string | null;
  dpo_nome: string | null;
  dpo_email: string | null;
  link_politica_privacidade: string | null;
  link_aviso_titular: string | null;
  link_cookies: string | null;
  link_declaracao_seguranca: string | null;
  link_reportar_vulnerabilidade: string | null;
};

const RESERVED_SLUGS = new Set([
  "programas", "login", "sobre", "perfil", "api", "auth", "register", "forgot-password", "demo", "favicon.ico",
]);

const TIPOS_DSAR = [
  { value: "acesso", label: "Acesso aos dados" },
  { value: "correcao", label: "Correção" },
  { value: "exclusao", label: "Exclusão" },
  { value: "portabilidade", label: "Portabilidade" },
  { value: "revogacao_consentimento", label: "Revogação de consentimento" },
];

const STATUS_PEDIDO: Record<string, string> = {
  recebido: "Recebido",
  em_analise: "Em análise",
  atendido: "Atendido",
  recusado: "Recusado",
  parcial: "Parcial",
};

// Links fake por enquanto (quando a API não retorna URL)
const FAKE_LINK = "#";

export default function PortalPrivacidadePage() {
  const params = useParams();
  const theme = useTheme();
  const slug = params.slug as string;
  const [data, setData] = useState<PortalData | null>(null);
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
  const [protocolo, setProtocolo] = useState<string | null>(null);

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
  const [consultaPedidos, setConsultaPedidos] = useState<Array<{ protocolo: string | null; tipo: string; status: string; data_prazo_resposta: string | null; created_at: string }>>([]);
  const [consultaError, setConsultaError] = useState<string | null>(null);
  const [consultaFezBusca, setConsultaFezBusca] = useState(false);

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
      setProtocolo(json.protocolo ?? null);
      setForm({ tipo: "acesso", nome_titular: "", email_titular: "", documento_titular: "", descricao_pedido: "" });
    } catch (err) {
      setSubmitError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
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
        setConsultaError(json.error ?? "Não foi possível consultar.");
        return;
      }
      setConsultaPedidos(json.pedidos ?? []);
    } catch (err) {
      setConsultaPedidos([]);
      setConsultaError("Erro de conexão. Tente novamente.");
    } finally {
      setConsultaLoading(false);
    }
  };

  const nomeExibicao = data?.nome_fantasia || data?.razao_social || data?.nome || "Portal do Titular";

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width="60%" height={56} />
        <Skeleton variant="rectangular" height={320} sx={{ mt: 2 }} />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="error" gutterBottom>
          {error ?? "Programa não encontrado"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verifique o endereço ou entre em contato com a organização.
        </Typography>
      </Container>
    );
  }

  if (protocolo) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Pedido registrado
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Seu pedido foi recebido e será analisado conforme os prazos previstos na LGPD.
          </Typography>
          <Box sx={{ py: 2.5, px: 3, bgcolor: alpha(theme.palette.primary.main, 0.08), borderRadius: 2, display: "inline-block" }}>
            <Typography variant="overline" color="text.secondary" fontWeight="600">Protocolo</Typography>
            <Typography variant="h5" fontFamily="monospace" fontWeight="bold" sx={{ mt: 0.5 }}>
              {protocolo}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            Guarde este número para acompanhamento. Em caso de dúvidas, entre em contato pelos canais informados nesta página.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const linkPolitica = data.link_politica_privacidade || FAKE_LINK;
  const linkAviso = data.link_aviso_titular || FAKE_LINK;
  const linkCookies = data.link_cookies || FAKE_LINK;
  const linkDeclaracao = data.link_declaracao_seguranca || FAKE_LINK;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ width: 56, height: 56, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main" }}>
          <PrivacyIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          
        <Typography variant="h4" fontWeight="bold" >{nomeExibicao}</Typography>
        <Typography variant="h5" component="h1" color="text.secondary">Portal de Privacidade e Segurança da Informação</Typography>
        </Box>
      </Box>

      {/* Bloco compacto: Informações básicas + Informações de contato (sem accordion) */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="overline" color="text.secondary" fontWeight="700" sx={{ letterSpacing: "0.08em" }}>Informações básicas</Typography>
            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              {data.razao_social && <Typography variant="body2"><strong>Razão social:</strong> {data.razao_social}</Typography>}
              {data.nome_fantasia && <Typography variant="body2"><strong>Nome fantasia:</strong> {data.nome_fantasia}</Typography>}
              {data.cnpj != null && data.cnpj !== "" && <Typography variant="body2"><strong>CNPJ:</strong> {String(data.cnpj)}</Typography>}
              {!data.razao_social && !data.nome_fantasia && (data.cnpj == null || data.cnpj === "") && (
                <Typography variant="body2" color="text.secondary">—</Typography>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="overline" color="text.secondary" fontWeight="700" sx={{ letterSpacing: "0.08em" }}>Informações de contato</Typography>
            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              {(data.dpo_nome || data.dpo_email) && (
                <Typography variant="body2"><strong>Encarregado/DPO:</strong> {[data.dpo_nome, data.dpo_email].filter(Boolean).join(" — ")}</Typography>
              )}
              {data.atendimento_fone && <Typography variant="body2"><strong>Telefone:</strong> {data.atendimento_fone}</Typography>}
              {data.atendimento_email && (
                <Typography variant="body2"><strong>E-mail:</strong> <MuiLink href={`mailto:${data.atendimento_email}`}>{data.atendimento_email}</MuiLink></Typography>
              )}
              {data.atendimento_site && (
                <Typography variant="body2"><strong>Site:</strong> <MuiLink href={data.atendimento_site} target="_blank" rel="noopener noreferrer">{data.atendimento_site}</MuiLink></Typography>
              )}
              {!data.dpo_nome && !data.dpo_email && !data.atendimento_fone && !data.atendimento_email && !data.atendimento_site && (
                <Typography variant="body2" color="text.secondary">—</Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Duas colunas: accordions (esquerda) | formulário DSAR (direita) */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 400px" }, gap: 4, alignItems: "start" }}>
        <Box>
          {/* Privacidade — sempre aberto */}
          <Accordion defaultExpanded elevation={0} sx={{ border: "1px solid", borderColor: "divider", "&:before": { display: "none" }, borderRadius: "8px !important", mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <LinkIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">Privacidade</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <List dense disablePadding>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><LinkIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={<MuiLink href={linkPolitica} target="_blank" rel="noopener">Política de Privacidade</MuiLink>} />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><LinkIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={<MuiLink href={linkAviso} target="_blank" rel="noopener">Aviso do Portal do Titular</MuiLink>} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 28 }}><LinkIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={<MuiLink href={linkCookies} target="_blank" rel="noopener">Cookies</MuiLink>} />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Seus direitos — sempre aberto */}
          <Accordion defaultExpanded elevation={0} sx={{ border: "1px solid", borderColor: "divider", "&:before": { display: "none" }, borderRadius: "8px !important", mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <GavelIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">Seus direitos</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <List dense disablePadding>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><LinkIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={<MuiLink href="#solicitar">Requisição de Direitos</MuiLink>} secondary="Formulário ao lado para acesso, correção, exclusão, portabilidade ou revogação de consentimento (art. 18 LGPD)." />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 28 }}><LinkIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={<MuiLink href="#solicitar">Prazos e acompanhamento</MuiLink>} secondary="Resposta em até 15 dias quando cabível. Guarde o protocolo após enviar o pedido." />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Segurança — fechado por padrão; com formulários de reportar e contato */}
          <Accordion defaultExpanded={true} elevation={0} sx={{ border: "1px solid", borderColor: "divider", "&:before": { display: "none" }, borderRadius: "8px !important" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <SecurityIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">Segurança</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <List dense disablePadding sx={{ mb: 1.5 }}>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 28 }}><LinkIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={<MuiLink href={linkDeclaracao} target="_blank" rel="noopener">Declaração de Segurança</MuiLink>} />
                </ListItem>
              </List>

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
        </Box>

        {/* Coluna direita: formulário DSAR */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider", position: { md: "sticky" }, top: { md: 24 } }} id="solicitar">
          <Typography variant="h6" fontWeight="bold" gutterBottom>Requisição de Direitos</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Os dados informados serão utilizados apenas para atendimento do seu pedido e cumprimento de obrigações legais.
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

          <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Acompanhar sua requisição</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Informe o protocolo recebido e/ou e-mail e/ou documento (CPF) para consultar o status.
            </Typography>
            <form onSubmit={handleConsultar}>
              <Stack spacing={1.5}>
                {consultaError && <Alert severity="error" onClose={() => setConsultaError(null)}>{consultaError}</Alert>}
                <TextField size="small" fullWidth label="Protocolo" value={consultaForm.protocolo} onChange={(e) => setConsultaForm((f) => ({ ...f, protocolo: e.target.value }))} placeholder="Ex.: PT-2025-00001" />
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
                    {consultaPedidos.map((ped, i) => (
                      <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={0.5}>
                          <Typography variant="body2" fontWeight="bold">{ped.protocolo ?? "—"}</Typography>
                          <Typography variant="caption" color="text.secondary">{STATUS_PEDIDO[ped.status] ?? ped.status}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">{TIPOS_DSAR.find((t) => t.value === ped.tipo)?.label ?? ped.tipo}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Aberto em {new Date(ped.created_at).toLocaleDateString("pt-BR")}
                          {ped.data_prazo_resposta && ` · Prazo para resposta: ${new Date(ped.data_prazo_resposta).toLocaleDateString("pt-BR")}`}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
