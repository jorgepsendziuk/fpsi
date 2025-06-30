import controlesJson from './controles.json';

interface ControleJson {
  id: number;
  nome: string;
  texto: string;
  por_que_implementar: string;
  fique_atento: string | null;
  aplicabilidade_privacidade: string;
}

export const getControleJsonData = (controleId: number): ControleJson | undefined => {
  return controlesJson.controles.find((controle): controle is ControleJson => controle.id === controleId);
};

export const mergeControleData = (dbControle: any): any => {
  const jsonData = getControleJsonData(dbControle.id);
  if (!jsonData) return dbControle;

  return {
    ...dbControle,
    texto: jsonData.texto,
    por_que_implementar: jsonData.por_que_implementar,
    fique_atento: jsonData.fique_atento,
    aplicabilidade_privacidade: jsonData.aplicabilidade_privacidade
  };
}; 