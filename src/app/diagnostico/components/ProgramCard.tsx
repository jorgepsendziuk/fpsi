import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { useThemeColors } from "../hooks/useThemeColors";
import Programa from "../programa";
import ProgramSummaryContent from "./ProgramSummaryContent";
import ResponsaveisSection from "./ResponsaveisSection";
import DiagnosticoSection from "./DiagnosticoSection";
import { useMediaQuery } from '@mui/material';

interface ProgramCardProps {
  programa: any;
  expanded: string | false;
  orgaos: any[];
  editedValues: {[key: number]: {cnpj?: string, razao_social?: string}};
  state: any;
  setExpanded: (expanded: string | false) => void;
  setEditedValues: React.Dispatch<React.SetStateAction<{[key: number]: {cnpj?: string, razao_social?: string}}>>;
  dispatch: any;
  handleSaveCompanyDetails: (programaId: number) => Promise<void>;
  handleDeletePrograma: (programaId: number) => Promise<void>;
  handleProgramaFetch: (programaId: number) => Promise<void>;
  fetchControlesAndMedidas: (programaId: number) => Promise<void>;
  handleControleFetch: any;
  handleINCCChange: any;
  handleMedidaFetch: any;
  handleMedidaChange: any;
  setToastMessage: (message: string | null) => void;
  setToastSeverity: (severity: "success" | "error") => void;
}

const ProgramCard = ({ 
  programa, expanded, orgaos, editedValues, state, setExpanded, setEditedValues, 
  dispatch, handleSaveCompanyDetails, handleDeletePrograma, handleProgramaFetch,
  fetchControlesAndMedidas, handleControleFetch, handleINCCChange, handleMedidaFetch, 
  handleMedidaChange, setToastMessage, setToastSeverity
}: ProgramCardProps) => {
  const { 
    getContrastTextColor,
    getAccordionBackgroundColor, 
    getAccordionSummaryBackgroundColor,
    getAccordionHoverBackgroundColor, 
    getAccordionBorderColor
  } = useThemeColors();
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Accordion
      key={programa.id}
      expanded={expanded === programa.id.toString()}
      onChange={() => handleProgramaFetch(programa.id)}
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        mb: 2,
        borderRadius: 2,
        '&:before': {
          display: 'none',
        },
        backgroundColor: getAccordionBackgroundColor(),
        '& .MuiAccordionSummary-root': {
          borderRadius: 2,
          backgroundColor: getAccordionSummaryBackgroundColor(),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: getAccordionHoverBackgroundColor(),
          },
          padding: { xs: 1, sm: 2 },
        },
        boxShadow: 3,
        border: 'none',
        '&.Mui-expanded': {
          margin: '0 0 16px 0',
          boxShadow: 6,
          backgroundColor: getAccordionBackgroundColor(),
          '& .MuiAccordionSummary-root': {
            backgroundColor: getAccordionSummaryBackgroundColor(),
            borderBottom: '1px solid',
            borderColor: getAccordionBorderColor(),
          },
        },
        '& .MuiAccordionDetails-root .MuiTypography-root': {
          color: getContrastTextColor(),
        },
        '& .MuiAccordionDetails-root': {
          backgroundColor: getAccordionBackgroundColor(),
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        width: '100%' 
      }}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            flexGrow: 1,
            minHeight: { xs: 80, sm: 64 },
            '& .MuiAccordionSummary-content': {
              margin: { xs: '8px 0', sm: '12px 0' },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'flex-start'
            },
            '&.Mui-expanded': {
              backgroundColor: getAccordionSummaryBackgroundColor(),
            },
            '&:hover': {
              filter: 'brightness(0.95)',
            },
            width: '100%'
          }}
        >
          <ProgramSummaryContent 
            programa={programa}
            isMobile={isMobile}
            orgaos={orgaos}
            editedValues={editedValues}
            state={state}
            dispatch={dispatch}
            setEditedValues={setEditedValues}
            setToastMessage={setToastMessage}
            setToastSeverity={setToastSeverity}
          />
        </AccordionSummary>
        
        <Box sx={{ 
          display: 'flex',
          width: { xs: '100%', sm: 'auto' },
          justifyContent: { xs: 'flex-end', sm: 'center' },
          mb: { xs: 1, sm: 0 },
          gap: 1
        }}>
          {editedValues[programa.id] && (
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                handleSaveCompanyDetails(programa.id);
              }}
              color="success"
              sx={{
                mr: { xs: 0, sm: 1 },
                '&:hover': {
                  backgroundColor: 'success.main',
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <SaveIcon />
            </IconButton>
          )}
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              handleDeletePrograma(programa.id);
            }}
            color="error"
            sx={{
              mr: { xs: 0, sm: 2 },
              '&:hover': {
                backgroundColor: 'error.main',
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
      
      <AccordionDetails sx={{ bottom: 10, p: { xs: 1, sm: 2 } }}>
        <Programa key={programa.id} programaId={programa.id} /> 
        
        
        
        <DiagnosticoSection 
          programa={programa}
          state={state}
          fetchControlesAndMedidas={fetchControlesAndMedidas}
          handleControleFetch={handleControleFetch}
          handleINCCChange={handleINCCChange}
          handleMedidaFetch={handleMedidaFetch}
          handleMedidaChange={handleMedidaChange}
          responsaveis={state.responsaveis}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default ProgramCard;
