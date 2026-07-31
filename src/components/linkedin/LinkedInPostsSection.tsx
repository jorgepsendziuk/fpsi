"use client";

import { useCallback, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Montserrat } from "next/font/google";
import { landing } from "@/components/landing/landingTokens";
import {
  LINKEDIN_POSTS,
  LINKEDIN_POST_BACKLOG,
  type LinkedInPost,
} from "./linkedinPostsContent";
import { LinkedInShowcase } from "./showcase/LinkedInShowcase";

const brandFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ff = brandFont.style.fontFamily;

function LiveShowcaseSlot({
  label,
  showcaseId,
}: {
  label: string;
  showcaseId: import("./showcase/types").LinkedInShowcaseId;
}) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        variant="caption"
        sx={{ fontFamily: ff, fontWeight: 700, color: landing.navy, mb: 0.75, display: "block" }}
      >
        {label}
      </Typography>
      <LinkedInShowcase id={showcaseId} compact hideFrameFooter />
    </Box>
  );
}

function CopyBlock({
  label,
  text,
  onCopied,
}: {
  label: string;
  text: string;
  onCopied: () => void;
}) {
  const copy = useCallback(() => {
    void navigator.clipboard.writeText(text).then(() => onCopied());
  }, [text, onCopied]);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, fontFamily: ff }}>
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
          bgcolor: "background.default",
          "& pre": { margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" },
        }}
      >
        <Typography
          component="pre"
          sx={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.82rem",
            lineHeight: 1.65,
            color: landing.text,
          }}
        >
          {text}
        </Typography>
      </Paper>
    </Box>
  );
}

function PostAccordion({ post, onCopied }: { post: LinkedInPost; onCopied: () => void }) {
  const fullText = post.commentHint
    ? `${post.feedText}\n\n—\n${post.commentHint}`
    : post.feedText;

  return (
    <Accordion
      id={post.id}
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        "&:not(:last-child)": { borderBottom: 0 },
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", pr: 1 }}>
          <Typography sx={{ fontFamily: ff, fontWeight: 700, fontSize: "1rem" }}>
            {post.title}
          </Typography>
          <Chip
            size="small"
            label={post.status === "ready" ? "Rascunho pronto" : "Ideia"}
            color={post.status === "ready" ? "success" : "default"}
            variant="outlined"
            sx={{ height: 22, fontSize: "0.7rem" }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pb: 3, pt: 0 }}>
        <Typography
          sx={{ fontFamily: ff, fontSize: "0.92rem", color: landing.muted, mb: 2, lineHeight: 1.5 }}
        >
          {post.summary}
        </Typography>

        <CopyBlock label="Texto para o feed" text={fullText} onCopied={onCopied} />

        {post.hashtags && (
          <Typography sx={{ fontFamily: ff, fontSize: "0.85rem", color: "text.secondary", mb: 2 }}>
            Hashtags: {post.hashtags}
          </Typography>
        )}

        <Typography
          variant="subtitle2"
          sx={{ fontFamily: ff, fontWeight: 700, mb: 1.5, color: landing.navy }}
        >
          Prévias ao vivo
        </Typography>
        {post.prints.map((p) => (
          <LiveShowcaseSlot key={`${p.showcaseId}-${p.label}`} label={p.label} showcaseId={p.showcaseId} />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

export function LinkedInPostsSection() {
  const [snack, setSnack] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box component="section" id="posts" sx={{ scrollMarginTop: 24 }}>
      <Typography
        component="h2"
        sx={{ fontFamily: ff, fontWeight: 700, fontSize: "1.35rem", mb: 1, color: landing.navy }}
      >
        Posts temáticos
      </Typography>
      <Typography sx={{ fontFamily: ff, fontSize: "0.95rem", color: landing.muted, mb: 3, lineHeight: 1.55 }}>
        Rascunhos para publicação diária no LinkedIn — cada post traz vitrines interativas do sistema real. Expanda,
        copie o texto e use as prévias como referência visual.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        <Chip
          component="button"
          label="Explorar módulos"
          variant="outlined"
          size="small"
          onClick={() => scrollTo("explorar")}
          sx={{ fontFamily: ff, cursor: "pointer", fontWeight: 600 }}
        />
        <Chip
          component="button"
          label="Artigo longo"
          variant="outlined"
          size="small"
          onClick={() => scrollTo("artigo")}
          sx={{ fontFamily: ff, cursor: "pointer" }}
        />
        {LINKEDIN_POSTS.map((p) => (
          <Chip
            key={p.id}
            component="button"
            label={p.title.split(":")[0]?.split("—")[0]?.trim() ?? p.title}
            variant="outlined"
            size="small"
            onClick={() => scrollTo(p.id)}
            sx={{ fontFamily: ff, cursor: "pointer", maxWidth: 220 }}
          />
        ))}
      </Box>

      <Paper variant="outlined" sx={{ mb: 4, overflow: "hidden" }}>
        {LINKEDIN_POSTS.map((post) => (
          <PostAccordion key={post.id} post={post} onCopied={() => setSnack(true)} />
        ))}
      </Paper>

      <Typography
        component="h3"
        sx={{ fontFamily: ff, fontWeight: 700, fontSize: "1.1rem", mb: 1.5, color: landing.navy }}
      >
        Próximos temas
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {LINKEDIN_POST_BACKLOG.map((item) => (
          <Chip
            key={item.id}
            id={item.id}
            label={item.title}
            variant="outlined"
            size="small"
            title={item.note}
            sx={{ fontFamily: ff }}
          />
        ))}
      </Box>
      <Typography variant="caption" display="block" sx={{ mt: 1.5, color: "text.secondary", fontFamily: ff }}>
        Passe o mouse nos chips para ver a nota. Textos completos serão adicionados conforme publicação.
      </Typography>

      <Snackbar open={snack} autoHideDuration={2500} onClose={() => setSnack(false)}>
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          Texto copiado
        </Alert>
      </Snackbar>
    </Box>
  );
}
