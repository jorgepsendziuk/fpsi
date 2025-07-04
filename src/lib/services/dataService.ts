import { supabaseBrowserClient } from "@utils/supabase/client";
import { mergeControleData } from "./controlesData";
import { demoDataService, shouldUseDemoData } from "./demoDataService";

// Wrapper function to check if we should use demo data
const withDemoCheck = (originalFunction: any, demoFunction: any) => {
  return async (...args: any[]) => {
    // Check if we should use demo data
    const programaId = args.find(arg => typeof arg === 'number' && arg === 999999);
    const shouldUseDemo = shouldUseDemoData(programaId);
    
    if (shouldUseDemo) {
      console.log('[DEMO MODE] Using demo data service');
      return await demoFunction(...args);
    }
    
    return await originalFunction(...args);
  };
};

// Original functions
const originalFetchProgramas = async () => {
  const { data } = await supabaseBrowserClient
    .from("programa")
    .select("*")
    .order("id", { ascending: true });
  return data || [];
};

const originalFetchProgramaById = async (programaId: number) => {
  const { data } = await supabaseBrowserClient
    .from("programa")
    .select("*")
    .eq("id", programaId)
    .single();
  return data;
};

const originalFetchDiagnosticos = async () => {
  const { data } = await supabaseBrowserClient
    .from("diagnostico")
    .select("*") 
    .order("id", { ascending: true });
  return data || [];
};

const originalFetchOrgaos = async () => {
  const { data } = await supabaseBrowserClient
    .from("orgao")
    .select("*")
    .order("nome", { ascending: true });
  return data || [];
};

