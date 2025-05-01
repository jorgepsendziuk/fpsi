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
    .select("*")
    .eq("diagnostico", diagnosticoId)
    .eq("programa", programaId)
    .order("id", { ascending: true });
  
  return data ? data.map(controle => mergeControleData(controle)) : [];
};

export const fetchMedidas = async (controleId: number): Promise<any[]> => {
  const { data } = await supabaseBrowserClient
    .from("medida")
    .select("*")
    .eq("id_controle", controleId)
    .order("id_medida", { ascending: true });
  return data || [];
};

export const updateControleNivel = async (controleId: number, newValue: number) => {
  return await supabaseBrowserClient
    .from("controle")
    .update({ nivel: newValue })
    .eq("id", controleId);
};

export const updateMedida = async (medidaId: number, field: string, value: any) => {
  const updatePayload = { [field]: value };
  return await supabaseBrowserClient
    .from("medida")
    .update(updatePayload)
    .eq("id", medidaId);
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
