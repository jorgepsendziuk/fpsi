import { supabaseBrowserClient } from "@utils/supabase/client";
import { mergeControleData } from "./controlesData";
import { UserRole, getDefaultPermissions } from "@/lib/types/user";



export const fetchProgramas = async () => {
  const { data } = await supabaseBrowserClient
    .from("programa")
    .select("*")
    .order("id", { ascending: true });
  return data || [];
};

/** Lista apenas programas em que o usuário atual está em programa_users (status accepted). */
/** @param excluidos true = apenas programas na lixeira; false/undefined = apenas ativos */
export const fetchProgramasForCurrentUser = async (excluidos?: boolean): Promise<any[]> => {
  const url = excluidos ? "/api/programas?excluidos=1" : "/api/programas";
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Erro ao carregar programas");
  }
  return res.json();
};

export const fetchProgramaById = async (programaId: number) => {
  const { data } = await supabaseBrowserClient
    .from("programa")
    .select("*")
    .eq("id", programaId)
    .single();
  return data;
};

export const fetchProgramaBySlug = async (slug: string) => {
  const { data } = await supabaseBrowserClient
    .from("programa")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
};

/** Retorna um slug disponível para novo programa (base ou base-2, base-3, …). Não usa id. */
export const getNextAvailableSlug = async (slugBase: string): Promise<string> => {
  const base = (slugBase || "programa").replace(/^-+|-+$/g, "") || "programa";
  const { data: rows } = await supabaseBrowserClient
    .from("programa")
    .select("slug")
    .ilike("slug", base + "%");
  const used = new Set(
    (rows || [])
      .filter((r: { slug: string | null }) => r.slug === base || (r.slug && r.slug.startsWith(base + "-")))
      .map((r: { slug: string }) => r.slug)
  );
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
};

/** Resolve parâmetro de URL (id numérico ou slug) para o programa. */
export const fetchProgramaByIdOrSlug = async (idOrSlug: string) => {
  const trimmed = String(idOrSlug).trim();
  if (/^\d+$/.test(trimmed)) {
    return fetchProgramaById(Number(trimmed));
  }
  return fetchProgramaBySlug(trimmed);
};

export const fetchDiagnosticos = async () => {
  const { data } = await supabaseBrowserClient
    .from("diagnostico")
    .select("*") 
    .order("id", { ascending: true });
  return data || [];
};

/** Índices de maturidade por programa e diagnóstico (view pré-calculada). */
export type ProgramDiagnosticoMaturityRow = {
  programa_id: number;
  diagnostico_id: number;
  score: number;
  label: string;
};

export const fetchProgramaDiagnosticoMaturity = async (): Promise<ProgramDiagnosticoMaturityRow[]> => {
  const { data, error } = await supabaseBrowserClient
    .from("programa_diagnostico_maturidade")
    .select("programa_id, diagnostico_id, score, label");
  if (error) {
    console.warn("programa_diagnostico_maturidade view not available:", error.message, error);
    return [];
  }
  const rows = (data || []) as ProgramDiagnosticoMaturityRow[];
  if (rows.length > 0 && typeof window !== "undefined") {
    console.debug("programa_diagnostico_maturidade rows:", rows.length, rows.slice(0, 3));
  }
  return rows;
};

export const fetchOrgaos = async () => {
  const { data } = await supabaseBrowserClient
    .from("orgao")
    .select("*")
    .order("nome", { ascending: true });
  return data || [];
};

