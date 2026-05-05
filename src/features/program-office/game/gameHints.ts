/**
 * Dicas educativas curtas (PPSI 2.0 / governança) — rotacionam por programa.
 */
export const GAME_EDUCATIONAL_HINTS: string[] = [
  "No PPSI 2.0, a alta administração deve integrar privacidade e segurança da informação ao sistema de gestão de riscos e controles internos.",
  "O encarregado (DPO) articula titulares, ANPD e áreas — não é o único responsável pelo tratamento, mas o ponto focal da governança de dados.",
  "ROPA, RIPD e registo de incidentes demonstram transparência e gestão de risco no ciclo de vida dos dados pessoais.",
  "Comités de SI e de proteção de dados existem para decisões colegiadas; a ETIR foca prevenção e resposta a incidentes cibernéticos.",
  "Os níveis de maturidade do diagnóstico orientam priorização: não é implementar tudo de uma vez, e sim o que faz sentido ao risco e ao contexto.",
  "Políticas implementadas no catálogo devem refletir a realidade do órgão — documentos vazios geram desconfiança e fragilidade.",
];

export function pickEducationalHint(programaId: number): string {
  const i = Math.abs(programaId | 0) % GAME_EDUCATIONAL_HINTS.length;
  return GAME_EDUCATIONAL_HINTS[i];
}
