import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useThemeColors } from "../hooks/useThemeColors";
import DiagnosticoComponent from "./Diagnostico";
import { calculateSumOfResponsesForDiagnostico, getMaturityLabel } from "../utils";

interface DiagnosticoSectionProps {
  programa: any;
  state: any;
  fetchControlesAndMedidas: (programaId: number) => Promise<void>;
  handleControleFetch: (diagnosticoId: number, programaId: number) => Promise<void>;
  handleINCCChange: (programaControleId: number, diagnosticoId: number, value: number) => void;
  handleMedidaFetch: (controleId: number, programaId: number) => Promise<void>;
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: string, value: any) => void;
  responsaveis: any[];
}

const DiagnosticoSection: React.FC<DiagnosticoSectionProps> = ({
  programa,
  state,
  fetchControlesAndMedidas,
  handleControleFetch,
  handleINCCChange,
  handleMedidaFetch,
  handleMedidaChange,
  responsaveis,
}) => {
  const { 
    accordionStyles 
  } = useThemeColors();

  return (
    <Accordion
      onChange={() => fetchControlesAndMedidas(programa.id)}
      sx={{
        ...accordionStyles,
        width: '100%', // Garantir largura total
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{
          // Set text color to black for this summary
          '& .MuiTypography-root': {
            color: '#000000',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CheckCircleOutlineIcon fontSize="large" color="primary" sx={{ ml: 1 }} />
          <Typography variant="h5" style={{ fontWeight: "500" }}>Diagnóstico</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {state.diagnosticos.map((diagnostico: any) => {
          // Calcular o índice de maturidade corretamente
          const calculatedMaturityScore = calculateSumOfResponsesForDiagnostico(diagnostico.id, state);
          const calculatedMaturityLabel = getMaturityLabel(Number(calculatedMaturityScore));
          
          return (
            <DiagnosticoComponent
              key={diagnostico.id}
              programa={programa}
              diagnostico={diagnostico}
              handleControleFetch={handleControleFetch}
              state={state}
              controles={state.controles && state.controles[diagnostico.id] ? 
                state.controles[diagnostico.id].filter((controle: any) => controle.programa === programa.id) : 
                []
              }
              maturityScore={calculatedMaturityScore}
              maturityLabel={calculatedMaturityLabel}
              handleINCCChange={handleINCCChange}
              handleMedidaFetch={handleMedidaFetch}
              handleMedidaChange={handleMedidaChange}
              responsaveis={responsaveis}
            />
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
};

export default DiagnosticoSection;
