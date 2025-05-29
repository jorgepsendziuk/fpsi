import { Responsavel, Medida, Controle } from '../types';

export const transformResponsavel = (data: any): Responsavel => {
  return {
    id: data.id || 0,
    programa: data.programa || 0,
    departamento: data.departamento || '',
    email: data.email || '',
    nome: data.nome || '',
  };
};

export const transformMedida = (data: any): Medida => {
  return {
    id: data.id || 0,
    id_medida: data.id_medida || '',
    id_controle: data.id_controle || 0,
    id_cisv8: data.id_cisv8 || '',
    status_medida: data.status_medida || 0,
    grupo_imple: data.grupo_imple || '',
    funcao_nist_csf: data.funcao_nist_csf || '',
    medida: data.medida || '',
    descricao: data.descricao || '',
    resposta: data.resposta,
    justificativa: data.justificativa,
    encaminhamento_interno: data.encaminhamento_interno,
    observacao_orgao: data.observacao_orgao,
    nova_resposta: data.nova_resposta,
    responsavel: data.responsavel,
    previsao_inicio: data.previsao_inicio,
    previsao_fim: data.previsao_fim,
    status_plano_acao: data.status_plano_acao,
  };
};

export const transformControle = (data: any): Controle => {
  return {
    id: data.id || 0,
    diagnostico: data.diagnostico || 0,
    numero: data.numero || 0,
    nome: data.nome || '',
    texto: data.texto,
    por_que_implementar: data.por_que_implementar,
    fique_atento: data.fique_atento,
    aplicabilidade_privacidade: data.aplicabilidade_privacidade,
    programa_controle_id: data.programa_controle_id,
    programa: data.programa,
    nivel: data.nivel,
  };
};

export const transformResponsavelForAPI = (responsavel: Responsavel) => {
  return {
    id: responsavel.id,
    programa: responsavel.programa,
    departamento: responsavel.departamento,
    email: responsavel.email,
    nome: responsavel.nome,
  };
};

export const transformMedidaForAPI = (medida: Medida) => {
  return {
    id: medida.id,
    id_medida: medida.id_medida,
    id_controle: medida.id_controle,
    resposta: medida.resposta,
    justificativa: medida.justificativa,
    encaminhamento_interno: medida.encaminhamento_interno,
    observacao_orgao: medida.observacao_orgao,
    nova_resposta: medida.nova_resposta,
    responsavel: medida.responsavel,
    previsao_inicio: medida.previsao_inicio,
    previsao_fim: medida.previsao_fim,
    status_plano_acao: medida.status_plano_acao,
  };
};

export const transformControleForAPI = (controle: Controle) => {
  return {
    id: controle.id,
    diagnostico: controle.diagnostico,
    numero: controle.numero,
    nome: controle.nome,
    texto: controle.texto,
    programa: controle.programa,
    nivel: controle.nivel,
  };
}; 