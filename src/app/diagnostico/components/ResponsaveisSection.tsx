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
import Responsavel from "../responsavel";
import { useThemeColors } from "../hooks/useThemeColors";

interface ResponsaveisSectionProps {
  programa: number;
  responsaveis: any[];
}

const ResponsaveisSection = ({ programa, responsaveis }: ResponsaveisSectionProps) => {
  const { 
    getContrastTextColor, 
    getAccordionBackgroundColor,
    getAccordionHoverBackgroundColor,
    getAccordionSummaryBackgroundColor,
    getAccordionBorderColor
  } = useThemeColors();

  return (
    <Accordion 
      sx={{
        mb: 2,
        borderRadius: 2,
        '&:before': {
          display: 'none',
        },
        backgroundColor: getAccordionBackgroundColor(),
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
        '& .MuiAccordionDetails-root': {
          backgroundColor: getAccordionBackgroundColor(),
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
            {responsaveis?.length || 0} cadastrado{responsaveis?.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Responsavel programa={programa} />
      </AccordionDetails>
    </Accordion>
  );
};

export default ResponsaveisSection;
