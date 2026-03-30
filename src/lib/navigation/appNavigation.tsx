import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GroupIcon from "@mui/icons-material/Group";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GavelIcon from "@mui/icons-material/Gavel";
import PublicIcon from "@mui/icons-material/Public";
import PolicyIcon from "@mui/icons-material/Policy";
import PeopleIcon from "@mui/icons-material/People";
import MapIcon from "@mui/icons-material/Map";
import StorageIcon from "@mui/icons-material/Storage";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningIcon from "@mui/icons-material/Warning";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export type AppNavItem = {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  /** Legado: use isSubItem */
  indent?: 0 | 1;
  /** Subitem (indentação, linha guia, seta) — alinhado aos hubs no card da página do programa */
  isSubItem?: boolean;
  /** Item “pai” com subitens logo abaixo (mostra indicador ▼) */
  hasNestedNav?: boolean;
  /** Agrupa subitens recolhíveis (hub + filhos com mesmo id) */
  collapseGroup?: "tratamento" | "diagnostico" | "portal";
};

export type AppNavBlock =
  | { kind: "single"; item: AppNavItem }
  | { kind: "collapsible"; groupId: string; hub: AppNavItem; subs: AppNavItem[] };

/** Transforma a lista plana em blocos (hub + subitens) para o menu recolhível. */
export function parseProgramaNavItems(items: AppNavItem[]): AppNavBlock[] {
  const blocks: AppNavBlock[] = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    if (item.hasNestedNav && item.collapseGroup) {
      const gid = item.collapseGroup;
      const subs: AppNavItem[] = [];
      i++;
      while (i < items.length && items[i].collapseGroup === gid && items[i].isSubItem) {
        subs.push(items[i]);
        i++;
      }
      blocks.push({ kind: "collapsible", groupId: gid, hub: item, subs });
      continue;
    }
    if (item.isSubItem) {
      i++;
      continue;
    }
    blocks.push({ kind: "single", item });
    i++;
  }
  return blocks;
}

export type AppNavSection = {
  id: string;
  title: string;
  items: AppNavItem[];
};

const iconSx = { fontSize: 22 };

export function getGlobalNavSections(): AppNavSection[] {
  return [
    {
      id: "geral",
      title: "Geral",
      items: [
        { id: "inicio", label: "Início", path: "/dashboard", icon: <HomeIcon sx={iconSx} /> },
        {
          id: "lgpd",
          label: "LGPD",
          path: "/referencias/lgpd",
          icon: <MenuBookIcon sx={iconSx} />,
        },
        { id: "perfil", label: "Perfil", path: "/perfil", icon: <PersonIcon sx={iconSx} /> },
      ],
    },
  ];
}

/**
 * Navegação dentro do programa — mesma ordem dos cards em `programas/[id]/page.tsx` (`sections`).
 * Visão geral = página inicial do programa (não é card, mas âncora lógica).
 */
export function getProgramaNavSections(programaId: string): AppNavSection[] {
  const base = `/programas/${programaId}`;
  const subIcon = { fontSize: 20 as const };

  return [
    {
      id: "programa",
      title: "Programa",
      items: [
        { id: "visao", label: "Visão geral", path: base, icon: <DashboardIcon sx={iconSx} /> },

        {
          id: "responsaveis",
          label: "Estrutura de Governança",
          path: `${base}/responsabilidades`,
          icon: <GroupIcon sx={iconSx} />,
        },

        {
          id: "conf-hub",
          label: "Tratamento de dados e riscos",
          path: `${base}/conformidade`,
          icon: <GavelIcon sx={iconSx} />,
          hasNestedNav: true,
          collapseGroup: "tratamento",
        },
        {
          id: "conf-map",
          label: "Mapeamento de dados",
          path: `${base}/conformidade/mapeamento`,
          icon: <MapIcon sx={subIcon} />,
          isSubItem: true,
          collapseGroup: "tratamento",
        },
        {
          id: "conf-ropa",
          label: "ROPA",
          path: `${base}/conformidade/ropa`,
          icon: <StorageIcon sx={subIcon} />,
          isSubItem: true,
          collapseGroup: "tratamento",
        },
        {
          id: "conf-ripd",
          label: "RIPD / AIPD",
          path: `${base}/conformidade/ripd`,
          icon: <DescriptionIcon sx={subIcon} />,
          isSubItem: true,
          collapseGroup: "tratamento",
        },
        {
          id: "conf-inc",
          label: "Incidentes",
          path: `${base}/conformidade/incidentes`,
          icon: <WarningIcon sx={subIcon} />,
          isSubItem: true,
          collapseGroup: "tratamento",
        },

        {
          id: "diag",
          label: "Diagnóstico",
          path: `${base}/diagnostico`,
          icon: <CheckCircleOutlineIcon sx={iconSx} />,
          hasNestedNav: true,
          collapseGroup: "diagnostico",
        },
        {
          id: "diag-relatorio",
          label: "Relatório do diagnóstico",
          path: `${base}/diagnostico/relatorio`,
          icon: <AssessmentIcon sx={subIcon} />,
          isSubItem: true,
          collapseGroup: "diagnostico",
        },

        {
          id: "plano",
          label: "Plano de trabalho",
          path: `${base}/planos-acao`,
          icon: <AssignmentIcon sx={iconSx} />,
        },
        {
          id: "politicas",
          label: "Políticas e documentos",
          path: `${base}/politicas`,
          icon: <PolicyIcon sx={iconSx} />,
        },

        {
          id: "portal-hub",
          label: "Portal de privacidade",
          path: `${base}/conformidade/portal`,
          icon: <PublicIcon sx={iconSx} />,
          hasNestedNav: true,
          collapseGroup: "portal",
        },
        {
          id: "portal-pedidos",
          label: "Pedidos dos titulares",
          path: `${base}/conformidade/pedidos-titulares`,
          icon: <AssignmentTurnedInIcon sx={subIcon} />,
          isSubItem: true,
          collapseGroup: "portal",
        },
        {
          id: "portal-reportes",
          label: "Reportes do portal",
          path: `${base}/conformidade/reportes`,
          icon: <ReportProblemIcon sx={subIcon} />,
          isSubItem: true,
          collapseGroup: "portal",
        },
        {
          id: "portal-contato",
          label: "Contato do portal",
          path: `${base}/conformidade/contato`,
          icon: <ContactMailIcon sx={subIcon} />,
          isSubItem: true,
          collapseGroup: "portal",
        },

        {
          id: "usuarios",
          label: "Usuários e permissões",
          path: `${base}/usuarios`,
          icon: <PeopleIcon sx={iconSx} />,
        },
        {
          id: "auditoria",
          label: "Histórico de atividades",
          path: `${base}/auditoria`,
          icon: <SecurityIcon sx={iconSx} />,
        },
      ],
    },
  ];
}

