import { supabaseBrowserClient } from "@utils/supabase/client";
import { mergeControleData } from "./controlesData";

export const fetchProgramas = async () => {
  const { data } = await supabaseBrowserClient
    .from("programa")
    .select("*")
    .order("id", { ascending: true });
  return data || [];
};

export const fetchDiagnosticos = async () => {
  const { data } = await supabaseBrowserClient
    .from("diagnostico")
    .select("*") 
    .order("id", { ascending: true });
  return data || [];
};

export const fetchOrgaos = async () => {
  const { data } = await supabaseBrowserClient
    .from("orgao")
    .select("*")
    .order("nome", { ascending: true });
  return data || [];
};

export const fetchResponsaveis = async (programaId: number) => {
  const { data } = await supabaseBrowserClient
    .from("responsavel")
    .select("*")
    .eq("programa", programaId)
    .order("nome", { ascending: true });
  return data || [];
};

export const fetchControles = async (diagnosticoId: number, programaId: number): Promise<any[]> => {
  const { data } = await supabaseBrowserClient
    .from("controle")
    .select(`
      *,
      programa_controle!inner(
        id,
        nivel
      )
    `)
    .eq("diagnostico", diagnosticoId)
    .eq("programa_controle.programa", programaId)
    .order("id", { ascending: true });
  
  // Flatten the data structure to maintain compatibility
  const flattenedData = data?.map(controle => ({
    ...controle,
    programa_controle_id: controle.programa_controle[0]?.id,
    programa: programaId,
    nivel: controle.programa_controle[0]?.nivel,
    programa_controle: undefined // Remove the nested object
  })) || [];

  return flattenedData.map(controle => mergeControleData(controle));
};

export const fetchMedidas = async (controleId: number, programaId: number): Promise<any[]> => {
  // First fetch the static measure data
  const { data: medidasData } = await supabaseBrowserClient
    .from("medida")
    .select("*")
    .eq("id_controle", controleId)
    .order("id_medida", { ascending: true });

  // Then fetch the program-specific responses
  const { data: programaMedidasData } = await supabaseBrowserClient
    .from("programa_medida")
    .select("*")
    .eq("programa", programaId)
    .in("medida", medidasData?.map(m => m.id) || []);

  // Merge the data
  return medidasData?.map(medida => {
    const programaMedida = programaMedidasData?.find(pm => pm.medida === medida.id);
    return {
      ...medida,
      resposta: programaMedida?.resposta,
      justificativa: programaMedida?.justificativa,
      observacao_orgao: programaMedida?.observacao_orgao,
      responsavel: programaMedida?.responsavel,
      previsao_inicio: programaMedida?.previsao_inicio,
      previsao_fim: programaMedida?.previsao_fim,
      nova_resposta: programaMedida?.nova_resposta,
      encaminhamento_interno: programaMedida?.encaminhamento_interno,
      status_medida: programaMedida?.status_medida,
      status_plano_acao: programaMedida?.status_plano_acao
    };
  }) || [];
};

export const updateControleNivel = async (programaControleId: number, newValue: number) => {
  return await supabaseBrowserClient
    .from("programa_controle")
    .update({ nivel: newValue })
    .eq("id", programaControleId);
};

export const updateMedida = async (medidaId: number, programaId: number, field: string, value: any) => {
  // Check if a record exists in programa_medida
  const { data: existingRecord } = await supabaseBrowserClient
    .from("programa_medida")
    .select("id")
    .eq("medida", medidaId)
    .eq("programa", programaId)
    .single();

  const updatePayload = { [field]: value };

  if (existingRecord) {
    // Update existing record
    return await supabaseBrowserClient
      .from("programa_medida")
      .update(updatePayload)
      .eq("id", existingRecord.id);
  } else {
    // Create new record
    return await supabaseBrowserClient
      .from("programa_medida")
      .insert({
        medida: medidaId,
        programa: programaId,
        ...updatePayload
      });
  }
};

export const updateProgramaSetor = async (programaId: number, setor: number) => {
  return await supabaseBrowserClient
    .from("programa")
    .update({ setor })
    .eq("id", programaId);
};

export const updateProgramaOrgao = async (programaId: number, orgao: number) => {
  return await supabaseBrowserClient
    .from("programa")
    .update({ orgao })
    .eq("id", programaId);
};

export const createPrograma = async () => {
  return await supabaseBrowserClient
    .from("programa")
    .insert({})
    .select()
    .single();
};

export const deletePrograma = async (programaId: number) => {
  return await supabaseBrowserClient
    .from("programa")
    .delete()
    .eq("id", programaId);
};

export const updateProgramaDetails = async (programaId: number, details: any) => {
  return await supabaseBrowserClient
    .from("programa")
    .update(details)
    .eq("id", programaId);
};

export const fetchProgramaById = async (programaId: number) => {
  const { data } = await supabaseBrowserClient
    .from("programa")
    .select("*")
    .eq("id", programaId)
    .single();
  return data;
};

export const createProgramaControlesForProgram = async (programaId: number) => {
  // Get all existing controles
  const { data: controles } = await supabaseBrowserClient
    .from("controle")
    .select("id");

  if (!controles || controles.length === 0) return { data: null, error: null };

  // Create programa_controle records for all controles
  const programaControles = controles.map(controle => ({
    programa: programaId,
    controle: controle.id
  }));

  return await supabaseBrowserClient
    .from("programa_controle")
    .insert(programaControles);
};
