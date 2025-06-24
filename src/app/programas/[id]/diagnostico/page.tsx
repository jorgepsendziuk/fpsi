"use client";
import React, { useReducer, useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Container, Typography, Card, CardContent, Stack, Box, Chip } from "@mui/material";
import { initialState, reducer } from "../../../diagnostico/state";
import * as dataService from "../../../diagnostico/services/dataService";
import DiagnosticoComponent from "../../../diagnostico/components/Diagnostico";
import { calculateDiagnosticoMaturityCached, clearMaturityCache } from "../../../diagnostico/utils/maturity";

export default function ProgramaDiagnosticoPage() {
  const params = useParams();
  const programaId = parseInt(params.id as string);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const diagnosticos = await dataService.fetchDiagnosticos();
      dispatch({ type: "SET_DIAGNOSTICOS", payload: diagnosticos });
      for (const diagnostico of diagnosticos) {
        const controles = await dataService.fetchControles(diagnostico.id, programaId);
        dispatch({ type: "SET_CONTROLES", diagnosticoId: diagnostico.id, payload: controles });
        for (const controle of controles) {
          const medidas = await dataService.fetchMedidas(controle.id, programaId);
          dispatch({ type: "SET_MEDIDAS", controleId: controle.id, payload: medidas });
        }
      }
      if (mounted) setDataLoaded(true);
    };
    loadData();
    return () => { mounted = false; };
  }, [programaId]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h5" fontWeight="bold" mb={4} align="center">
        Diagnóstico
      </Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {dataLoaded ? state.diagnosticos.map((diagnostico: any, index: number) => {
              const controles = state.controles && state.controles[diagnostico.id] ?
                state.controles[diagnostico.id].filter((controle: any) => controle.programa === programaId) :
                [];
              const maturityData = calculateDiagnosticoMaturityCached(diagnostico.id, programaId, state);
              return (
                <Box key={`${diagnostico.id}-${index}`}>
                  <DiagnosticoComponent
                    programa={{
                      id: programaId,
                      orgao: 0,
                      sgd_versao_diagnostico_enviado: "",
                      sgd_versao_diagnostico: "",
                      responsavel_controle_interno: 0,
                      responsavel_si: 0,
                      responsavel_privacidade: 0,
                      responsavel_ti: 0,
                      sgd_numero_documento_nota_tecnica: "",
                      sgd_data_limite_retorno: new Date(),
                      sgd_retorno_data: new Date(),
                      setor: 0,
                      cnpj: 0,
                      razao_social: "",
                      nome_fantasia: "",
                      atendimento_fone: "",
                      atendimento_email: "",
                      atendimento_site: "",
                      politica_inicio_vigencia: new Date(),
                      politica_prazo_revisao: new Date(),
                    }}
                    diagnostico={diagnostico}
                    state={state}
                    controles={controles}
                    maturityScore={maturityData.score}
                    maturityLabel={maturityData.label}
                    handleControleFetch={async (controleId: number, programaId: number) => {}}
                    handleINCCChange={() => {}}
                    handleMedidaFetch={async (controleId: number, programaId: number) => {}}
                    handleMedidaChange={() => {}}
                    responsaveis={state.responsaveis || []}
                  />
                </Box>
              );
            }) : <Chip label="Carregando..." color="info" />}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
} 