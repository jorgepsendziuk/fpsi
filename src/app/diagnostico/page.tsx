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
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [expanded, setExpanded] = useState<string | false>(false);
  const [orgaos, setOrgaos] = useState<any[]>([]);

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

  return (
    <div>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary'
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
              '& .MuiAccordionSummary-root': {
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              },
              boxShadow: 3,
              border: 'none',
              '&.Mui-expanded': {
                margin: '0 0 16px 0',
                boxShadow: 6,
                backgroundColor: 'background.paper',
                '& .MuiAccordionSummary-root': {
                  backgroundColor: 'grey.100',
                  borderBottom: '1px solid',
                  borderColor: 'grey.300',
                },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  flexGrow: 1,
                  minHeight: 64,
                  backgroundColor: 'grey.100',
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                  },
                  '&.Mui-expanded': {
                    backgroundColor: 'grey.100',
                  },
                  '&:hover': {
                    filter: 'brightness(0.95)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'center' }}>
                  <Box sx={{ width: '30%', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ShieldIcon fontSize="large" color="primary" sx={{ ml: 1, mr: 1 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Programa:
                      </Typography>
                      <Typography variant="h3" style={{ fontWeight: "400" }}>
                        nº {programa.id.toString().padStart(2, '0')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ width: '20%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Setor:
                    </Typography>
                    <Select
                      id={`setor-${programa.id}`}
                      name="setor"
                      fullWidth
                      size="medium"
                      sx={{
                        height: 56,
                        '& .MuiSelect-select': {
                          fontSize: '1.2rem',
                          paddingTop: 2,
                          paddingBottom: 2,
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
                          // Update local state
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
                  <Box sx={{ width: '45%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      {programa.setor === 2 ? 'Empresa:' : 'Órgão:'}
                    </Typography>
                    {programa.setor === 2 ? (
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 4 }}>
                          <TextField
                            id={`cnpj-${programa.id}`}
                            name="cnpj"
                            fullWidth
                            size="medium"
                            label="CNPJ"
                            value={String(programa.cnpj || '')}
                            InputProps={{
                              inputComponent: CNPJMask as any,
                            }}
                            sx={{
                              height: 56,
                              '& .MuiInputBase-input': {
                                fontSize: '1.2rem',
                                paddingTop: 2,
                                paddingBottom: 2,
                              },
                            }}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => {
                              const sanitizedValue = sanitizeCNPJ(event.target.value);
                              const updatedProgramas = state.programas.map(p => 
                                p.id === programa.id ? { ...p, cnpj: sanitizedValue } : p
                              );
                              dispatch({ type: "SET_PROGRAMAS", payload: updatedProgramas });
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 8 }}>
                          <TextField
                            id={`razao_social-${programa.id}`}
                            name="razao_social"
                            fullWidth
                            size="medium"
                            label="Razão Social"
                            value={programa.razao_social || ""}
                            sx={{
                              height: 56,
                              '& .MuiInputBase-input': {
                                fontSize: '1.2rem',
                                paddingTop: 2,
                                paddingBottom: 2,
                              },
                            }}
                            onClick={(event) => event.stopPropagation()}
                            onChange={async (event) => {
                              event.stopPropagation();
                              const newValue = event.target.value;
                              const { error } = await supabaseBrowserClient
                                .from("programa")
                                .update({ razao_social: newValue })
                                .eq("id", programa.id);
                              
                              if (!error) {
                                const updatedProgramas = state.programas.map(p => 
                                  p.id === programa.id ? { ...p, razao_social: newValue } : p
                                );
                                dispatch({ type: "SET_PROGRAMAS", payload: updatedProgramas });
                                setToastMessage("Razão Social atualizada com sucesso");
                                setToastSeverity("success");
                              } else {
                                setToastMessage("Erro ao atualizar Razão Social");
                                setToastSeverity("error");
                              }
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
                          '& .MuiSelect-select': {
                            fontSize: '1.2rem',
                            paddingTop: 2,
                            paddingBottom: 2,
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
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeletePrograma(programa.id);
                }}
                color="error"
                sx={{
                  mr: 2,
                  '&:hover': {
                    backgroundColor: 'error.light',
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <AccordionDetails sx={{ bottom: 10 }}>
              <Programa key={programa.id} programaId={programa.id} /> 
              <Box sx={{ mt: 2 }}>
                <Accordion 
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
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
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
                  '& .MuiAccordion-root': {
                    boxShadow: 'none',
                    border: '1px solid #ccc',
                    borderRadius: 0,
                    '&:before': {
                      display: 'block',
                    },
                    '& .MuiAccordionSummary-root': {
                      backgroundColor: 'transparent',
                      color: 'text.primary',
                      borderRadius: 0,
                      transition: 'none',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      '& .MuiTypography-root': {
                        color: 'text.primary',
                        fontWeight: 400,
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'text.secondary',
                      },
                    },
                    '&.Mui-expanded': {
                      margin: '8px 0',
                      boxShadow: 'none',
                      '& .MuiAccordionSummary-root': {
                        backgroundColor: 'transparent',
                        borderBottom: 'none',
                      },
                    },
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