export const fetchResponsaveis = async (programaId: number, retries = 3): Promise<any[]> => {
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

export const fetchControles = async (diagnosticoId: number, programaId: number): Promise<any[]> => {
  console.log(`fetchControles: Fetching controles for diagnostico ${diagnosticoId}, programa ${programaId}`);
  
  // First, ensure programa_controle records exist for this program
  await ensureProgramaControleRecords(programaId);
  
  // Debug: Check if controles exist for this diagnostico first
  const { data: allControlesForDiag } = await supabaseBrowserClient
    .from("controle")
    .select("id, numero, nome, diagnostico")
    .eq("diagnostico", diagnosticoId);
  
  console.log(`fetchControles: Found ${allControlesForDiag?.length || 0} controles for diagnostico ${diagnosticoId}:`, allControlesForDiag);
  
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
  console.log(`fetchControles: Full data:`, data);
  
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

export const fetchMedidas = async (controleId: number, programaId: number): Promise<any[]> => {
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

export const fetchProgramaMedida = async (medidaId: number, controleId: number, programaId: number) => {
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

export const updateProgramaMedida = async (medidaId: number, controleId: number, programaId: number, updates: any) => {
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

export const updateControleNivel = async (programaControleId: number, newValue: number) => {
  return await supabaseBrowserClient
    .from("programa_controle")
    .update({ nivel: newValue })
    .eq("id", programaControleId);
};

/** Estrutura mínima de medida para cálculos de maturidade (dashboard). */
export type MedidaStructureItem = { id: number; id_controle: number };

/**
 * Carrega apenas id + id_controle das medidas dos controles informados.
 * Usado no dashboard para contagens e chaves, sem buscar texto das medidas.
 */
export const fetchMedidasStructure = async (
  controleIds: number[]
): Promise<{ [controleId: number]: MedidaStructureItem[] }> => {
  if (controleIds.length === 0) return {};
  const { data, error } = await supabaseBrowserClient
    .from("medida")
    .select("id, id_controle")
    .in("id_controle", controleIds)
    .order("id_medida", { ascending: true });

  if (error) {
    console.error("fetchMedidasStructure: Error", error);
    throw error;
  }
  const byControle: { [controleId: number]: MedidaStructureItem[] } = {};
  (data || []).forEach((m: { id: number; id_controle: number }) => {
    if (!byControle[m.id_controle]) byControle[m.id_controle] = [];
    byControle[m.id_controle].push({ id: m.id, id_controle: m.id_controle });
  });
  return byControle;
};

/**
 * Carrega todos os programa_medida do programa para o dashboard (índices e contagens).
 * Retorna registro completo para que índices e edição tenham id e demais campos.
 */
export const fetchAllProgramaMedidas = async (programaId: number) => {
  await ensureProgramaMedidaRecords(programaId);

  const { data, error } = await supabaseBrowserClient
    .from("programa_medida")
    .select("*")
    .eq("programa", programaId);

  if (error) {
    console.error("fetchAllProgramaMedidas: Error", error);
    throw error;
  }

  const medidaIds = (data || []).map((pm: { medida: number }) => pm.medida);
  if (medidaIds.length === 0) return {} as { [key: string]: any };

  const { data: medidasData } = await supabaseBrowserClient
    .from("medida")
    .select("id, id_controle")
    .in("id", medidaIds);

  const programaMedidasMap: { [key: string]: any } = {};
  (data || []).forEach((programaMedida: any) => {
    const medida = (medidasData || []).find((m: { id: number }) => m.id === programaMedida.medida);
    if (medida) {
      const key = `${programaMedida.medida}-${(medida as { id_controle: number }).id_controle}-${programaId}`;
      programaMedidasMap[key] = programaMedida;
    }
  });
  return programaMedidasMap;
};

// New function to ensure programa_medida records exist
export const ensureProgramaMedidaRecords = async (programaId: number) => {

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

/** Empresa/organização — dados para ROPA e cadastro de programas */
export type EmpresaRow = {
  id: number;
  cnpj: number | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  endereco: string | null;
  atividade_principal: string | null;
  gestor_responsavel: string | null;
  email: string | null;
  telefone: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateProgramaPayload = {
  nome: string;
  setor?: number;
  orgao?: number | null;
  tipo_programa?: string | null;
  descricao_escopo?: string | null;
  /** Vincular programa a uma empresa já cadastrada */
  empresa_id?: number | null;
  /** Ou criar nova empresa e vincular (ignorado se empresa_id for informado) */
  empresa?: {
    cnpj?: string;
    razao_social?: string;
    nome_fantasia?: string;
    endereco?: string;
    atividade_principal?: string;
    gestor_responsavel?: string;
    email?: string;
    telefone?: string;
  } | null;
};

/** Cria uma empresa (tabela empresa). Retorna o id para vincular em programa.empresa_id */
export const createEmpresa = async (data: {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  endereco?: string;
  atividade_principal?: string;
  gestor_responsavel?: string;
  email?: string;
  telefone?: string;
}) => {
  const { data: row, error } = await supabaseBrowserClient
    .from("empresa")
    .insert({
      cnpj: data.cnpj ? Number(String(data.cnpj).replace(/\D/g, "")) || null : null,
      razao_social: data.razao_social || null,
      nome_fantasia: data.nome_fantasia || null,
      endereco: data.endereco || null,
      atividade_principal: data.atividade_principal || null,
      gestor_responsavel: data.gestor_responsavel || null,
      email: data.email || null,
      telefone: data.telefone || null,
    })
    .select("id")
    .single();
  if (error) return { data: null, error };
  return { data: row as { id: number }, error: null };
};

/** Lista empresas vinculadas a programas do usuário (via API). */
export const fetchEmpresasForCurrentUser = async (): Promise<EmpresaRow[]> => {
  const res = await fetch("/api/empresas", { credentials: "include" });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Erro ao carregar empresas");
  }
  return res.json();
};

/** Payload para criar/atualizar empresa (campos opcionais). */
export type EmpresaPayload = {
  cnpj?: string | null;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  endereco?: string | null;
  atividade_principal?: string | null;
  gestor_responsavel?: string | null;
  email?: string | null;
  telefone?: string | null;
};

/** Cria empresa via API (usuário autenticado). */
export const createEmpresaViaApi = async (payload: EmpresaPayload): Promise<{ data: EmpresaRow | null; error: string | null }> => {
  const res = await fetch("/api/empresas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { data: null, error: body?.error || body?.details || "Erro ao criar empresa" };
  }
  return { data: body as EmpresaRow, error: null };
};

/** Atualiza empresa via API. */
export const updateEmpresaViaApi = async (id: number, payload: EmpresaPayload): Promise<{ data: EmpresaRow | null; error: string | null }> => {
  const res = await fetch(`/api/empresas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { data: null, error: body?.error || body?.details || "Erro ao atualizar empresa" };
  }
  return { data: body as EmpresaRow, error: null };
};

/** Exclui empresa via API. Só permite se não houver programas vinculados. */
export const deleteEmpresaViaApi = async (id: number): Promise<{ success: boolean; error: string | null }> => {
  const res = await fetch(`/api/empresas/${id}`, { method: "DELETE", credentials: "include" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, error: body?.error || body?.details || "Erro ao excluir empresa" };
  }
  return { success: true, error: null };
};

/** Busca empresa por id. */
export const fetchEmpresaById = async (id: number): Promise<EmpresaRow | null> => {
  const { data, error } = await supabaseBrowserClient
    .from("empresa")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as EmpresaRow | null;
};

/** Dados da empresa para preencher "Informações de contato" do ROPA (organização, CNPJ, endereço, etc.). */
export const getEmpresaForRegistroRopa = async (programaId: number): Promise<Partial<RegistroRopaRow> | null> => {
  const { data: programa, error: progError } = await supabaseBrowserClient
    .from("programa")
    .select("empresa_id")
    .eq("id", programaId)
    .maybeSingle();
  if (progError || !programa?.empresa_id) return null;
  const emp = await fetchEmpresaById(programa.empresa_id);
  if (!emp) return null;
  const cnpjStr =
    emp.cnpj != null
      ? String(emp.cnpj)
          .replace(/\D/g, "")
          .padStart(14, "0")
          .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
      : "";
  return {
    organizacao: emp.nome_fantasia || emp.razao_social || null,
    cnpj: cnpjStr || null,
    endereco: emp.endereco ?? null,
    atividade_principal: emp.atividade_principal ?? null,
    gestor_responsavel: emp.gestor_responsavel ?? null,
    email: emp.email ?? null,
    telefone: emp.telefone ?? null,
  };
};

export const createPrograma = async (payload: CreateProgramaPayload) => {
  let empresa_id: number | null = payload.empresa_id ?? null;
  if (empresa_id == null && payload.empresa && (payload.empresa.cnpj || payload.empresa.razao_social || payload.empresa.nome_fantasia || payload.empresa.endereco || payload.empresa.email || payload.empresa.telefone)) {
    const { data: emp } = await createEmpresa(payload.empresa);
    if (emp?.id) empresa_id = emp.id;
  }
  const insertPayload: Record<string, unknown> = {
    nome: payload.nome || null,
    tipo_programa: payload.tipo_programa || null,
    descricao_escopo: payload.descricao_escopo || null,
    setor: payload.setor ?? null,
    orgao: payload.orgao ?? null,
    empresa_id: empresa_id ?? null,
  };
  return await supabaseBrowserClient
    .from("programa")
    .insert(insertPayload)
    .select()
    .single();
};

/** Garante criador em programa_users, cria responsável e seta programa.responsavel_privacidade. */
export const setCreatorAsDPO = async (
  programaId: number,
  userId: string,
  email: string,
  nome: string
) => {
  const permissions = getDefaultPermissions(UserRole.ADMIN);
  await supabaseBrowserClient.from("programa_users").upsert(
    {
      programa_id: programaId,
      user_id: userId,
      role: UserRole.ADMIN,
      permissions,
      status: "accepted",
    },
    { onConflict: "programa_id,user_id" }
  );
  const { data: responsavel, error: errResp } = await supabaseBrowserClient
    .from("responsavel")
    .insert({
      programa: programaId,
      nome: nome || email,
      email: email.trim(),
      departamento: "",
    })
    .select("id")
    .single();
  if (errResp || !responsavel) return { error: errResp };
  await supabaseBrowserClient
    .from("programa")
    .update({ responsavel_privacidade: responsavel.id })
    .eq("id", programaId);
  return { error: null };
};

export const deletePrograma = async (programaId: number) => {
  return await supabaseBrowserClient
    .from("programa")
    .delete()
    .eq("id", programaId);
};

export const updateProgramaDetails = async (programaId: number, updates: { cnpj?: string; razao_social?: string }) => {

  const { data, error } = await supabaseBrowserClient
    .from("programa")
    .update(updates)
    .eq("id", programaId);
  return { data, error };
};

export const updateProgramaField = async (programaId: number, field: string, value: any) => {

  const { data, error } = await supabaseBrowserClient
    .from("programa")
    .update({ [field]: value })
    .eq("id", programaId);
  return { data, error };
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

// New function to ensure programa_controle records exist
export const ensureProgramaControleRecords = async (programaId: number) => {

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

// ========== ROPA (Registro das Operações de Tratamento - Art. 37 LGPD) ==========
// Modelo ANPD ATPP: registro_ropa = cabeçalho (1 por programa); ropa = operações (processo, finalidade, hipótese legal).

/** Chaves para categorias de titulares (modelo ANPD). */
export const CATEGORIAS_TITULARES_KEYS = ["titulares_em_geral", "criancas_adolescentes", "idosos"] as const;
/** Chaves para tipos de dados pessoais (modelo ANPD). */
export const TIPOS_DADOS_PESSOAIS_KEYS = ["nome", "endereco", "rg", "email", "cpf", "telefone"] as const;

export type RegistroRopaRow = {
  id: number;
  programa_id: number;
  organizacao: string | null;
  cnpj: string | null;
  endereco: string | null;
  atividade_principal: string | null;
  gestor_responsavel: string | null;
  email: string | null;
  telefone: string | null;
  data_registro: string | null;
  categorias_titulares: string[];
  medidas_seguranca: string | null;
  tipos_dados_pessoais: string[];
  outros_dados_pessoais: string | null;
  compartilhamento: string | null;
  periodo_armazenamento: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type RopaRow = {
  id: number;
  programa_id: number;
  registro_ropa_id: number | null;
  nome: string;
  finalidade: string | null;
  base_legal: string | null;
  categorias_dados: string | null;
  categorias_titulares: string | null;
  compartilhamento: string | null;
  retencao: string | null;
  medidas_seguranca: string | null;
  responsavel: string | null;
  created_at: string;
  updated_at: string;
};

export const fetchRegistroRopaByPrograma = async (programaId: number): Promise<RegistroRopaRow | null> => {
  const { data, error } = await supabaseBrowserClient
    .from("registro_ropa")
    .select("*")
    .eq("programa_id", programaId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    categorias_titulares: Array.isArray(data.categorias_titulares) ? data.categorias_titulares : [],
    tipos_dados_pessoais: Array.isArray(data.tipos_dados_pessoais) ? data.tipos_dados_pessoais : [],
  };
};

export const upsertRegistroRopa = async (
  programaId: number,
  payload: Partial<Omit<RegistroRopaRow, "id" | "programa_id" | "created_at" | "updated_at">>
): Promise<RegistroRopaRow> => {
  const body = {
    programa_id: programaId,
    organizacao: payload.organizacao ?? null,
    cnpj: payload.cnpj ?? null,
    endereco: payload.endereco ?? null,
    atividade_principal: payload.atividade_principal ?? null,
    gestor_responsavel: payload.gestor_responsavel ?? null,
    email: payload.email ?? null,
    telefone: payload.telefone ?? null,
    data_registro: payload.data_registro ?? null,
    categorias_titulares: payload.categorias_titulares ?? [],
    medidas_seguranca: payload.medidas_seguranca ?? null,
    tipos_dados_pessoais: payload.tipos_dados_pessoais ?? [],
    outros_dados_pessoais: payload.outros_dados_pessoais ?? null,
    compartilhamento: payload.compartilhamento ?? null,
    periodo_armazenamento: payload.periodo_armazenamento ?? null,
    observacoes: payload.observacoes ?? null,
  };
  const { data, error } = await supabaseBrowserClient
    .from("registro_ropa")
    .upsert(body, { onConflict: "programa_id" })
    .select()
    .single();
  if (error) throw error;
  return {
    ...data,
    categorias_titulares: Array.isArray(data.categorias_titulares) ? data.categorias_titulares : [],
    tipos_dados_pessoais: Array.isArray(data.tipos_dados_pessoais) ? data.tipos_dados_pessoais : [],
  };
};

export const fetchRopaByPrograma = async (programaId: number): Promise<RopaRow[]> => {
  const { data, error } = await supabaseBrowserClient
    .from("ropa")
    .select("*")
    .eq("programa_id", programaId)
    .order("id", { ascending: true });
  if (error) throw error;
  return data || [];
};

export const createRopa = async (
  programaId: number,
  payload: Omit<RopaRow, "id" | "programa_id" | "registro_ropa_id" | "created_at" | "updated_at">,
  registroRopaId?: number | null
): Promise<RopaRow> => {
  const { data, error } = await supabaseBrowserClient
    .from("ropa")
    .insert({ programa_id: programaId, registro_ropa_id: registroRopaId ?? null, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateRopa = async (
  id: number,
  payload: Partial<Omit<RopaRow, "id" | "programa_id" | "created_at" | "updated_at">>
): Promise<RopaRow> => {
  const { data, error } = await supabaseBrowserClient
    .from("ropa")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteRopa = async (id: number): Promise<void> => {
  const { error } = await supabaseBrowserClient.from("ropa").delete().eq("id", id);
  if (error) throw error;
};

// ========== RIPD (Relatório de Impacto à Proteção de Dados - Art. 38 LGPD) ==========

export type RipdRow = {
  id: number;
  programa_id: number;
  ropa_id: number | null;
  titulo: string;
  descricao_dados: string | null;
  metodologia_coleta_seguranca: string | null;
  medidas_salvaguardas_mitigacao: string | null;
  conclusao: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export const fetchRipdByPrograma = async (programaId: number): Promise<RipdRow[]> => {
  const { data, error } = await supabaseBrowserClient
    .from("ripd")
    .select("*")
    .eq("programa_id", programaId)
    .order("id", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createRipd = async (
  programaId: number,
  payload: Omit<RipdRow, "id" | "programa_id" | "created_at" | "updated_at">
): Promise<RipdRow> => {
  const { data, error } = await supabaseBrowserClient
    .from("ripd")
    .insert({ programa_id: programaId, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateRipd = async (
  id: number,
  payload: Partial<Omit<RipdRow, "id" | "programa_id" | "created_at" | "updated_at">>
): Promise<RipdRow> => {
  const { data, error } = await supabaseBrowserClient
    .from("ripd")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteRipd = async (id: number): Promise<void> => {
  const { error } = await supabaseBrowserClient.from("ripd").delete().eq("id", id);
  if (error) throw error;
};

// ========== Pedidos dos Titulares (art. 18 LGPD) ==========

export type PedidoTitularRow = {
  id: number;
  programa_id: number;
  protocolo: string | null;
  tipo: string;
  nome_titular: string;
  email_titular: string;
  documento_titular: string | null;
  descricao_pedido: string | null;
  status: string;
  data_prazo_resposta: string | null;
  data_resposta: string | null;
  observacoes_internas: string | null;
  origem: string;
  created_at: string;
  updated_at: string;
};

export const PEDIDO_TITULAR_TIPOS = [
  { value: "acesso", label: "Acesso" },
  { value: "correcao", label: "Correção" },
  { value: "exclusao", label: "Exclusão" },
  { value: "portabilidade", label: "Portabilidade" },
  { value: "revogacao_consentimento", label: "Revogação de consentimento" },
] as const;

export const PEDIDO_TITULAR_STATUS = [
  { value: "recebido", label: "Recebido" },
  { value: "em_analise", label: "Em análise" },
  { value: "atendido", label: "Atendido" },
  { value: "recusado", label: "Recusado" },
  { value: "parcial", label: "Parcial" },
] as const;

export const fetchPedidosTitulares = async (programaId: number): Promise<PedidoTitularRow[]> => {
  const { data, error } = await supabaseBrowserClient
    .from("pedido_titular")
    .select("*")
    .eq("programa_id", programaId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createPedidoTitular = async (
  programaId: number,
  payload: Omit<PedidoTitularRow, "id" | "programa_id" | "protocolo" | "created_at" | "updated_at">
): Promise<PedidoTitularRow> => {
  const { data, error } = await supabaseBrowserClient
    .from("pedido_titular")
    .insert({ programa_id: programaId, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updatePedidoTitular = async (
  id: number,
  payload: Partial<Omit<PedidoTitularRow, "id" | "programa_id" | "protocolo" | "created_at" | "updated_at">>
): Promise<PedidoTitularRow> => {
  const { data, error } = await supabaseBrowserClient
    .from("pedido_titular")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deletePedidoTitular = async (id: number): Promise<void> => {
  const { error } = await supabaseBrowserClient.from("pedido_titular").delete().eq("id", id);
  if (error) throw error;
};

// ========== Incidentes de segurança (dados pessoais) ==========

export type IncidenteRow = {
  id: number;
  programa_id: number;
  data_ocorrencia: string | null;
  data_detecao: string | null;
  titulo: string;
  descricao: string | null;
  tipo: string | null;
  dados_afetados: string | null;
  comunicacao_anpd: boolean;
  data_comunicacao_anpd: string | null;
  comunicacao_titulares: boolean;
  data_comunicacao_titulares: string | null;
  medidas_adotadas: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export const INCIDENTE_STATUS = [
  { value: "em_analise", label: "Em análise" },
  { value: "comunicado_anpd", label: "Comunicado à ANPD" },
  { value: "comunicado_titulares", label: "Comunicado aos titulares" },
  { value: "encerrado", label: "Encerrado" },
  { value: "outro", label: "Outro" },
] as const;

export const fetchIncidentesByPrograma = async (programaId: number): Promise<IncidenteRow[]> => {
  const { data, error } = await supabaseBrowserClient
    .from("incidente")
    .select("*")
    .eq("programa_id", programaId)
    .order("data_ocorrencia", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createIncidente = async (
  programaId: number,
  payload: Omit<IncidenteRow, "id" | "programa_id" | "created_at" | "updated_at">
): Promise<IncidenteRow> => {
  const { data, error } = await supabaseBrowserClient
    .from("incidente")
    .insert({ programa_id: programaId, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateIncidente = async (
  id: number,
  payload: Partial<Omit<IncidenteRow, "id" | "programa_id" | "created_at" | "updated_at">>
): Promise<IncidenteRow> => {
  const { data, error } = await supabaseBrowserClient
    .from("incidente")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteIncidente = async (id: number): Promise<void> => {
  const { error } = await supabaseBrowserClient.from("incidente").delete().eq("id", id);
  if (error) throw error;
};

// ========== Reportes do portal (vulnerabilidade/incidente enviados pelo público) ==========

export type ProgramaReporteRow = {
  id: number;
  programa_id: number;
  tipo: "vulnerabilidade" | "incidente";
  nome: string | null;
  email: string;
  descricao: string;
  created_at: string;
};

export const fetchProgramaReportes = async (programaId: number): Promise<ProgramaReporteRow[]> => {
  const { data, error } = await supabaseBrowserClient
    .from("programa_reportes")
    .select("*")
    .eq("programa_id", programaId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

// ========== Mensagens de contato do portal (formulário de contato) ==========

export type ProgramaContatoRow = {
  id: number;
  programa_id: number;
  nome: string;
  email: string;
  assunto: string | null;
  mensagem: string;
  created_at: string;
};

export const fetchProgramaContato = async (programaId: number): Promise<ProgramaContatoRow[]> => {
  const { data, error } = await supabaseBrowserClient
    .from("programa_contato")
    .select("*")
    .eq("programa_id", programaId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};
