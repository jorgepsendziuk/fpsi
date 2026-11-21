import type { SvgIconComponent } from "@mui/icons-material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import TableViewOutlinedIcon from "@mui/icons-material/TableViewOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

export type PanoramaQuesitoResposta = "sim_nao" | "sim_nao_obs";

export type PanoramaProgramaPrivacidadeQuesito = {
  id: string;
  grupo: string;
  Icon: SvgIconComponent;
  pergunta: string;
  mapeamento: string;
  resposta: PanoramaQuesitoResposta;
  obsRotulo?: string;
};

/** Quesitos alinhados à LGPD, guia do encarregado (ANPD) e etapa inicial de governança em privacidade. */
export const PANORAMA_PROGRAMA_PRIVACIDADE_QUESITOS: PanoramaProgramaPrivacidadeQuesito[] = [
  {
    id: "encarregado-ato",
    grupo: "Governança e encarregado",
    Icon: AssignmentIndOutlinedIcon,
    pergunta: "Há encarregado formalmente designado, com ato escrito e canal público para titulares?",
    mapeamento: "É isso que vocês têm hoje — ou ainda falta nomear/publicar?",
    resposta: "sim_nao_obs",
    obsRotulo: "Nome / canal, se houver",
  },
  {
    id: "encarregado-substituto",
    grupo: "Governança e encarregado",
    Icon: VerifiedUserOutlinedIcon,
    pergunta: "Existe substituto do encarregado para ausências, sem travar pedidos do art. 18?",
    mapeamento: "Vocês já previram substituição conforme a Res. ANPD 18/2024?",
    resposta: "sim_nao",
  },
  {
    id: "governanca",
    grupo: "Governança e encarregado",
    Icon: AccountBalanceOutlinedIcon,
    pergunta: "A alta direção reconhece um programa de privacidade (papéis, revisão e orçamento mínimo)?",
    mapeamento: "O comprometimento institucional está formalizado — é o que mapeamos?",
    resposta: "sim_nao_obs",
    obsRotulo: "Comitê / responsável",
  },
  {
    id: "mapeamento",
    grupo: "Registro das operações",
    Icon: HubOutlinedIcon,
    pergunta: "Os fluxos de dados pessoais mais relevantes estão mapeados (coleta, uso, compartilhamento, descarte)?",
    mapeamento: "O inventário reflete a operação real do partido/organização?",
    resposta: "sim_nao_obs",
    obsRotulo: "Lacunas conhecidas",
  },
  {
    id: "ropa",
    grupo: "Registro das operações",
    Icon: TableViewOutlinedIcon,
    pergunta: "O ROPA (art. 37) cobre as operações principais com finalidade, titulares, bases e retenção?",
    mapeamento: "O registro está completo o suficiente para auditoria — vocês têm isso?",
    resposta: "sim_nao",
  },
  {
    id: "bases-legais",
    grupo: "Registro das operações",
    Icon: GavelOutlinedIcon,
    pergunta: "Cada operação relevante tem base legal documentada (arts. 7º e 11, quando couber)?",
    mapeamento: "As bases no cadastro batem com o que o jurídico/direção confirmam?",
    resposta: "sim_nao_obs",
    obsRotulo: "Operações em dúvida",
  },
  {
    id: "direitos-titular",
    grupo: "Transparência e titulares",
    Icon: ContactMailOutlinedIcon,
    pergunta: "Há canal operacional para pedidos do art. 18 (acesso, correção, eliminação etc.) com prazo definido?",
    mapeamento: "Titulares conseguem exercer direitos — é o que este panorama indica?",
    resposta: "sim_nao_obs",
    obsRotulo: "Canal principal",
  },
  {
    id: "politicas",
    grupo: "Transparência e titulares",
    Icon: PolicyOutlinedIcon,
    pergunta: "Política de privacidade e avisos estão publicados e coerentes com o que é feito na prática?",
    mapeamento: "O que está no portal/site corresponde ao tratamento real?",
    resposta: "sim_nao",
  },
  {
    id: "operadores",
    grupo: "Transparência e titulares",
    Icon: HandshakeOutlinedIcon,
    pergunta: "Contratos com operadores/fornecedores trazem cláusulas de proteção e fluxo de dados?",
    mapeamento: "Terceiros críticos estão amarrados — vocês têm isso assinado?",
    resposta: "sim_nao_obs",
    obsRotulo: "Fornecedor crítico",
  },
  {
    id: "seguranca",
    grupo: "Risco e segurança",
    Icon: ShieldOutlinedIcon,
    pergunta: "Medidas de segurança (arts. 46 a 49) estão definidas, com responsáveis e revisão?",
    mapeamento: "Controles mínimos existem e são mantidos — confirma?",
    resposta: "sim_nao_obs",
    obsRotulo: "Principal controle",
  },
  {
    id: "ripd",
    grupo: "Risco e segurança",
    Icon: FactCheckOutlinedIcon,
    pergunta: "RIPD/AIPD foi feito (ou está previsto) para tratamentos de alto risco ou dados sensíveis relevantes?",
    mapeamento: "É isso que mapeamos sobre impacto e mitigação?",
    resposta: "sim_nao",
  },
  {
    id: "incidentes",
    grupo: "Risco e segurança",
    Icon: ReportProblemOutlinedIcon,
    pergunta: "Existe plano de resposta a incidentes (registro, encarregado, comunicação à ANPD/titulares quando couber)?",
    mapeamento: "Vocês sabem quem acionar em 24h — têm procedimento?",
    resposta: "sim_nao_obs",
    obsRotulo: "Responsável pelo plano",
  },
  {
    id: "programa-revisao",
    grupo: "Programa contínuo",
    Icon: DescriptionOutlinedIcon,
    pergunta: "Há calendário de revisão do programa (ROPA, políticas, riscos, treinamento) pelo menos anual?",
    mapeamento: "A governança em privacidade será monitorada — vocês têm cronograma?",
    resposta: "sim_nao",
  },
];

export const PANORAMA_QUESITOS_GRUPOS_ORDEM = [
  "Governança e encarregado",
  "Registro das operações",
  "Transparência e titulares",
  "Risco e segurança",
  "Programa contínuo",
] as const;