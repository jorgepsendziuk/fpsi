import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { calculateMaturityIndexForControle, incc } from "./utils";
import Medida, { MedidaType } from "./medida";

const Controle = ({
  controle,
  diagnostico,
  state,
  handleINCCChange,
  handleMedidaFetch,
  handleMedidaChange,
  responsaveis,
}: any) => (
  <Accordion
    style={{ border: "1px solid grey" }}
    slotProps={{ transition: { unmountOnExit: true } }}
    onChange={() => handleMedidaFetch(controle.id)}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Grid container spacing={2}>
        <Grid size={{ md: 4 }} alignItems="center">
          <Typography variant="caption" style={{ fontWeight: "800", padding: "" }}>
            CONTROLE
          </Typography>
          <Typography style={{ fontWeight: "600", padding: "10px" }}>
            ID {controle.numero} - {controle.nome}
          </Typography>
        </Grid>
        <Grid size={{ md: 6 }}>
          <Typography variant="caption" style={{ fontWeight: "800", padding: "" }}>
            NCC - NÍVEIS DE CAPACIDADE DO CONTROLE
          </Typography>
          <Select
            value={controle.nivel || ""}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              handleINCCChange(controle.id, diagnostico.id, parseInt(event.target.value.toString(), 10))
            }
          >
            {incc.map((incc) => (
              <MenuItem key={incc.id} value={incc.id}>
                <Typography sx={{ whiteSpace: "normal" }}>
                  <b>{incc.nivel}</b> - {incc.label}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid size={{ md: 2 }} alignItems="center" style={{ textAlign: "center" }}>
          <Typography variant="caption" align="center" style={{ fontWeight: "800", padding: "" }}>
            ÍNDICE DE MATURIDADE DO CONTROLE
          </Typography>
          <Typography variant="h6" align="center" style={{ fontWeight: "800", padding: "" }}>
            {calculateMaturityIndexForControle(controle, state)}
          </Typography>
        </Grid>
      </Grid>
    </AccordionSummary>
    <AccordionDetails>
    {state.medidas[controle.id]?.map((medida: MedidaType) => (
      <Medida
        key={medida.id}
        medida={medida}
        controle={controle}
        handleMedidaChange={handleMedidaChange}
        responsaveis={responsaveis}
      />
    ))}
    </AccordionDetails>
  </Accordion>
);

export default Controle;
