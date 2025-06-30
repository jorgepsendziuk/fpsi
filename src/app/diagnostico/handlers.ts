import { supabaseBrowserClient } from "@utils/supabase/client";
import { Dispatch } from "react";
import { Action } from "../../lib/types/types";
import * as dataService from "../../lib/services/dataService";

export const fetchDiagnosticos = async (dispatch: Dispatch<Action>) => {
  const { data } = await supabaseBrowserClient
    .from("diagnostico")
    .select("*")
    .order("id", { ascending: true });
  dispatch({ type: "SET_DIAGNOSTICOS", payload: data });
};

export const fetchControlesAndMedidas = async (programaId: number, dispatch: Dispatch<Action>) => {
  const diagnosticos = await supabaseBrowserClient
    .from("diagnostico")
    .select("id")
    .order("id", { ascending: true });
  for (const diagnostico of diagnosticos.data || []) {
    const controles = await supabaseBrowserClient
      .from("controle")
      .select("id")
      .eq("diagnostico", diagnostico.id)
      .order("numero", { ascending: true });
    for (const controle of controles.data || []) {
      await handleMedidaFetch(controle.id, programaId, dispatch);
    }
    await handleControleFetch(diagnostico.id, programaId, dispatch);
  }
};

export const handleControleFetch = async (diagnosticoId: number, programaId: number, dispatch: Dispatch<Action>) => {
  const data = await dataService.fetchControles(diagnosticoId, programaId);
  dispatch({ type: "SET_CONTROLES", diagnosticoId, payload: data });
};

export const handleMedidaFetch = async (controleId: number, programaId: number, dispatch: Dispatch<Action>) => {
  const data = await dataService.fetchMedidas(controleId, programaId);
  dispatch({ type: "SET_MEDIDAS", controleId, payload: data });
};
