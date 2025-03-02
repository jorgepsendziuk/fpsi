import React from "react";
import { Typography, Box, Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useThemeColors } from "../hooks/useThemeColors";

interface ProgramHeaderProps {
  handleCreatePrograma: () => void;
}

const ProgramHeader = ({ handleCreatePrograma }: ProgramHeaderProps) => {
  const { getContrastTextColor } = useThemeColors();
  
  return (
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
          color: getContrastTextColor(),
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
  );
};

export default ProgramHeader;