/** Título curto para a barra superior (espelha a lógica anterior do Header). */
export function getAppShellPageTitle(pathname: string): string {
  if (pathname.startsWith("/admin")) return "Administração";
  if (pathname.includes("/diagnostico/relatorio")) return "Relatório do diagnóstico";
  if (pathname.includes("/diagnostico")) return "Diagnóstico";
  if (pathname.includes("/planos-acao")) return "Plano de trabalho";
  if (pathname.includes("/conformidade/mapeamento")) return "Mapeamento de dados";
  if (pathname.includes("/conformidade/ropa")) return "ROPA";
  if (pathname.includes("/conformidade/pedidos-titulares")) return "Pedidos dos titulares";
  if (pathname.includes("/conformidade/ripd")) return "RIPD / AIPD";
  if (pathname.includes("/conformidade/incidentes")) return "Incidentes";
  if (pathname.includes("/conformidade/reportes")) return "Reportes do portal";
  if (pathname.includes("/conformidade/contato")) return "Contato do portal";
  if (pathname.includes("/conformidade/portal")) return "Portal de privacidade";
  if (pathname.includes("/conformidade")) return "Tratamento e riscos";
  if (pathname.includes("/politicas")) return "Políticas e documentos";
  if (pathname.includes("/responsabilidades")) return "Estrutura de Governança";
  if (pathname.includes("/usuarios")) return "Usuários";
  if (pathname.includes("/auditoria")) return "Auditoria";
  if (pathname === "/dashboard") return "Início";
  if (pathname.startsWith("/referencias/lgpd")) return "LGPD";
  if (pathname.startsWith("/perfil")) return "Perfil";
  if (pathname.match(/^\/programas\/[^/]+\/?$/)) return "Programa";
  return "FPSI";
}

/** Evita marcar pai e filho ao mesmo tempo: escolhe o path mais específico que casa com a URL. */
export function getBestMatchingNavPath(pathname: string, paths: string[]): string | null {
  const hits = paths.filter((p) => pathname === p || pathname.startsWith(p + "/"));
  if (hits.length === 0) return null;
  return hits.reduce((a, b) => (a.length >= b.length ? a : b));
}

/** `programaBase` = `/programas/{id|slug}` — expandir grupo Tratamento nestas rotas. */
export function isNavGroupTratamentoPath(pathname: string, programaBase: string): boolean {
  const hub = `${programaBase}/conformidade`;
  const portalHub = `${programaBase}/conformidade/portal`;
  if (pathname === portalHub || pathname.startsWith(portalHub + "/")) return false;
  if (pathname.includes("/conformidade/pedidos-titulares")) return false;
  if (pathname.includes("/conformidade/reportes")) return false;
  if (pathname.includes("/conformidade/contato")) return false;
  return pathname === hub || pathname === `${hub}/` || pathname.startsWith(hub + "/");
}

export function isNavGroupDiagnosticoPath(pathname: string, programaBase: string): boolean {
  return pathname.startsWith(`${programaBase}/diagnostico`);
}

export function isNavGroupPortalPath(pathname: string, programaBase: string): boolean {
  const hub = `${programaBase}/conformidade/portal`;
  if (pathname === hub || pathname.startsWith(hub + "/")) return true;
  if (pathname.includes("/conformidade/pedidos-titulares")) return true;
  if (pathname.includes("/conformidade/reportes")) return true;
  if (pathname.includes("/conformidade/contato")) return true;
  return false;
}
