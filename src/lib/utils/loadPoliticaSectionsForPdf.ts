import {
  fetchPoliticaProgramaByTipo,
  fetchPoliticaModeloSecoes,
  type PoliticaSecao,
} from "@/lib/services/dataService";
import { applyPoliticaPlaceholdersToSections } from "@/lib/utils/politicaPlaceholders";

function mapRaw(raw: unknown[]): PoliticaSecao[] {
  return raw.map((section) => {
    const s = section as Record<string, unknown>;
    return {
      id: Number(s.id),
      secao: String(s.secao ?? ""),
      titulo: String(s.titulo ?? ""),
      descricao: String(s.descricao ?? ""),
      texto: s.texto != null ? String(s.texto) : "",
    };
  });
}

function generateGenericSections(nomePolitica: string): PoliticaSecao[] {
  return [
    {
      id: 0,
      secao: nomePolitica,
      titulo: "Introdução",
      descricao:
        "IMPORTANTE: Este modelo deve ser utilizado exclusivamente como referência, devendo o órgão ou entidade considerar as particularidades técnicas específicas do seu ambiente.",
      texto: "",
    },
    {
      id: 1,
      secao: "Propósito",
      titulo: "Objetivo da Política",
      descricao: "Descreva os objetivos básicos da política e o que ela pretende alcançar.",
      texto: `<p>Esta ${nomePolitica} tem por objetivo estabelecer diretrizes, princípios e procedimentos a serem seguidos por todas as pessoas que se relacionam com [Órgão ou Entidade].</p>`,
    },
    {
      id: 2,
      secao: "Escopo",
      titulo: "Amplitude e alcance da Política",
      descricao: "Defina a quem e a quais sistemas esta política se aplica.",
      texto:
        '<p>Esta política aplica-se a todos os colaboradores, prestadores de serviços e parceiros do <span style="background-color: yellow;">[Órgão ou entidade]</span>.</p>',
    },
    {
      id: 3,
      secao: "Termos e definições",
      titulo: "Glossário",
      descricao: "Defina quaisquer termos-chave, siglas ou conceitos que serão utilizados na política.",
      texto: "<p>Insira aqui as definições de termos técnicos e conceitos utilizados nesta política.</p>",
    },
    {
      id: 4,
      secao: "Declarações da política",
      titulo: "Regras aplicáveis",
      descricao: "Descreva as regras que compõem a política.",
      texto:
        '<p>Art. 1º. Fica instituída a presente política no âmbito do <span style="background-color: yellow;">[Órgão ou entidade]</span>.</p>',
    },
    {
      id: 5,
      secao: "Disposições Finais",
      titulo: "Disposições Finais",
      descricao: "Diretrizes finais para revisão e melhoria contínua da política.",
      texto: "<p>Esta política será revisada periodicamente e entra em vigor na data de sua publicação.</p>",
    },
  ];
}

/**
 * Mesma ordem do editor: salvo no programa → modelo Supabase → JSON público → genérico.
 * Aplica placeholders com os dados do programa.
 */
export async function loadPoliticaSectionsForPdf(
  programaId: number,
  politicaId: string,
  nomePolitica: string,
  programa: Record<string, unknown> | null
): Promise<PoliticaSecao[]> {
  const saved = await fetchPoliticaProgramaByTipo(programaId, politicaId);
  const raw = saved?.secoes;
  if (Array.isArray(raw) && raw.length > 0) {
    return applyPoliticaPlaceholdersToSections(mapRaw(raw), programa);
  }

  const fromDb = await fetchPoliticaModeloSecoes(politicaId);
  if (fromDb && fromDb.length > 0) {
    return applyPoliticaPlaceholdersToSections(fromDb, programa);
  }

  const response = await fetch(`/models/${politicaId}.json`);
  if (response.ok) {
    const modelo = await response.json();
    return applyPoliticaPlaceholdersToSections(mapRaw(modelo.secoes || []), programa);
  }

  return applyPoliticaPlaceholdersToSections(generateGenericSections(nomePolitica), programa);
}
