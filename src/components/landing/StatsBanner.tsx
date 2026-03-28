"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Fade, Grow } from "@mui/material";
import {
  Assessment as AssessmentIcon,
  Checklist as ChecklistIcon,
  TaskAlt as TaskAltIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
} from "@mui/icons-material";
import controlesJson from "@/lib/services/controles.json";
import medidasMeta from "@/lib/services/medidas.json";

const DIAGNOSTICOS = ["ESTRUTURA", "SEGURANÇA", "PRIVACIDADE"];
const NUM_CONTROLES = (controlesJson as { controles: unknown[] }).controles.length;
const NUM_MEDIDAS = (medidasMeta as { total_medidas_catalogo_ppsi_20: number }).total_medidas_catalogo_ppsi_20;

const LGPD_FERRAMENTAS = [
  "ROPA",
  "RIPD",
  "Incidentes",
  "Pedidos dos titulares",
  "Reportes",
  "Contato",
];

const MODELOS_POLITICA = [
  "Proteção de Dados Pessoais",
  "Backup",
  "Controle de Acesso",
  "Defesas contra Malware",
  "Desenvolvimento de Pessoas",
  "Gerenciamento de Vulnerabilidades",
  "Gestão de Ativos",
  "Logs e Auditoria",
  "Provedor de Serviços",
  "Segurança da Informação",
];

function AnimatedCounter({ target, duration = 800, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 2);
      setValue(Math.round(target * easeOut));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [started, target, duration]);

  return <span>{value}</span>;
}

function AnimatedStat({
  delay,
  icon,
  children,
}: {
  delay: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Grow in={mounted} timeout={350} style={{ transformOrigin: "left center" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box>{icon}</Box>
        <Box sx={{ flex: 1 }}>{children}</Box>
      </Box>
    </Grow>
  );
}

export function StatsBanner() {
  const [titleVisible, setTitleVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTitleVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 560,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
        borderRadius: 2,
        p: 3,
        color: "white",
        overflow: "auto",
      }}
    >
      <Fade in={titleVisible} timeout={400}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
          Conteúdo do Framework
        </Typography>
      </Fade>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <AnimatedStat delay={150} icon={<AssessmentIcon sx={{ fontSize: 28, mt: 0.25, opacity: 0.9 }} />}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            <AnimatedCounter target={DIAGNOSTICOS.length} duration={600} delay={200} /> Diagnósticos
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95, fontSize: "0.85rem" }}>
            {DIAGNOSTICOS.join(", ")}
          </Typography>
        </AnimatedStat>

        <AnimatedStat delay={300} icon={<ChecklistIcon sx={{ fontSize: 28, opacity: 0.9 }} />}>
          <Typography variant="subtitle2" fontWeight="bold">
            <AnimatedCounter target={NUM_CONTROLES} duration={800} delay={400} /> Controles
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Avaliação de maturidade por controle
          </Typography>
        </AnimatedStat>

        <AnimatedStat delay={450} icon={<TaskAltIcon sx={{ fontSize: 28, opacity: 0.9 }} />}>
          <Typography variant="subtitle2" fontWeight="bold">
            <AnimatedCounter target={NUM_MEDIDAS} duration={1000} delay={600} /> Medidas
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Ações práticas vinculadas aos controles
          </Typography>
        </AnimatedStat>

        <AnimatedStat delay={600} icon={<DescriptionIcon sx={{ fontSize: 28, mt: 0.25, opacity: 0.9 }} />}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            <AnimatedCounter target={MODELOS_POLITICA.length} duration={600} delay={800} /> Modelos de Política
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95, fontSize: "0.85rem" }}>
            {MODELOS_POLITICA.join(", ")}
          </Typography>
        </AnimatedStat>

        <AnimatedStat delay={750} icon={<GavelIcon sx={{ fontSize: 28, mt: 0.25, opacity: 0.9 }} />}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            <AnimatedCounter target={LGPD_FERRAMENTAS.length} duration={600} delay={1000} /> Ferramentas LGPD
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95, fontSize: "0.85rem" }}>
            {LGPD_FERRAMENTAS.join(", ")}
          </Typography>
        </AnimatedStat>
      </Box>
    </Box>
  );
}
