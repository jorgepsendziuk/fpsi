import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupIcon from '@mui/icons-material/Group';
import ResponsavelContainer from "./containers/ResponsavelContainer";
import { useThemeColors } from "../../app/diagnostico/hooks/useThemeColors";

interface ResponsaveisSectionProps {
  programa: number;
  responsaveis: any[];
}

const ResponsaveisSection = ({ programa, responsaveis }: ResponsaveisSectionProps) => {
  const { 
    getContrastTextColor,
    accordionStyles
  } = useThemeColors();

  return (
    <Accordion 
      sx={{
        ...accordionStyles,
        width: '100%',
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <GroupIcon fontSize="large" color="primary" sx={{ ml: 1 }} />
            <Typography variant="h5" style={{ fontWeight: "500" }}>Responsáveis</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: getContrastTextColor(), mr: 2 }}>
            {responsaveis?.length || 0} cadastrado{responsaveis?.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <ResponsavelContainer programa={programa} />
      </AccordionDetails>
    </Accordion>
  );
};

export default ResponsaveisSection;
