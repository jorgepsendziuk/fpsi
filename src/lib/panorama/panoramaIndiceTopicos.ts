import type { PanoramaSnapshot } from "@/lib/panorama/buildPanoramaSnapshot";
import { getPanoramaSectionMeta } from "@/lib/panorama/panoramaSectionMeta";

export type PanoramaTopicoIndice = {
  anchor: string;
  titulo: string;
};

function topicoFromAnchor(anchor: string): PanoramaTopicoIndice {
  const meta = getPanoramaSectionMeta(anchor);
  if (!meta) {
    return { anchor, titulo: anchor };
  }
  return {
    anchor: meta.anchor,
    titulo: meta.titulo,
  };
}

/** Tópicos do relatório para o índice da primeira página (âncoras = ids das seções). */
export function buildPanoramaTopicosIndice(snapshot: PanoramaSnapshot | null): PanoramaTopicoIndice[] {
  const topicos: PanoramaTopicoIndice[] = [topicoFromAnchor("panorama-fold-two")];

  if (!snapshot) return topicos;

  if (snapshot.indiceEntregas.length > 0) {
    topicos.push(topicoFromAnchor("panorama-sec-entregas"));
  }
  if (snapshot.sistemasInventario.length > 0) {
    topicos.push(topicoFromAnchor("panorama-sec-sistemas"));
  }
  if (snapshot.lacunas.length > 0 || snapshot.atencoes.length > 0) {
    topicos.push(topicoFromAnchor("panorama-sec-decisao"));
  }
  if (snapshot.riscos.length > 0) {
    topicos.push(topicoFromAnchor("panorama-sec-riscos"));
  }
  if (snapshot.exposicao.length > 0) {
    topicos.push(topicoFromAnchor("panorama-sec-exposicao"));
  }
  if (snapshot.planos.length > 0) {
    topicos.push(topicoFromAnchor("panorama-sec-planos"));
  }

  topicos.push(topicoFromAnchor("panorama-sec-checklist-inicio"));

  return topicos;
}