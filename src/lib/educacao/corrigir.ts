import { moduloPorId, ordemExibicao, type EduPergunta } from "./catalogo";
import { GABARITO } from "./gabarito";
import { aprovadoPelaNota, notaPercentual } from "./progresso";

export type ItemCorrecao = {
  id: string;
  enunciado: string;
  escolhida: string | null;
  correta: string;
  ok: boolean;
};

export type ResultadoQuiz = {
  moduloId: string;
  acertos: number;
  total: number;
  nota: number;
  aprovado: boolean;
  itens: ItemCorrecao[];
};

export function corrigirModulo(
  moduloId: string,
  respostas: number[],
  notaMinima: number
): ResultadoQuiz | null {
  const modulo = moduloPorId(moduloId);
  if (!modulo) return null;
  const itens = modulo.perguntas.map((p, i) => corrigirPergunta(p, respostas[i]));
  const acertos = itens.filter((item) => item.ok).length;
  const nota = notaPercentual(acertos, itens.length);
  return {
    moduloId,
    acertos,
    total: itens.length,
    nota,
    aprovado: aprovadoPelaNota(nota, notaMinima),
    itens,
  };
}

function corrigirPergunta(p: EduPergunta, resposta: number | undefined): ItemCorrecao {
  const corretaIdx = GABARITO[p.id];
  const ordem = ordemExibicao(p.id);
  const original = typeof resposta === "number" ? ordem[resposta] : undefined;
  const ok = corretaIdx !== undefined && original === corretaIdx;
  return {
    id: p.id,
    enunciado: p.enunciado,
    escolhida: original === undefined ? null : p.opcoes[original] ?? null,
    correta: corretaIdx === undefined ? "" : p.opcoes[corretaIdx],
    ok,
  };
}
