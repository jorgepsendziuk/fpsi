// React and hooks
import React, { useState, useEffect, useCallback } from 'react';

// Types
import { Medida, Controle, Responsavel, MedidaTextField, ProgramaMedida } from '../../../lib/types/types';

// Components
import MedidaComponent from '../Medida';

// Utils
import dayjs from 'dayjs';
import * as dataService from '../../../lib/services/dataService';
import {
  TIPO_POLITICA_POSIN,
  TIPO_POLITICA_PROTECAO_DADOS,
  buildEvidenciaContext,
  getEvidenciaSugestao,
  textoJustificativaSugestao,
  type EvidenciaSugestao as EvidenciaSugestaoTipo,
} from '../../../lib/medidas/evidenciaRules';

/**
 * Props for the MedidaContainer component
 */
export interface MedidaContainerProps {
  /** The measure data */
  medida: Medida;
  /** The programa medida data containing junction table data */
  programaMedida?: ProgramaMedida;
  /** The parent control */
  controle: Controle;
  /** The program ID */
  programaId: number;
  programaPathSegment?: string;
  /** Function to handle changes to the measure */
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: string, value: any) => void;
  /** List of available responsibles */
  responsaveis: Responsavel[];
}

/**
 * Container component for Medida that manages state and logic
 */
