import { supabaseBrowserClient } from "@utils/supabase/client";
import { Dispatch } from "react";
import { Action } from "./types";

export const fetchDiagnosticos = async (dispatch: Dispatch<Action>) => {
  const { data } = await supabaseBrowserClient
    .from("diagnostico")
    .select("*")
    .order("id", { ascending: true });
  dispatch({ type: "SET_DIAGNOSTICOS", payload: data });
};



export const fetchControlesAndMedidas = async (dispatch: Dispatch<Action>) => {
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
      await handleMedidaFetch(controle.id, dispatch);
    }
    await handleControleFetch(diagnostico.id, dispatch);
  }
};

export const handleControleFetch = async (diagnosticoId: number, dispatch: Dispatch<Action>) => {
  const { data } = await supabaseBrowserClient
    .from("controle")
    .select("*")
    .eq("diagnostico", diagnosticoId)
    .order("numero", { ascending: true });
  dispatch({ type: "SET_CONTROLES", payload: data });
};

export const handleMedidaFetch = async (controleId: number, dispatch: Dispatch<Action>) => {
  const { data } = await supabaseBrowserClient
    .from("medida")
    .select("*")
    .eq("controle", controleId)
    .order("numero", { ascending: true });
  dispatch({ type: "SET_MEDIDAS", payload: data });
};
