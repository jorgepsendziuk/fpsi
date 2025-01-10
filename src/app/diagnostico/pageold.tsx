"use client";
import React, { useState, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Table, TableBody, TableCell, TableRow, Autocomplete } from '@mui/material';
import { supabaseBrowserClient } from "@utils/supabase/client";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const MyComponent = () => {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [controles, setControles] = useState({});
  const [medidas, setMedidas] = useState({});
  const [respostas] = useState([
    { id: 1, label: 'Resposta 1', peso: 10 },
    { id: 2, label: 'Resposta 2', peso: 20 },
    { id: 3, label: 'Resposta 3', peso: 30 },
  ]);
  const [totalPesos, setTotalPesos] = useState({});

  useEffect(() => {
    fetchDiagnosticos();
  }, []);

  const fetchDiagnosticos = async () => {
    const { data, error } = await supabaseBrowserClient.from('diagnostico').select('*');
    if (error) console.error(error);
    else setDiagnosticos(data);
  };

  const fetchControles = async (diagnosticoId) => {
    const { data, error } = await supabaseBrowserClient
      .from('controle')
      .select('*')
      .eq('diagnostico', diagnosticoId);
    if (error) console.error(error);
    else setControles((prev) => ({ ...prev, [diagnosticoId]: data }));
  };

  const fetchMedidas = async (controleId) => {
    const { data, error } = await supabaseBrowserClient
      .from('medida')
      .select('*')
      .eq('id_controle', controleId);
    if (error) console.error(error);
    else setMedidas((prev) => ({ ...prev, [controleId]: data }));
  };

  const updateResposta = async (medidaId, newValue) => {
    const { error } = await supabaseBrowserClient
      .from('medida')
      .update({ resposta: newValue.id })
      .eq('id', medidaId);
    if (error) console.error(error);
  };

  const updateJustificativa = async (medidaId, newValue) => {
    const { error } = await supabaseBrowserClient
      .from('medida')
      .update({ justificativa: newValue })
      .eq('id', medidaId);
    if (error) console.error(error);
  };

  const handleRespostaChange = (controleId, medidaId, newValue) => {
    updateResposta(medidaId, newValue);
    setMedidas((prev) => ({
      ...prev,
      [controleId]: prev[controleId].map((medida) =>
        medida.id === medidaId ? { ...medida, resposta: newValue.id } : medida
      ),
    }));
    setTotalPesos((prev) => ({
      ...prev,
      [controleId]: prev[controleId] + newValue.peso,
    }));
  };

  const handleJustificativaChange = (controleId, medidaId, event) => {
    const newValue = event.target.value;
    updateJustificativa(medidaId, newValue);
    setMedidas((prev) => ({
      ...prev,
      [controleId]: prev[controleId].map((medida) =>
        medida.id === medidaId ? { ...medida, justificativa: newValue } : medida
      ),
    }));
  };

  return (
    <div>
      {diagnosticos.map((diagnostico) => (
        <Accordion key={diagnostico.id} onChange={() => fetchControles(diagnostico.id)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{diagnostico.nome}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {controles[diagnostico.id] && controles[diagnostico.id].map((controle) => (
              <Accordion key={controle.id} onChange={() => fetchMedidas(controle.id)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{controle.nome} (Total Peso: {totalPesos[controle.id] || 0})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {medidas[controle.id] && (
                    <Table>
                      <TableBody>
                        {medidas[controle.id].map((medida) => (
                          <TableRow key={medida.id}>
                            <TableCell>
                              <Autocomplete
                                options={respostas}
                                getOptionLabel={(option) => option.label}
                                value={respostas.find((r) => r.id === medida.resposta) || null}
                                onChange={(_, newValue) => handleRespostaChange(controle.id, medida.id, newValue)}
                                renderInput={(params) => <TextField {...params} label="Resposta" />}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                label="Justificativa"
                                value={medida.justificativa || ''}
                                onChange={(event) => handleJustificativaChange(controle.id, medida.id, event)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default MyComponent;