const MedidaContainer: React.FC<MedidaContainerProps> = ({
  medida,
  programaMedida,
  controle,
  programaId,
  programaPathSegment,
  handleMedidaChange,
  responsaveis,
}) => {
  // Local state for form values
  const [localValues, setLocalValues] = useState({
    justificativa: programaMedida?.justificativa || "",
    encaminhamento_interno: programaMedida?.encaminhamento_interno || "",
    observacao_orgao: programaMedida?.observacao_orgao || "",
    nova_resposta: programaMedida?.nova_resposta || ""
  });

  // Update local values when medida prop changes
  useEffect(() => {
    setLocalValues({
      justificativa: programaMedida?.justificativa || "",
      encaminhamento_interno: programaMedida?.encaminhamento_interno || "",
      observacao_orgao: programaMedida?.observacao_orgao || "",
      nova_resposta: programaMedida?.nova_resposta || ""
    });
  }, [programaMedida]);

  const [evidenciaSugestao, setEvidenciaSugestao] = useState<EvidenciaSugestaoTipo | null>(null);
  const [evidenciaLoading, setEvidenciaLoading] = useState(false);

  useEffect(() => {
    if (controle.diagnostico !== 1) {
      setEvidenciaSugestao(null);
      setEvidenciaLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setEvidenciaLoading(true);
      try {
        const [programa, posin, protecaoDados, gruposRaw] = await Promise.all([
          dataService.fetchProgramaById(programaId),
          dataService.fetchPoliticaProgramaByTipo(programaId, TIPO_POLITICA_POSIN),
          dataService.fetchPoliticaProgramaByTipo(programaId, TIPO_POLITICA_PROTECAO_DADOS),
          dataService.fetchGovernancaGruposMembros(programaId),
        ]);
        if (cancelled) return;
        const gruposGovernanca = {
          comiteSi: gruposRaw.comite_seguranca_informacao.length,
          comiteDados: gruposRaw.comite_protecao_dados.length,
          etir: gruposRaw.etir.length,
        };
        const ctx = buildEvidenciaContext(programa, posin, protecaoDados, gruposGovernanca);
        setEvidenciaSugestao(getEvidenciaSugestao(medida.id_medida, ctx));
      } catch {
        if (!cancelled) setEvidenciaSugestao(null);
      } finally {
        if (!cancelled) setEvidenciaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [programaId, controle.diagnostico, medida.id_medida]);

  /**
   * Determines the status_plano_acao based on dates and status_medida
   */
  const determineStatusPlanoAcao = useCallback(() => {
    const today = dayjs();
    const inicioDate = programaMedida?.previsao_inicio ? dayjs(programaMedida.previsao_inicio) : null;
    const fimDate = programaMedida?.previsao_fim ? dayjs(programaMedida.previsao_fim) : null;
    
    // If both dates are defined, check if start date is after end date
    if (inicioDate && fimDate && inicioDate.isAfter(fimDate)) {
      return 1; // Datas inválidas
    }
    
    // If status_medida is "Finalizado" (1)
    if (programaMedida?.status_medida === 1) {
      return 2; // Concluído
    }
    
    // If start date is in the future
    if (inicioDate && inicioDate.isAfter(today)) {
      return 3; // Não iniciado
    }
    
    // If start date is today
    if (inicioDate && inicioDate.format('YYYY-MM-DD') === today.format('YYYY-MM-DD')) {
      return 4; // Em andamento
    }
    
    // If current date is between start and end date
    if (inicioDate && fimDate && 
        today.isAfter(inicioDate) && 
        today.isBefore(fimDate)) {
      return 4; // Em andamento
    }
    
    // If end date is in the past
    if (fimDate && today.isAfter(fimDate)) {
      return 5; // Atrasado
    }
    
    // Default if no condition matches
    return 3; // Default to "Não iniciado"
  }, [programaMedida?.previsao_inicio, programaMedida?.previsao_fim, programaMedida?.status_medida]);

  // Memoized change handler to prevent unnecessary re-renders
  const memoizedHandleMedidaChange = useCallback(handleMedidaChange, [handleMedidaChange]);

  // Update status_plano_acao whenever relevant fields change
  useEffect(() => {
    // Only update if we have programaMedida and the calculation would change
    if (programaMedida) {
      const newStatus = determineStatusPlanoAcao();
      if (newStatus !== programaMedida.status_plano_acao) {
        console.log(`Updating status_plano_acao for medida ${medida.id}: ${programaMedida.status_plano_acao} -> ${newStatus}`);
        memoizedHandleMedidaChange(medida.id, controle.id, programaId, "status_plano_acao", newStatus);
      }
    }
  }, [
    medida.id, 
    controle.id, 
    programaId, 
    programaMedida,
    determineStatusPlanoAcao,
    memoizedHandleMedidaChange
  ]);

  /**
   * Handles changes to text fields by updating local state
   */
  const handleTextChange = useCallback((field: MedidaTextField, value: string) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAplicarSugestao = useCallback(async () => {
    if (!evidenciaSugestao?.regraDefinida || evidenciaSugestao.respostaSugerida == null) return;
    const rid = evidenciaSugestao.respostaSugerida;
    await handleMedidaChange(medida.id, controle.id, programaId, "resposta", rid);
    const extra = textoJustificativaSugestao(evidenciaSugestao);
    if (extra) {
      const current = (localValues.justificativa || "").trim();
      const merged = current ? `${current}\n\n${extra}` : extra;
      await handleMedidaChange(medida.id, controle.id, programaId, "justificativa", merged);
      handleTextChange("justificativa", merged);
    }
  }, [
    evidenciaSugestao,
    handleMedidaChange,
    medida.id,
    controle.id,
    programaId,
    localValues.justificativa,
    handleTextChange,
  ]);

  /**
   * Handles saving a field value by calling the parent handler
   */
  const handleSaveField = useCallback((field: MedidaTextField) => {
    memoizedHandleMedidaChange(medida.id, controle.id, programaId, field, localValues[field]);
  }, [medida.id, controle.id, programaId, localValues, memoizedHandleMedidaChange]);

  return (
    <MedidaComponent
      medida={medida}
      programaMedida={programaMedida}
      controle={controle}
      programaId={programaId}
      programaPathSegment={programaPathSegment}
      handleMedidaChange={handleMedidaChange}
      responsaveis={responsaveis}
      localValues={localValues} 
      handleTextChange={handleTextChange}
      handleSaveField={handleSaveField}
      evidenciaSugestao={evidenciaSugestao}
      evidenciaLoading={evidenciaLoading}
      onAplicarSugestao={handleAplicarSugestao}
    />
  );
};

export default MedidaContainer; 