import React, { useState, useEffect, useCallback } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  Chip,
  Select,
  ListItemText,
  MenuItem,
  InputLabel,
} from "@mui/material";
import Grid from '@mui/material/Grid2';

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { respostas, respostasimnao} from "./utils";
import SaveIcon from "@mui/icons-material/Save";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import type { Medida, ProgramaMedida, Controle, Responsavel } from "./types";

const Medida = ({ medida, controle, handleMedidaChange, responsaveis }: { medida: Medida, controle: Controle, handleMedidaChange: (medidaId: number, controleId: number, field: string, value: any) => void, responsaveis: Responsavel[] }) => {
  const [localValues, setLocalValues] = useState({
    justificativa: medida.justificativa || "",
    encaminhamento_interno: medida.encaminhamento_interno || "",
    observacao_orgao: medida.observacao_orgao || "",
    nova_resposta: medida.nova_resposta || ""
  });

  useEffect(() => {
    setLocalValues({
      justificativa: medida.justificativa || "",
      encaminhamento_interno: medida.encaminhamento_interno || "",
      observacao_orgao: medida.observacao_orgao || "",
      nova_resposta: medida.nova_resposta || ""
    });
  }, [medida]);

  const handleTextChange = (field: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveField = (field: string) => {
    handleMedidaChange(medida.id, controle.id, field, localValues[field]);
  };

  return (  
    <Accordion style={{ border: "1px solid #ccc" }} slotProps={{ transition: { unmountOnExit: true } }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-label={medida.id_medida}
          aria-controls={medida.id_medida}
          id={medida.id_medida}
        >
          <Grid container spacing={0}>
          <Grid size={{ md: 1, sm: 2, xs: 3 }}>
            <Typography sx={{ marginTop: 2 }} variant="h6" align="center">
              {medida.id_medida}
            </Typography>
          </Grid>
          <Grid size={{ md: 4, sm: 4, xs: 9 }}>
            <Typography sx={{ padding: 1 }}>{medida.medida}</Typography>
          </Grid>
          <Grid size={{ md: 5, sm: 4, xs: 6 }}>
            <Select
              sx={{ width: "90%" }}
              value={medida.resposta || ""}
              aria-label={medida.id_medida}
              onClick={(event) => event.stopPropagation()}
              onChange={(event, newValue) =>
                handleMedidaChange(medida.id, controle.id, "resposta", event.target.value)
              }
            >
              {(controle.diagnostico === 1 ? respostasimnao : respostas).map((respostas) => (
                <MenuItem key={respostas.id} value={respostas.id}>
                  <ListItemText primary={respostas.label} sx={{ whiteSpace: "normal" }} />
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid size={{ md: 2, sm: 2, xs: 6 }}>
            <Chip
              color="error"
              sx={{
                height: 40,
                marginTop: 2,
                opacity: 0.9,
                padding: 1,
                verticalAlign: "center",
                align: "center",
              }}
              label="ATRASADO"
            />
          </Grid>
          </Grid>
        </AccordionSummary>
      
      <AccordionDetails>
        <Typography align="justify" style={{ fontWeight: "60", paddingBottom: 20, paddingTop: 0 }}>
          <i>&quot;{medida.descricao}&quot;</i>
        </Typography>
      
        <Grid container spacing={3}>
          <Grid size={{ md: 6, sm: 12, xs: 12 }}>
            <TextField
              id={`justificativa-${medida.id}`}
              style={{ width: "100%" }}
              label="Justificativa / Observação"
              value={localValues.justificativa}
              multiline
              
              onChange={(event) => handleTextChange("justificativa", event.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <SaveIcon
                      style={{ cursor: "pointer", color: "grey" }}
                      onClick={() => handleSaveField("justificativa")}
                    />
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, sm: 12, xs: 12 }}>
            <TextField
              id={`encaminhamento_interno-${medida.id}`}
              style={{ width: "100%" }}
              value={localValues.encaminhamento_interno}
              multiline
              
              label="Encaminhamento interno (para uso do órgão)"
              onChange={(event) => handleTextChange("encaminhamento_interno", event.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <SaveIcon
                      style={{ cursor: "pointer", color: "grey" }}
                      onClick={() => handleSaveField("encaminhamento_interno")}
                    />
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, sm: 12, xs: 12 }}>
            <TextField
              id={`observacao_orgao-${medida.id}`}
              style={{ width: "100%" }}
              value={localValues.observacao_orgao}
              label="Observação do Órgão para SGD"
              multiline
              
              onChange={(event) => handleTextChange("observacao_orgao", event.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <SaveIcon
                      style={{ cursor: "pointer", color: "grey" }}
                      onClick={() => handleSaveField("observacao_orgao")}
                    />
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ md: 6, sm: 12, xs: 12 }}>
            <TextField
              id={`nova_resposta-${medida.id}`}
              style={{ width: "100%" }}
              value={localValues.nova_resposta}
              label="Nova resposta"
              multiline
              
              onChange={(event) => handleTextChange("nova_resposta", event.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <SaveIcon
                      style={{ cursor: "pointer", color: "grey" }}
                      onClick={() => handleSaveField("nova_resposta")}
                    />
                  ),
                },
              }}
            /> 
          </Grid>
          <Grid size={{ md: 6, sm: 12, xs: 12 }}>
            <InputLabel id={`responsavel-label-${medida.id}`}>Responsável</InputLabel>
            <Select
              labelId={`responsavel-label-${medida.id}`}
              id={`responsavel-${medida.id}`}
              size="small"
              style={{ width: "100%" }}
              value={medida.responsavel || ""}
              label="Responsável"
              onChange={(event) => {
                const value = event.target.value === "" ? null : event.target.value;
                handleMedidaChange(medida.id, controle.id, "responsavel", value);
              }}
            >
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
              {responsaveis
                .filter(resp => resp.programa === controle.programa)
                .map((responsavel) => (
                  <MenuItem key={responsavel.id} value={responsavel.id}>
                    {responsavel.nome} ({responsavel.departamento}) [{responsavel.email}]
                  </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid size={{ md: 3, sm: 6, xs: 12 }}>
            <DatePicker
              name={`previsao_inicio-${medida.id}`}
              label="Previsão de Inicio"
              value={medida.previsao_inicio ? dayjs(medida.previsao_inicio) : null}
              onChange={(newValue) =>
                handleMedidaChange(medida.id, controle.id, "previsao_inicio", newValue)
              }
              sx={{ width: "100%" }}
            />
          </Grid>
          <Grid size={{ md: 3, sm: 6, xs: 12 }}>
            <DatePicker
              name={`previsao_fim-${medida.id}`}
              label="Previsão de Fim"
              value={medida.previsao_fim ? dayjs(medida.previsao_fim) : null}
              onChange={(newValue) =>
                handleMedidaChange(medida.id, controle.id, "previsao_fim", newValue)
              }
              sx={{ width: "100%" }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

  export default Medida;
