'use client';

import { Button, Box, Typography } from '@mui/material';
import { GetApp as GetAppIcon } from '@mui/icons-material';
import { useState } from 'react';

interface PDFDownloadButtonProps {
  sections: Array<{
    id: number;
    secao: string;
    titulo: string;
    descricao: string;
    texto?: string;
  }>;
  nomeFantasia: string;
  politicaNome: string;
}

export default function PDFDownloadButton({ sections, nomeFantasia, politicaNome }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const sectionsWithNome = sections.map(section => ({
        ...section,
        texto: section.texto
          ? section.texto.replace(/\[Órgão ou Entidade\]/g, nomeFantasia)
          : section.texto
      }));

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sections: sectionsWithNome,
          politicaNome,
          nomeFantasia
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Criar link de download com nome específico
      const link = document.createElement('a');
      link.href = url;
      link.download = `${politicaNome} - ${nomeFantasia}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL temporária
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(error instanceof Error ? error.message : 'Erro ao gerar o PDF. Por favor, tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<GetAppIcon />}
        onClick={generatePDF}
        disabled={isGenerating}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          py: 1.5,
          borderRadius: 2,
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4,
          }
        }}
      >
        {isGenerating ? 'Gerando PDF...' : 'Exportar PDF'}
      </Button>
      {error && (
        <Typography 
          variant="body2" 
          color="error" 
          sx={{ mt: 1, fontSize: '0.875rem' }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}