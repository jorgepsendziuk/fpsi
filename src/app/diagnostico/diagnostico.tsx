import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { calculateSumOfResponsesForDiagnostico, getMaturityLabel } from "./utils";
import Controle from "./controle";
 
const Diagnostico = ({
  diagnostico,
  programa,
  state,
  handleControleFetch,
  handleINCCChange,
  handleMedidaFetch,
  handleMedidaProgramaFetch,
  handleMedidaChange,
  handleProgramaControleFetch,
  responsaveis,
}: any) => (
  <Accordion
    slotProps={{ transition: { unmountOnExit: true } }}
    style={{ backgroundColor: diagnostico.cor, color: "black", width: "100%" }}
    onChange={() => handleControleFetch(diagnostico.id, programa.id)}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={0}>
          <Grid size={{ xs: 12, sm: 12, md: 8 }} style={{ textAlign: "left" }}>
            <Typography variant="h5" style={{ fontWeight: "200" }}>
              DIAGNÓSTICO DE
            </Typography>
            <Typography variant="h4" style={{ fontWeight: "800", padding: "0" }}>
              {diagnostico.descricao}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }} style={{ textAlign: "center" }}>
            <Typography style={{ fontWeight: "400" }}>MATURIDADE</Typography>
            <Typography variant="h5" style={{ fontWeight: "800" }}>
              {diagnostico.indice}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }} style={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              align="center"
              style={{ color: "red", fontWeight: "800", padding: "" }}
            >
              {calculateSumOfResponsesForDiagnostico(diagnostico.id, state)}
            </Typography>
            <Typography variant="h6" align="center" style={{ fontWeight: "800", padding: "" }}>
              {diagnostico.maturidade}
            </Typography>
            <Typography variant="h6" align="center" style={{ fontWeight: "800", padding: "" }}>
              {getMaturityLabel(Number(calculateSumOfResponsesForDiagnostico(diagnostico.id, state)))}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      {state.controles[diagnostico.id]
        ?.filter((controle: any) => controle.programa === programa.id)
        .map((controle: any) => (
          <Controle
            key={controle.id}
            controle={controle}
            diagnostico={diagnostico}
            state={state}
            programa={programa}
            handleINCCChange={handleINCCChange}
            handleMedidaFetch={handleMedidaFetch}
            handleMedidaProgramaFetch={handleMedidaProgramaFetch}
            handleMedidaChange={handleMedidaChange}
            handleProgramaControleFetch={handleProgramaControleFetch}
            responsaveis={responsaveis}
          />
        ))}
    </AccordionDetails>
  </Accordion>
);

export default Diagnostico;