const originalFetchResponsaveis = async (programaId: number, retries = 3): Promise<any[]> => {
  try {
    const { data, error } = await supabaseBrowserClient
      .from("responsavel")
      .select("id, nome, email, departamento, programa")
      .eq("programa", programaId)
      .order("nome", { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

const originalFetchControles = async (diagnosticoId: number, programaId: number): Promise<any[]> => {
  console.log(`fetchControles: Fetching controles for diagnostico ${diagnosticoId}, programa ${programaId}`);
  
  // First, ensure programa_controle records exist for this program
  await ensureProgramaControleRecords(programaId);
  
  const { data, error } = await supabaseBrowserClient
    .from("controle")
    .select(`
      *,
      programa_controle(
        id,
        nivel
      )
    `)
    .eq("diagnostico", diagnosticoId)
    .eq("programa_controle.programa", programaId)
    .order("id", { ascending: true });
  
  if (error) {
    console.error(`fetchControles error:`, error);
    throw error;
  }
  
  console.log(`fetchControles: Raw data from Supabase:`, data?.length || 0);
  
  if (!data || data.length === 0) {
    console.log(`fetchControles: No controles found for diagnostico ${diagnosticoId}, programa ${programaId}`);
    return [];
  }
  
  // Flatten the data structure to maintain compatibility
  const flattenedData = data?.map(controle => {
    console.log(`Processing controle ${controle.id}, programa_controle:`, controle.programa_controle);
    return {
      ...controle,
      programa_controle_id: controle.programa_controle?.[0]?.id || null,
      programa: programaId,
      nivel: controle.programa_controle?.[0]?.nivel || 1,
      programa_controle: undefined // Remove the nested object
    };
  }) || [];

  console.log(`fetchControles: Flattened data:`, flattenedData.length);
  
  const finalData = flattenedData.map(controle => mergeControleData(controle));
  console.log(`fetchControles: Final data after merge:`, finalData.length);
  
  return finalData;
};

const originalFetchMedidas = async (controleId: number, programaId: number): Promise<any[]> => {
  console.log(`fetchMedidas: Fetching medidas for controle ${controleId}, programa ${programaId}`);
  
  // First fetch the static measure data
  const { data: medidasData, error: medidasError } = await supabaseBrowserClient
    .from("medida")
    .select("*")
    .eq("id_controle", controleId)
    .order("id_medida", { ascending: true });

  if (medidasError) {
    console.error(`fetchMedidas: Error fetching medidas:`, medidasError);
    throw medidasError;
  }

  console.log(`fetchMedidas: Found ${medidasData?.length || 0} medidas for controle ${controleId}`);

  if (!medidasData || medidasData.length === 0) {
    console.log(`fetchMedidas: No medidas found for controle ${controleId}`);
    return [];
  }

  // Ensure programa_medida records exist for this program
  await ensureProgramaMedidaRecords(programaId);

  // Then fetch the program-specific responses
  const { data: programaMedidasData, error: programaMedidasError } = await supabaseBrowserClient
    .from("programa_medida")
    .select("*")
    .eq("programa", programaId)
    .in("medida", medidasData.map(m => m.id));

  if (programaMedidasError) {
    console.error(`fetchMedidas: Error fetching programa_medida:`, programaMedidasError);
    throw programaMedidasError;
  }

  console.log(`fetchMedidas: Found ${programaMedidasData?.length || 0} programa_medida records for programa ${programaId}`);

  // Merge the data
  const mergedData = medidasData?.map(medida => {
    const programaMedida = programaMedidasData?.find(pm => pm.medida === medida.id);
    console.log(`fetchMedidas: Merging medida ${medida.id}, found programa_medida:`, !!programaMedida);
    console.log(`fetchMedidas: ProgramaMedida data for medida ${medida.id}:`, programaMedida);
    
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
      status_plano_acao: programaMedida?.status_plano_acao,
      // Add the full programa_medida object for the container
      programa_medida: programaMedida
    };
  }) || [];

  console.log(`fetchMedidas: Returning ${mergedData.length} merged medidas`);
  console.log(`fetchMedidas: Merged data:`, mergedData);
  return mergedData;
};

const originalFetchProgramaMedida = async (medidaId: number, controleId: number, programaId: number) => {
  console.log(`fetchProgramaMedida: Fetching for medida ${medidaId}, controle ${controleId}, programa ${programaId}`);
  
  const { data, error } = await supabaseBrowserClient
    .from("programa_medida")
    .select("*")
    .eq("medida", medidaId)
    .eq("programa", programaId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error(`fetchProgramaMedida: Error fetching programa_medida:`, error);
    throw error;
  }

  console.log(`fetchProgramaMedida: Found programa_medida:`, !!data);
  return data;
};

const originalUpdateProgramaMedida = async (medidaId: number, controleId: number, programaId: number, updates: any) => {
  console.log(`updateProgramaMedida: Updating medida ${medidaId}, controle ${controleId}, programa ${programaId}`, updates);
  
  // Check if a record exists in programa_medida
  const { data: existingRecord } = await supabaseBrowserClient
    .from("programa_medida")
    .select("id")
    .eq("medida", medidaId)
    .eq("programa", programaId)
    .single();

  if (existingRecord) {
    // Update existing record
    const { data, error } = await supabaseBrowserClient
      .from("programa_medida")
      .update(updates)
      .eq("id", existingRecord.id)
      .select()
      .single();
    
    if (error) {
      console.error(`updateProgramaMedida: Error updating existing record:`, error);
      throw error;
    }
    
    console.log(`updateProgramaMedida: Updated existing record`);
    return data;
  } else {
    // Create new record
    const { data, error } = await supabaseBrowserClient
      .from("programa_medida")
      .insert({
        medida: medidaId,
        programa: programaId,
        ...updates
      })
      .select()
      .single();
    
    if (error) {
      console.error(`updateProgramaMedida: Error creating new record:`, error);
      throw error;
    }
    
    console.log(`updateProgramaMedida: Created new record`);
    return data;
  }
};

const originalUpdateControleNivel = async (programaControleId: number, newValue: number) => {
  return await supabaseBrowserClient
    .from("programa_controle")
    .update({ nivel: newValue })
    .eq("id", programaControleId);
};

// Export wrapped functions
export const fetchProgramas = withDemoCheck(originalFetchProgramas, demoDataService.fetchProgramas);
export const fetchProgramaById = withDemoCheck(originalFetchProgramaById, demoDataService.fetchProgramaById);
export const fetchDiagnosticos = withDemoCheck(originalFetchDiagnosticos, demoDataService.fetchDiagnosticos);
export const fetchOrgaos = withDemoCheck(originalFetchOrgaos, demoDataService.fetchOrgaos);
export const fetchResponsaveis = withDemoCheck(originalFetchResponsaveis, demoDataService.fetchResponsaveis);
export const fetchControles = withDemoCheck(originalFetchControles, demoDataService.fetchControles);
export const fetchMedidas = withDemoCheck(originalFetchMedidas, demoDataService.fetchMedidas);
export const fetchProgramaMedida = withDemoCheck(originalFetchProgramaMedida, demoDataService.fetchProgramaMedida);
export const updateProgramaMedida = withDemoCheck(originalUpdateProgramaMedida, demoDataService.updateProgramaMedida);
export const updateControleNivel = withDemoCheck(originalUpdateControleNivel, demoDataService.updateControleNivel);

// New function to ensure programa_medida records exist
export const ensureProgramaMedidaRecords = async (programaId: number) => {
  // Skip for demo mode
  if (shouldUseDemoData(programaId)) {
    return { data: null, error: null };
  }

  console.log(`ensureProgramaMedidaRecords: Checking programa ${programaId}`);
  
  // Get all medidas in the system
  const { data: allMedidas } = await supabaseBrowserClient
    .from("medida")
    .select("id");
    
  if (!allMedidas || allMedidas.length === 0) {
    console.log(`ensureProgramaMedidaRecords: No medidas found in system`);
    return { data: null, error: null };
  }
  
  // Check which programa_medida records already exist for this program
  const { data: existingRecords } = await supabaseBrowserClient
    .from("programa_medida")
    .select("medida")
    .eq("programa", programaId);
  
  const existingMedidaIds = new Set(existingRecords?.map(r => r.medida) || []);
  const missingMedidas = allMedidas.filter(m => !existingMedidaIds.has(m.id));
  
  console.log(`ensureProgramaMedidaRecords: Found ${existingRecords?.length || 0} existing records, ${missingMedidas.length} missing`);
  console.log(`existingRecords:`, existingRecords);
  if (missingMedidas.length === 0) {
    console.log(`ensureProgramaMedidaRecords: All programa_medida records already exist`);
    return { data: existingRecords, error: null };
  }
  
  console.log(`ensureProgramaMedidaRecords: Creating ${missingMedidas.length} missing programa_medida records`);
  
  // Create missing programa_medida records
  const recordsToCreate = missingMedidas.map(medida => ({
    programa: programaId,
    medida: medida.id,
    resposta: null, // Default empty response
    justificativa: null,
    observacao_orgao: null,
    responsavel: null,
    previsao_inicio: null,
    previsao_fim: null,
    nova_resposta: null,
    encaminhamento_interno: null,
    status_medida: null,
    status_plano_acao: null
  }));
  
  const { data, error } = await supabaseBrowserClient
    .from("programa_medida")
    .insert(recordsToCreate)
    .select();
  
  if (error) {
    console.error(`ensureProgramaMedidaRecords: Error creating records:`, error);
  } else {
    console.log(`ensureProgramaMedidaRecords: Successfully created ${data?.length || 0} records`);
  }
  
  return { data, error };
};

export const updateMedida = async (medidaId: number, programaId: number, field: string, value: any) => {
  // Check if demo mode
  if (shouldUseDemoData(programaId)) {
    return demoDataService.updateProgramaMedida(medidaId, { [field]: value });
  }

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
  if (shouldUseDemoData(programaId)) {
    return demoDataService.updatePrograma(programaId, { setor });
  }

  return await supabaseBrowserClient
    .from("programa")
    .update({ setor })
    .eq("id", programaId);
};

export const updateProgramaOrgao = async (programaId: number, orgao: number) => {
  if (shouldUseDemoData(programaId)) {
    return demoDataService.updatePrograma(programaId, { orgao });
  }

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

export const updateProgramaDetails = async (programaId: number, updates: { cnpj?: string; razao_social?: string }) => {
  if (shouldUseDemoData(programaId)) {
    return demoDataService.updatePrograma(programaId, updates);
  }

  const { data, error } = await supabaseBrowserClient
    .from("programa")
    .update(updates)
    .eq("id", programaId);
  return { data, error };
};

export const updateProgramaField = async (programaId: number, field: string, value: any) => {
  if (shouldUseDemoData(programaId)) {
    return demoDataService.updatePrograma(programaId, { [field]: value });
  }

  const { data, error } = await supabaseBrowserClient
    .from("programa")
    .update({ [field]: value })
    .eq("id", programaId);
  return { data, error };
};

export const createProgramaControlesForProgram = async (programaId: number) => {
  if (shouldUseDemoData(programaId)) {
    return { data: null, error: null };
  }

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

// New function to ensure programa_controle records exist
export const ensureProgramaControleRecords = async (programaId: number) => {
  // Skip for demo mode
  if (shouldUseDemoData(programaId)) {
    return { data: null, error: null };
  }

  console.log(`ensureProgramaControleRecords: Checking programa ${programaId}`);
  
  // Check if programa_controle records already exist for this program
  const { data: existingRecords } = await supabaseBrowserClient
    .from("programa_controle")
    .select("controle")
    .eq("programa", programaId);
  
  console.log(`ensureProgramaControleRecords: Found ${existingRecords?.length || 0} existing records for programa ${programaId}`);
  
  if (existingRecords && existingRecords.length > 0) {
    console.log(`ensureProgramaControleRecords: Records already exist, skipping creation`);
    return { data: existingRecords, error: null };
  }
  
  // Get all controles to create programa_controle records
  const { data: allControles } = await supabaseBrowserClient
    .from("controle")
    .select("id");
  
  if (!allControles || allControles.length === 0) {
    console.log(`ensureProgramaControleRecords: No controles found in system`);
    return { data: null, error: null };
  }
  
  console.log(`ensureProgramaControleRecords: Creating programa_controle records for ${allControles.length} controles`);
  
  // Create programa_controle records for all controles
  const programaControles = allControles.map(controle => ({
    programa: programaId,
    controle: controle.id,
    nivel: 1 // Default INCC level
  }));
  
  const { data, error } = await supabaseBrowserClient
    .from("programa_controle")
    .insert(programaControles)
    .select();
  
  if (error) {
    console.error(`ensureProgramaControleRecords: Error creating records:`, error);
  } else {
    console.log(`ensureProgramaControleRecords: Successfully created ${data?.length || 0} records`);
  }
  
  return { data, error };
};
