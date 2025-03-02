"use client";
import React, { useReducer, useEffect, useState } from "react";
import {
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Alert,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { supabaseBrowserClient } from "@utils/supabase/client";
import { initialState, reducer } from "./state";
import Diagnostico from "./diagnostico";
import Programa from "./programa";
import Responsavel from "./responsavel";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';
import dayjs from "dayjs";
import { setor } from "./utils";
import InputMask from 'input-mask-react';
import { IMaskInput } from 'react-imask';
import ShieldIcon from '@mui/icons-material/Shield';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Margin } from "@mui/icons-material";
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Add this import

const sanitizeCNPJ = (value: string) => {
  return value.replace(/\D/g, '').slice(0, 14);
};

const formatCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
};

interface CNPJMaskCustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const CNPJMask = React.forwardRef<HTMLInputElement, CNPJMaskCustomProps>(
  function CNPJMask(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="00.000.000/0000-00"
        definitions={{
          '#': /[1-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) => 
          onChange({ target: { name: props.name, value: value.toString() } })
        }
        overwrite
      />
    );
  },
);

const DiagnosticoPage = () => {
  const theme = useTheme(); // Get the current theme
  const isMobile = useMediaQuery('(max-width:600px)');
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [expanded, setExpanded] = useState<string | false>(false);
  const [orgaos, setOrgaos] = useState<any[]>([]);
  const [editedValues, setEditedValues] = useState<{[key: number]: {cnpj?: string, razao_social?: string}}>({});

  // Define a function to get appropriate text color based on theme mode
  const getContrastTextColor = () => {
    return theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
  };
  
  // Modify the getBackgroundContrastColor function to always return white for shield text
  const getBackgroundContrastColor = (bgColor: string) => {
    // For shield icon, always return white
    return '#FFFFFF'; // White text on primary color background always
  };

  const getEntityInitial = (program: any) => {
    if (program.setor === 2 && program.razao_social) {
      // For private sector, use company name
      return program.razao_social.charAt(0).toUpperCase();
    } else if (program.setor !== 2 && program.orgao) {
      // For public sector with selected organization
      const matchingOrg = orgaos.find(org => org.id === program.orgao);
      if (matchingOrg?.nome) {
        return matchingOrg.nome.charAt(0).toUpperCase();
      }
    }
    // Default fallback to program ID
    return program.id.toString();
  };

  const fetchOrgaos = async () => {
    const { data } = await supabaseBrowserClient
      .from("orgao")
      .select("*")
      .order("nome", { ascending: true });
    setOrgaos(data || []);
  };

  const fetchResponsaveis = async (programaId: number) => {
    const { data } = await supabaseBrowserClient
      .from("responsavel")
      .select("*")
      .eq("programa", programaId)
      .order("nome", { ascending: true });
    return data || [];
  };

  useEffect(() => {
    const fetchProgramas = async () => {
      const { data } = await supabaseBrowserClient
        .from("programa")
        .select("*")
        .order("id", { ascending: true });
      dispatch({ type: "SET_PROGRAMAS", payload: data });
    };

    const fetchDiagnosticos = async () => {
      const { data } = await supabaseBrowserClient
        .from("diagnostico")
        .select("*") 
        .order("id", { ascending: true });
      dispatch({ type: "SET_DIAGNOSTICOS", payload: data });
    };

    fetchProgramas();
    fetchDiagnosticos();
    fetchOrgaos();
  }, []);
  
  const fetchControlesAndMedidas = async (programaId: number) => {
    const diagnosticos = await supabaseBrowserClient
      .from("diagnostico")
      .select("id")
      .order("id", { ascending: true });
    for (const diagnostico of diagnosticos.data || []) {
      const controles = await supabaseBrowserClient
        .from("controle")
        .select("id,programa")
        .eq("diagnostico", diagnostico.id)
        .eq("programa", programaId)
        .order("numero", { ascending: true });
      for (const controle of controles.data || []) {
        await handleMedidaFetch(controle.id);
      }
      await handleControleFetch(diagnostico.id, programaId);
    }
  };

  const handleControleFetch = async (diagnosticoId: number, programaId: number): Promise<void> => {
    const { data } = await supabaseBrowserClient
      .from("controle")
      .select("*")
      .eq("diagnostico", diagnosticoId)
      .eq("programa", programaId)
      .order("id", { ascending: true });
    dispatch({ type: "SET_CONTROLES", diagnosticoId, payload: data });
  };

  const handleMedidaFetch = async (controleId: number): Promise<void> => {
    const { data } = await supabaseBrowserClient
      .from("medida")
      .select("*")
      .eq("id_controle", controleId)
      .order("id_medida", { ascending: true });
    dispatch({ type: "SET_MEDIDAS", controleId, payload: data });
  };

  const handleINCCChange = async (controleId: number, diagnosticoId: number, newValue: number): Promise<void> => {
    await supabaseBrowserClient
      .from("controle")
      .update({ nivel: newValue })
      .eq("id", controleId);
    dispatch({
      type: "UPDATE_CONTROLE",
      diagnosticoId,
      controleId,
      field: "nivel",
      value: newValue,
    });
    setToastMessage("Resposta atualizada");
    setToastSeverity("success");
  };

  const handleMedidaChange = async (medidaId: number, controleId: number, field: string, value: any) => {
    const updatePayload = { [field]: value };
    const { error } = await supabaseBrowserClient
      .from("medida")
      .update(updatePayload)
      .eq("id", medidaId);

    if (!error) {
      dispatch({
        type: "UPDATE_MEDIDA",
        medidaId,
        controleId,
        field,
        value,
      });
      setToastMessage("Resposta atualizada");
      setToastSeverity("success");
    } else {
      setToastMessage(`Erro ao atualizar: ${error.message}`);
      setToastSeverity("error");
    }
  };

  const handleProgramaFetch = async (programaId: number) => {
    const responsaveis = await fetchResponsaveis(programaId);
    dispatch({ type: "SET_RESPONSAVEIS", payload: responsaveis });

    if (expanded !== programaId.toString()) {
      const { data: diagnosticos } = await supabaseBrowserClient
        .from("diagnostico")
        .select("*")
        //.eq("programa", programaId)
        .order("id", { ascending: true });
      dispatch({ type: "SET_DIAGNOSTICOS", payload: diagnosticos });
    }

    setExpanded(expanded === programaId.toString() ? false : programaId.toString());
  };

  const handleCreatePrograma = async () => {
    const { data, error } = await supabaseBrowserClient
      .from("programa")
      .insert({})
      .select()
      .single();

    if (!error && data) {
      dispatch({ type: "SET_PROGRAMAS", payload: [...state.programas, data] });
      setToastMessage("Programa criado com sucesso");
      setToastSeverity("success");
    } else {
      setToastMessage("Erro ao criar programa");
      setToastSeverity("error");
    }
  };

  const handleDeletePrograma = async (programaId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este programa?')) {
      const { error } = await supabaseBrowserClient
        .from("programa")
        .delete()
        .eq("id", programaId);

      if (!error) {
        const updatedProgramas = state.programas.filter(p => p.id !== programaId);
        dispatch({ type: "SET_PROGRAMAS", payload: updatedProgramas });
        setToastMessage("Programa excluído com sucesso");
        setToastSeverity("success");
        setExpanded(false);
      } else {
        setToastMessage("Erro ao excluir programa");
        setToastSeverity("error");
      }
    }
  };

  const handleSaveCompanyDetails = async (programaId: number) => {
    if (!editedValues[programaId]) return;
    
    const { error } = await supabaseBrowserClient
      .from("programa")
      .update({
        cnpj: editedValues[programaId].cnpj,
        razao_social: editedValues[programaId].razao_social
      })
      .eq("id", programaId);
      
    if (!error) {
      // Update the programas array with the new values after successful save
      const updatedProgramas = state.programas.map(p => 
        p.id === programaId ? { ...p, ...editedValues[programaId] } : p
      );
      dispatch({ type: "SET_PROGRAMAS", payload: updatedProgramas });
      
      // Clear edited values for this program
      setEditedValues(prev => {
        const newValues = {...prev};
        delete newValues[programaId];
        return newValues;
      });
      
      setToastMessage("Dados da empresa salvos com sucesso");
      setToastSeverity("success");
    } else {
      setToastMessage("Erro ao salvar dados da empresa");
      setToastSeverity("error");
    }
  };

  return (
    <div>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: getContrastTextColor(), // Use dynamic color
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Programas de Privacidade e Proteção de Dados
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreatePrograma}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Novo Programa
        </Button>
      </Box>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        {state.programas.map((programa: any) => (
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
              // Update background color based on theme mode
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.9)' : 'background.paper',
              '& .MuiAccordionSummary-root': {
                borderRadius: 2,
                // Add dark grey background for summary in dark mode
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.9)' : 'grey.100',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(80, 80, 80, 0.9)' : 'action.hover',
                },
                padding: { xs: 1, sm: 2 },
              },
              boxShadow: 3,
              border: 'none',
              '&.Mui-expanded': {
                margin: '0 0 16px 0',
                boxShadow: 6,
                // Add dark grey background for expanded accordion in dark mode
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.9)' : 'background.paper',
                '& .MuiAccordionSummary-root': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(80, 80, 80, 0.9)' : 'grey.100',
                  borderBottom: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(120, 120, 120, 0.3)' : 'grey.300',
                },
              },
              // Allow content inside accordion details to use dynamic color
              '& .MuiAccordionDetails-root .MuiTypography-root': {
                color: getContrastTextColor(),
              },
              // Add styles for the accordion details background in dark mode
              '& .MuiAccordionDetails-root': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.9)' : 'background.paper',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              width: '100%' }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  flexGrow: 1,
                  minHeight: { xs: 80, sm: 64 },
                  backgroundColor: 'grey.100',
                  '& .MuiAccordionSummary-content': {
                    margin: { xs: '8px 0', sm: '12px 0' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'flex-start'
                  },
                  '&.Mui-expanded': {
                    backgroundColor: 'grey.100',
                  },
                  '&:hover': {
                    filter: 'brightness(0.95)',
                  },
                  width: '100%'
                }}
              >
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
                        {getEntityInitial(programa)}
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
                            const updatedProgramas = state.programas.map(p => 
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
                          const updatedProgramas = state.programas.map(p => 
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
                              // Instead of updating the program directly, store the edited value
                              const sanitizedValue = sanitizeCNPJ(event.target.value);
                              setEditedValues(prev => ({
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
                              // Instead of updating the program directly, store the edited value
                              const newValue = event.target.value;
                              setEditedValues(prev => ({
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
                            const updatedProgramas = state.programas.map(p => 
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
              <Box sx={{ mt: 2 }}>
                <Accordion 
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    '&:before': {
                      display: 'none',
                    },
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.9)' : 'background.paper',
                    '& .MuiAccordionSummary-root': {
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.9)' : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(80, 80, 80, 0.9)' : 'action.hover',
                      },
                    },
                    boxShadow: 2,
                    border: 'none',
                    '&.Mui-expanded': {
                      margin: '0 0 16px 0',
                      boxShadow: 4,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.9)' : 'background.paper',
                      '& .MuiAccordionSummary-root': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(80, 80, 80, 0.9)' : 'grey.100',
                        borderBottom: '1px solid',
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(120, 120, 120, 0.3)' : 'grey.300',
                      },
                    },
                    '& .MuiTypography-root': {
                      color: getContrastTextColor(),
                    },
                    // Add styles for the accordion details in dark mode
                    '& .MuiAccordionDetails-root': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.9)' : 'background.paper',
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
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <GroupIcon fontSize="medium" color="primary" sx={{ ml: 1 }} />
                        <Typography variant="h5" style={{ fontWeight: "400" }}>Responsáveis</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: getContrastTextColor(), mr: 2 }}>
                        {state.responsaveis?.length || 0} cadastrado{state.responsaveis?.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Responsavel programa={programa.id} />
                  </AccordionDetails>
                </Accordion>
              </Box>
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
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  },
                  boxShadow: 2,
                  border: 'none',
                  '&.Mui-expanded': {
                    margin: '0 0 16px 0',
                    boxShadow: 4,
                    backgroundColor: 'background.paper',
                    '& .MuiAccordionSummary-root': {
                      backgroundColor: 'grey.100',
                      borderBottom: '1px solid',
                      borderColor: 'grey.300',
                    },
                  },
                  '& .MuiTypography-root': {
                    color: getContrastTextColor(), // Dynamic text color
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
                    // Force text to be black
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
                      responsaveis={state.responsaveis}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            </AccordionDetails>
          </Accordion>
        ))}
      </LocalizationProvider>
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={6000}
        onClose={() => setToastMessage(null)}
      >
        <Alert onClose={() => setToastMessage(null)} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DiagnosticoPage;
