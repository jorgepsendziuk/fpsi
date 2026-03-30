import React from "react";
import { Typography, Box, Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

interface ProgramHeaderProps {
  handleCreatePrograma: () => void;
}

const ProgramHeader = ({ handleCreatePrograma }: ProgramHeaderProps) => {
  return (
    <Box sx={{ 
      mb: 3, 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, 
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', sm: 'center' },
      gap: { xs: 2, sm: 0 }
    }}>
      <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600, letterSpacing: "0.02em", color: "text.primary" }}>
        Programas de privacidade e segurança da informação
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
