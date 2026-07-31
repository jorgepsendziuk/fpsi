"use client";

import { Box, Button, Chip, Link, Typography, alpha, useTheme } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import type { LinkedInShowcaseMeta } from "./types";

const ff = "var(--font-brand), Montserrat, system-ui, sans-serif";

type Props = {
  meta: LinkedInShowcaseMeta;
  children: React.ReactNode;
  /** Oculta legenda interna quando o pai já descreve */
  hideCaption?: boolean;
  compact?: boolean;
};

export function LinkedInShowcaseFrame({ meta, children, hideCaption, compact }: Props) {
  const theme = useTheme();
  const demoIsExternal = meta.demoHref?.startsWith("http");

  return (
    <Box
      sx={{
        my: 2.5,
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: theme.palette.mode === "dark" ? 4 : "0 12px 40px rgba(10,39,68,0.12)",
        bgcolor: "background.paper",
      }}
    >
      {/* Chrome do browser */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: alpha(theme.palette.text.primary, 0.04),
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", gap: 0.5, mr: 0.5 }}>
          {["#FF5F57", "#FFBD2E", "#28CA41"].map((c) => (
            <Box key={c} sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c, opacity: 0.9 }} />
          ))}
        </Box>
        <Box
          sx={{
            flex: 1,
            px: 1.5,
            py: 0.45,
            borderRadius: 999,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.72rem",
            color: "text.secondary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {meta.urlPath}
        </Box>
        <Chip
          size="small"
          label="Ao vivo"
          color="success"
          variant="outlined"
          sx={{
            height: 22,
            fontSize: "0.65rem",
            fontWeight: 700,
            animation: "linkedin-pulse 2.4s ease-in-out infinite",
            "@keyframes linkedin-pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.65 },
            },
          }}
        />
      </Box>

      <Box sx={{ p: compact ? { xs: 1.5, sm: 2 } : { xs: 2, sm: 2.5 }, minHeight: compact ? 200 : 280 }}>
        {children}
      </Box>

      {!hideCaption && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.03),
          }}
        >
          <Box>
            <Typography sx={{ fontFamily: ff, fontWeight: 700, fontSize: "0.88rem" }}>
              {meta.label}
            </Typography>
            {meta.caption && (
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: ff }}>
                {meta.caption}
              </Typography>
            )}
          </Box>
          {meta.demoHref && (
            <Button
              component={Link}
              href={meta.demoHref}
              target={demoIsExternal ? "_blank" : undefined}
              rel={demoIsExternal ? "noopener noreferrer" : undefined}
              size="small"
              variant="contained"
              startIcon={demoIsExternal ? <OpenInNewIcon /> : <PlayCircleOutlineIcon />}
              sx={{ fontFamily: ff, fontWeight: 600, textTransform: "none", borderRadius: 2 }}
            >
              {demoIsExternal ? "Ver repositório" : "Experimentar demo"}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
