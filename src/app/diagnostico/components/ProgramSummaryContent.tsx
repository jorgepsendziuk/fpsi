import React from "react";
import {
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import ShieldIcon from '@mui/icons-material/Shield';
import CNPJMask from "./CNPJMask";
import { sanitizeCNPJ, getEntityInitial } from "../helpers/formatter";
import { setor } from "../utils";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { useThemeColors } from "../hooks/useThemeColors";

interface ProgramSummaryContentProps {
  programa: any;
  isMobile: boolean;
  orgaos: any[];
  editedValues: {[key: number]: {cnpj?: string, razao_social?: string}};
  state: any;
  dispatch: any;
  setEditedValues: React.Dispatch<React.SetStateAction<{[key: number]: {cnpj?: string, razao_social?: string}}>>;
  setToastMessage: (message: string | null) => void;
  setToastSeverity: (severity: "success" | "error") => void;
}

const ProgramSummaryContent = ({ 
  programa, isMobile, orgaos, editedValues, state, dispatch, setEditedValues, 
  setToastMessage, setToastSeverity 
}: ProgramSummaryContentProps) => {
  const { getContrastTextColor, theme } = useThemeColors();

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: { xs: 1, sm: 2 }, 
      width: '100%', 
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' } 
    }}>
      <Box 
        sx={{ 
          width: '100%',
          display: 'flex', 
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          mb: { xs: 2, sm: 0 },
          maxWidth: { xs: '100%', sm: '10%' }
        }}
      >
        <Box sx={{ 
          position: 'relative',
          width: { sm: '100%' }
        }}>
          <ShieldIcon 
            fontSize={isMobile ? "large" : "large"} 
            color="primary" 
            sx={{ 
              fontSize: { xs: '4rem', sm: '4rem' },
              width: '100%'
            }} 
          />
          <Typography 
            variant="h5" 
            sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              fontWeight: 'bold',
              color: '#FFFFFF', // Always white
              fontSize: { xs: '2rem', sm: '1.75rem' }
            }}
          >
            {getEntityInitial(programa, orgaos)}
          </Typography>
        </Box>
        <Box sx={{ 
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'column',
          width: '70%'
        }}>
          <Typography variant="caption" sx={{ color: getContrastTextColor(), mb: 0.5, display: 'block' }}>
            Setor:
          </Typography>
          <Select
            id={`setor-mobile-${programa.id}`}
            name="setor"
            fullWidth
            size="medium"
            sx={{
              height: 56,
              color: getContrastTextColor(),
              '& .MuiSelect-select': {
                fontSize: '1.2rem',
                paddingTop: 2,
                paddingBottom: 2,
                color: getContrastTextColor(),
              },
              '& .MuiInputLabel-root': {
                color: getContrastTextColor(),
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
              },
            }}
            value={programa.setor || 1}
            displayEmpty
            onClick={(event) => event.stopPropagation()}
            onChange={async (event) => {
              event.stopPropagation();
              const newValue = event.target.value;
              const { error } = await supabaseBrowserClient
                .from("programa")
                .update({ setor: newValue })
                .eq("id", programa.id);
              
              if (!error) {
                const updatedProgramas = state.programas.map((p: any) => 
                  p.id === programa.id ? { ...p, setor: newValue } : p
                );
                dispatch({ type: "SET_PROGRAMAS", payload: updatedProgramas });
                setToastMessage("Setor atualizado com sucesso");
                setToastSeverity("success");
              } else {
                setToastMessage("Erro ao atualizar setor");
                setToastSeverity("error");
              }
            }}
          >
            {setor.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
      <Box sx={{ 
        width: { xs: '100%', sm: '20%' },  
        display: { xs: 'none', sm: 'block' },
      }}>
        <Typography variant="caption" sx={{ color: getContrastTextColor(), mb: 0.5, display: 'block' }}>
          Setor:
        </Typography>
        <Select
          id={`setor-${programa.id}`}
          name="setor"
          fullWidth
          size="medium"
          sx={{
            height: 56,
            color: getContrastTextColor(),
            '& .MuiSelect-select': {
              fontSize: '1.2rem',
              paddingTop: 2,
              paddingBottom: 2,
              color: getContrastTextColor(),
            },
            '& .MuiInputLabel-root': {
              color: getContrastTextColor(),
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
            },
          }}
          value={programa.setor || 1}
          displayEmpty
          onClick={(event) => event.stopPropagation()}
          onChange={async (event) => {
            event.stopPropagation();
            const newValue = event.target.value;
            const { error } = await supabaseBrowserClient
              .from("programa")
              .update({ setor: newValue })
              .eq("id", programa.id);
            
            if (!error) {
              const updatedProgramas = state.programas.map((p: any) => 
                p.id === programa.id ? { ...p, setor: newValue } : p
              );
              dispatch({ type: "SET_PROGRAMAS", payload: updatedProgramas });
              setToastMessage("Setor atualizado com sucesso");
              setToastSeverity("success");
            } else {
              setToastMessage("Erro ao atualizar setor");
              setToastSeverity("error");
            }
          }}
        >
          {setor.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Box sx={{ width: { xs: '100%', sm: '70%' } }}>  
        <Typography variant="caption" sx={{ color: getContrastTextColor(), mb: 0.5, display: 'block' }}>
          {programa.setor === 2 ? 'Empresa:' : 'Órgão:'}
        </Typography>
        {programa.setor === 2 ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 5, md: 4 }}>
              <TextField
                id={`cnpj-${programa.id}`}
                name="cnpj"
                fullWidth
                size="medium"
                label="CNPJ"
                value={
                  editedValues[programa.id]?.cnpj !== undefined
                    ? editedValues[programa.id].cnpj 
                    : String(programa.cnpj || '')
                }
                InputProps={{
                  inputComponent: CNPJMask as any,
                }}
                sx={{
                  height: 56,
                  mb: { xs: 2, sm: 0 },
                  '& .MuiInputBase-input': {
                    fontSize: '1.2rem',
                    paddingTop: 2,
                    paddingBottom: 2,
                    // Ensure text doesn't get cut off
                    letterSpacing: '0.5px',
                    color: getContrastTextColor(),
                  },
                  // Increase minimum width
                  minWidth: { sm: '180px' },
                  '& .MuiInputLabel-root': {
                    color: getContrastTextColor(),
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                    },
                  },
                }}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  const sanitizedValue = sanitizeCNPJ(event.target.value);
                  setEditedValues((prev) => ({
                    ...prev,
                    [programa.id]: {
                      ...prev[programa.id],
                      cnpj: sanitizedValue
                    }
                  }));
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 7, md: 8 }}>
              <TextField
                id={`razao_social-${programa.id}`}
                name="razao_social"
                fullWidth
                size="medium"
                label="Razão Social"
                value={
                  editedValues[programa.id]?.razao_social !== undefined
                    ? editedValues[programa.id].razao_social
                    : (programa.razao_social || "")
                }
                sx={{
                  height: 56,
                  '& .MuiInputBase-input': {
                    fontSize: '1.2rem',
                    paddingTop: 2,
                    paddingBottom: 2,
                    color: getContrastTextColor(),
                  },
                  '& .MuiInputLabel-root': {
                    color: getContrastTextColor(),
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                    },
                  },
                }}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  const newValue = event.target.value;
                  setEditedValues((prev) => ({
                    ...prev,
                    [programa.id]: {
                      ...prev[programa.id],
                      razao_social: newValue
                    }
                  }));
                }}
              />
            </Grid>
          </Grid>
        ) : (
          <Select
            id={`orgao-${programa.id}`}
            name="orgao"
            fullWidth
            size="medium"
            sx={{
              height: 56,
              color: getContrastTextColor(),
              '& .MuiSelect-select': {
                fontSize: '1.2rem',
                paddingTop: 2,
                paddingBottom: 2,
                color: getContrastTextColor(),
              },
              '& .MuiInputLabel-root': {
                color: getContrastTextColor(),
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
              },
            }}
            value={programa.orgao || ""}
            displayEmpty
            onClick={(event) => event.stopPropagation()}
            onChange={async (event) => {
              event.stopPropagation();
              const newValue = event.target.value;
              const { error } = await supabaseBrowserClient
                .from("programa")
                .update({ orgao: newValue })
                .eq("id", programa.id);
              
              if (!error) {
                const updatedProgramas = state.programas.map((p: any) => 
                  p.id === programa.id ? { ...p, orgao: newValue } : p
                );
                dispatch({ type: "SET_PROGRAMAS", payload: updatedProgramas });
                setToastMessage("Órgão atualizado com sucesso");
                setToastSeverity("success");
              } else {
                setToastMessage("Erro ao atualizar órgão");
                setToastSeverity("error");
              }
            }}
          >
            <MenuItem value="">
              <em>Nenhum</em>
            </MenuItem>
            {orgaos.map((orgao) => (
              <MenuItem key={orgao.id} value={orgao.id}>
                {orgao.nome} {orgao.sigla ? `(${orgao.sigla})` : ''}
              </MenuItem>
            ))}
          </Select>
        )}
      </Box>
    </Box>
  );
};

export default ProgramSummaryContent;
