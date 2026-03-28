import controlesJson from './controles.json';

interface ControleJson {
  id: number;
  nome: string;
  texto: string;
  por_que_implementar: string;
  procedimentos_e_ferramentas: string;
  fique_atento: string | null;
  aplicabilidade_privacidade: string;
}

export const getControleJsonData = (controleId: number): ControleJson | undefined => {
  return controlesJson.controles.find((controle) => controle.id === controleId) as ControleJson | undefined;
};

export const mergeControleData = (dbControle: any): any => {
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