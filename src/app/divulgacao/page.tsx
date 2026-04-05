"use client";

import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import {
  DarkModeOutlined,
  LightModeOutlined,
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import LinkNext from "next/link";
import Image from "next/image";
import { useContext, useCallback, useState } from "react";
import { ColorModeContext } from "@contexts/color-mode";

const WHATS_GRUPO = `Oi, pessoal — peço licença ao grupo para um recado pessoal.

Venho desenvolvendo um projeto em paralelo ao trabalho: um site para apoiar programa de privacidade e segurança da informação, alinhado à lei geral de proteção de dados e ao referencial do programa federal nessa área. O código é aberto; quem quiser pode ver como funciona e reutilizar.

É um trabalho de estudo e construção gradual, não uma empresa anunciando produto. Se fizer sentido para você, fico feliz em conversar ou ouvir sugestões.

[COLE AQUI O LINK QUANDO TIVER]

Obrigado pela paciência.`;

const WHATS_ESTUDANTES = `Oi! Queria compartilhar um *projeto pessoal* que estou montando: um site com código aberto para acompanhar programa de privacidade e segurança da informação — útil para ver na prática como ficam cadastros, relatórios e fluxos que a gente costuma estudar na teoria.

Ainda está em evolução; serve bastante para aprender e testar ideias.

[COLE AQUI O LINK]

Se tiver curiosidade ou dúvida, me chama no privado.`;

const WHATS_CURTA = `Projeto pessoal que estou desenvolvendo: site com *código aberto* para apoiar programa de privacidade e segurança da informação (diagnóstico, planos de ação, registros de tratamento de dados, pedidos de titulares, histórico de uso). Link: [SEU LINK]`;

const LINKEDIN_POST = `Um recado curto para quem já me conhece na área de privacidade e segurança da informação.

Venho dedicando parte do meu tempo a um projeto pessoal: o FPSI, uma aplicação web com código aberto pensada para apoiar o dia a dia de programa de privacidade e segurança da informação — da estrutura de responsáveis ao diagnóstico, plano de trabalho, registros exigidos pela lei, pedidos das pessoas titulares e registro de atividades no sistema.

Não é lançamento comercial; é algo que fui construindo aos poucos e que quero deixar transparente. O link fica no primeiro comentário. Sugestões e conversa são bem-vindas.

[LINK NO COMENTÁRIO]`;

/** Lista em linguagem simples (para a página e para copiar). */
const FEATURES_LIST = [
  "Várias pessoas podem usar o mesmo programa, cada uma com o nível de acesso que você definir.",
  "Página de visão geral do programa.",
  "Cadastro da estrutura de governança: quem faz o quê e papéis previstos na lei.",
  "Diagnóstico: avaliação por temas, com níveis de maturidade.",
  "Relatório que resume o diagnóstico.",
  "Plano de trabalho: ações, prazos e acompanhamento.",
  "Mapeamento de dados pessoais tratados pela organização.",
  "Registro das operações de tratamento de dados (ROPA).",
  "Registros de avaliação de impacto na proteção de dados (RIPD / AIPD).",
  "Registro de incidentes envolvendo dados pessoais.",
  "Área para pedidos das pessoas titulares, reportes pelo portal e canal de contato.",
  "Políticas e textos de documentos relacionados ao programa.",
  "Histórico de atividades registradas no sistema.",
  "Referência em texto sobre a lei geral de proteção de dados (consulta no próprio sistema).",
];

const FEATURES_COPY_TEXT = [
  "O que o sistema inclui hoje:",
  "",
  ...FEATURES_LIST.map((f) => `• ${f}`),
  "",
  "Link: [SEU LINK]",
].join("\n");

const EM_UMA_FRASE = [
  "É um projeto pessoal, com código aberto, para organizar e acompanhar programa de privacidade e segurança da informação na web.",
  "Ainda evolui com o tempo; não substitui assessoria jurídica nem garante por si só o atendimento a todos os requisitos legais.",
];

const PRINTS = [
  "Tela inicial ou lista de programas.",
  "Diagnóstico (perguntas ou medidas visíveis).",
  "Relatório do diagnóstico.",
  "Plano de trabalho.",
  "Um cadastro de tratamento de dados ou de pedidos de titulares.",
  "Histórico de atividades.",
];

function CopyBlock({ label, text, onCopied }: { label: string; text: string; onCopied: () => void }) {
  const copy = useCallback(() => {
    void navigator.clipboard.writeText(text).then(() => onCopied());
  }, [text, onCopied]);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Tooltip title="Copiar texto">
          <IconButton size="small" onClick={copy} aria-label={`Copiar ${label}`}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          bgcolor: (t) => (t.palette.mode === "dark" ? "grey.900" : "grey.50"),
          "& pre": { margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", wordBreak: "break-word" },
        }}
      >
        <Typography component="pre" variant="body2" sx={{ fontFamily: "inherit" }}>
          {text}
        </Typography>
      </Paper>
    </>
  );
}

