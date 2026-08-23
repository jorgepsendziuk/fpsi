import { landing } from "@/components/landing/landingTokens";

export type AuditorSecaoId =
  | "evidencias"
  | "politicas"
  | "ropa"
  | "ripds"
  | "riscos"
  | "incidentes"
  | "decisoes"
  | "timeline"
  | "planos"
  | "ciencias";

export const AUDITOR_SECOES: Array<{
  id: AuditorSecaoId;
  titulo: string;
  norma: string;
  paraQueServe: string;
  cor: string;
}> = [
  {
    id: "evidencias",
    titulo: "Evidências",
    norma: "ISO 27001 9.2 · PPSI anexos de medida",
    paraQueServe:
      "Provas de que um controle ou medida foi implementado. O arquivo sozinho não basta: cada evidência deve indicar a medida PPSI, o controle e, quando houver, o artigo ou norma de referência.",
    cor: landing.blue,
  },
  {
    id: "politicas",
    titulo: "Políticas publicadas",
    norma: "PPSI medidas 0.9–0.12",
    paraQueServe:
      "Documentos institucionais vigentes (PGP, PGSI, POSIN, políticas operacionais). Publicados = aprovados e em vigor — não rascunho.",
    cor: "#00897B",
  },
  {
    id: "ropa",
    titulo: "ROPA / mapeamento",
    norma: "LGPD art. 37",
    paraQueServe:
      "Registro das operações de tratamento: o que a organização faz com dados pessoais, para que finalidade e sob qual base legal.",
    cor: landing.blueBright,
  },
  {
    id: "ripds",
    titulo: "RIPD",
    norma: "LGPD art. 38",
    paraQueServe:
      "Relatórios de impacto à proteção de dados — obrigatórios quando o tratamento pode gerar alto risco aos titulares.",
    cor: "#6A1B9A",
  },
  {
    id: "riscos",
    titulo: "Riscos críticos",
    norma: "ISO 27001 9.3",
    paraQueServe:
      "Riscos residuais altos (score ≥ 12) ainda abertos. São os temas que a direção deve acompanhar na análise crítica.",
    cor: "#C62828",
  },
  {
    id: "incidentes",
    titulo: "Incidentes abertos",
    norma: "ANPD / ISO 27001",
    paraQueServe:
      "Incidentes de segurança ou privacidade em tratamento, inclusive comunicações à ANPD ou a titulares.",
    cor: "#EF6C00",
  },
  {
    id: "decisoes",
    titulo: "Decisões",
    norma: "Accountability · ISO 27001 9.3",
    paraQueServe:
      "Decision log: evidência de que a alta administração decidiu (contexto, alternativas, justificativa). Não é o log de quem clicou no sistema.",
    cor: landing.navy,
  },
  {
    id: "timeline",
    titulo: "Linha do tempo",
    norma: "ISO 27001 7.5 · LGPD art. 37",
    paraQueServe:
      "Eventos de governança em ordem cronológica: decisões, workflow e ciência em documentos.",
    cor: "#455A64",
  },
  {
    id: "planos",
    titulo: "Planos de ação",
    norma: "PPSI plano de trabalho",
    paraQueServe:
      "Ações do plano de trabalho ainda não canceladas — o que a organização se comprometeu a fazer e até quando.",
    cor: "#1565C0",
  },
  {
    id: "ciencias",
    titulo: "Ciência em documentos",
    norma: "Demonstração de conformidade",
    paraQueServe:
      "Registros de que pessoas do programa leram e deram ciência a políticas ou documentos versionados.",
    cor: landing.shield,
  },
];
