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
import Diagnostico from "../diagnostico";
import { useThemeColors } from "../hooks/useThemeColors";

interface DiagnosticoSectionProps {
  programa: any;
  state: any;
  fetchControlesAndMedidas: (programaId: number) => Promise<void>;
  handleControleFetch: any;
  handleINCCChange: any;
  handleMedidaFetch: any;
  handleMedidaChange: any;
  responsaveis: any[];
}

const DiagnosticoSection = ({ 
  programa, state, fetchControlesAndMedidas, handleControleFetch, 
  handleINCCChange, handleMedidaFetch, handleMedidaChange, responsaveis 
}: DiagnosticoSectionProps) => {
  const { 
    getContrastTextColor, 
    getAccordionBackgroundColor,
    getAccordionHoverBackgroundColor,
    getAccordionSummaryBackgroundColor,
    getAccordionBorderColor
  } = useThemeColors();

  return (
    <Accordion
      onChange={() => fetchControlesAndMedidas(programa.id)}
      sx={{
        mb: 2,
        borderRadius: 2,
        '&:before': {
          display: 'none',
        },
        '& .MuiAccordionSummary-root': {
          borderRadius: 2,
          backgroundColor: getAccordionBackgroundColor(),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: getAccordionHoverBackgroundColor(),
          },
        },
        boxShadow: 2,
        border: 'none',
        '&.Mui-expanded': {
          margin: '0 0 16px 0',
          boxShadow: 4,
          backgroundColor: getAccordionBackgroundColor(),
          '& .MuiAccordionSummary-root': {
            backgroundColor: getAccordionSummaryBackgroundColor(),
            borderBottom: '1px solid',
            borderColor: getAccordionBorderColor(),
          },
        },
        '& .MuiTypography-root': {
          color: getContrastTextColor(),
        },
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 64,
          '& .MuiAccordionSummary-content': {
            margin: '12px 0',
          },
          // Set text color to black for this summary
          '& .MuiTypography-root': {
            color: '#000000',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CheckCircleOutlineIcon fontSize="medium" color="primary" sx={{ ml: 1 }} />
          <Typography variant="h5" style={{ fontWeight: "400" }}>Diagnóstico</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {state.diagnosticos.map((diagnostico: any) => (
          <Diagnostico
            key={diagnostico.id}
            programa={programa}
            diagnostico={diagnostico}
            state={state}
            handleControleFetch={handleControleFetch}
            handleINCCChange={handleINCCChange}
            handleMedidaFetch={handleMedidaFetch}
            handleMedidaChange={handleMedidaChange}
            responsaveis={responsaveis}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

export default DiagnosticoSection;
