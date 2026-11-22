import type { SvgIconComponent } from "@mui/icons-material";
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import TopicOutlinedIcon from "@mui/icons-material/TopicOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

export type PanoramaExecutiveHighlight = {
  id: string;
  texto: string;
  Icon: SvgIconComponent;
  color: string;
  softBg: string;
};

/** Cinco alertas do resumo executivo (diagnóstico inicial; validação interna pendente). */
export const PANORAMA_EXECUTIVE_HIGHLIGHTS: PanoramaExecutiveHighlight[] = [
  {
    id: "sensivel",
    texto: "Dado sensível de filiação sem salvaguarda documentada",
    Icon: FingerprintOutlinedIcon,
    color: "#c62828",
    softBg: "rgba(198, 40, 40, 0.08)",
  },
  {
    id: "transparencia",
    texto: "Transparência insuficiente perante o titular",
    Icon: VisibilityOffOutlinedIcon,
    color: "#e65100",
    softBg: "rgba(230, 81, 0, 0.08)",
  },
  {
    id: "finalidades",
    texto: "Finalidades de tratamento ainda não descritas em público",
    Icon: TopicOutlinedIcon,
    color: "#f57f17",
    softBg: "rgba(245, 127, 23, 0.1)",
  },
  {
    id: "base-legal",
    texto: "Base legal e enquadramento a validar com o controlador",
    Icon: GavelOutlinedIcon,
    color: "#1565c0",
    softBg: "rgba(21, 101, 192, 0.08)",
  },
  {
    id: "governanca",
    texto: "Governança e papéis do programa pendentes de consolidação",
    Icon: GroupsOutlinedIcon,
    color: "#4527a0",
    softBg: "rgba(69, 39, 160, 0.08)",
  },
];

export const PANORAMA_EXECUTIVE_DISCLAIMER =
  "Resumo com base no que está cadastrado neste programa e no que estava público na data da leitura.";