export default function DivulgacaoPage() {
  const { mode, setMode } = useContext(ColorModeContext);
  const [copiedOpen, setCopiedOpen] = useState(false);
  const showCopied = useCallback(() => setCopiedOpen(true), []);

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={1} sx={{ bgcolor: "background.paper", color: "text.primary" }}>
        <Toolbar>
          <IconButton component={LinkNext} href="/" aria-label="Voltar ao início" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
            <Image src="/ico_p.png" alt="" width={28} height={28} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              Notas para divulgação
            </Typography>
          </Box>
          <Chip size="small" label="Sem link no menu" variant="outlined" sx={{ mr: 1, display: { xs: "none", sm: "flex" } }} />
          <Tooltip title={mode === "dark" ? "Modo claro" : "Modo escuro"}>
            <IconButton color="inherit" onClick={() => setMode()}>
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4, pb: 8 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Esta página não aparece em lugar nenhum do app — só quem tem o endereço. Ajuste os placeholders{" "}
          <Typography component="span" variant="body2" sx={{ fontStyle: "italic" }}>
            [SEU LINK]
          </Typography>{" "}
          antes de colar nas redes.
        </Typography>

        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Projeto pessoal — textos para compartilhar
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Rascunhos em tom neutro, sem promessa de produto. Use no WhatsApp (grupos de privacidade, estudantes) ou no LinkedIn com quem você já tem vínculo. Ajuste o link antes de enviar.
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          O que o sistema tem hoje
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Lista em linguagem direta. O botão abaixo copia tudo num bloco só (útil para colar depois de uma mensagem curta).
        </Typography>
        <List dense disablePadding sx={{ mb: 2 }}>
          {FEATURES_LIST.map((f) => (
            <ListItem key={f} disableGutters sx={{ display: "list-item", pl: 2 }}>
              <ListItemText primary={f} primaryTypographyProps={{ variant: "body2" }} />
            </ListItem>
          ))}
        </List>
        <CopyBlock label="Copiar lista de funcionalidades + placeholder de link" text={FEATURES_COPY_TEXT} onCopied={showCopied} />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          WhatsApp — grupos (com pedido de licença)
        </Typography>
        <CopyBlock label="Mensagem para grupo" text={WHATS_GRUPO} onCopied={showCopied} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          WhatsApp — estudantes
        </Typography>
        <CopyBlock label="Tom mais leve / aprendizado" text={WHATS_ESTUDANTES} onCopied={showCopied} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          WhatsApp — versão curta
        </Typography>
        <CopyBlock label="Se o grupo preferir mensagens enxutas" text={WHATS_CURTA} onCopied={showCopied} />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          LinkedIn — post para rede conhecida
        </Typography>
        <CopyBlock label="Texto do post" text={LINKEDIN_POST} onCopied={showCopied} />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Se alguém perguntar em uma frase
        </Typography>
        <List dense disablePadding sx={{ mb: 3 }}>
          {EM_UMA_FRASE.map((p) => (
            <ListItem key={p} disableGutters sx={{ display: "list-item", pl: 2 }}>
              <ListItemText primary={p} primaryTypographyProps={{ variant: "body2" }} />
            </ListItem>
          ))}
        </List>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Sugestão de prints (se quiser anexar)
        </Typography>
        <List dense disablePadding>
          {PRINTS.map((p) => (
            <ListItem key={p} disableGutters sx={{ display: "list-item", pl: 2 }}>
              <ListItemText primary={p} primaryTypographyProps={{ variant: "body2" }} />
            </ListItem>
          ))}
        </List>

        <Snackbar
          open={copiedOpen}
          autoHideDuration={2200}
          onClose={() => setCopiedOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="success" variant="filled" onClose={() => setCopiedOpen(false)} sx={{ width: "100%" }}>
            Copiado para a área de transferência
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
