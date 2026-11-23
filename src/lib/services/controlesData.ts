import controlesJson from "./controles.json";
import frameworkCatalog from "../../../content-packs/framework/catalogo.json";

interface ControleJson {
  id: number;
  nome: string;
  texto: string;
  por_que_implementar: string;
  procedimentos_e_ferramentas: string;
  fique_atento: string | null;
  aplicabilidade_privacidade: string;
}

type FrameworkControleEntry = (typeof frameworkCatalog.controles)[number];

const frameworkByControleId = new Map<number, FrameworkControleEntry>();
for (const c of frameworkCatalog.controles) {
  const dbId = 1000 + c.ordem_no_guia;
  frameworkByControleId.set(dbId, c);
}

export const getControleJsonData = (controleId: number): ControleJson | undefined => {
  return controlesJson.controles.find((controle) => controle.id === controleId) as ControleJson | undefined;
};

function mergeFrameworkControleData(dbControle: { id: number } & Record<string, unknown>) {
  const fw = frameworkByControleId.get(dbControle.id);
  if (!fw) return dbControle;

  return {
    ...dbControle,
    texto: fw.visao_geral,
    por_que_implementar: fw.por_que_controle_critico,
    procedimentos_e_ferramentas: fw.procedimentos_e_ferramentas,
    fique_atento: null,
    aplicabilidade_privacidade: "",
  };
}

export const mergeControleData = (dbControle: any): any => {
  const packId = dbControle.pack_id as string | undefined;
  if (packId === "framework" || dbControle.id >= 1001) {
    return mergeFrameworkControleData(dbControle);
  }

  const jsonData = getControleJsonData(dbControle.id);
  if (!jsonData) return dbControle;

  return {
    ...dbControle,
    texto: jsonData.texto,
    por_que_implementar: jsonData.por_que_implementar,
    procedimentos_e_ferramentas: jsonData.procedimentos_e_ferramentas,
    fique_atento: jsonData.fique_atento,
    aplicabilidade_privacidade: jsonData.aplicabilidade_privacidade,
  };
};