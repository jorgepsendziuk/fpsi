'use client';

import { Button, Box, Typography } from '@mui/material';
import { GetApp as GetAppIcon } from '@mui/icons-material';
import { useState } from 'react';
import {
  applyPoliticaPlaceholders,
  applyPoliticaPlaceholdersToSections,
  type PoliticaProgramaDados,
} from '@/lib/utils/politicaPlaceholders';

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
  /** Dados do programa para preencher [Órgão ou entidade], [CNPJ], etc. */
  programa?: PoliticaProgramaDados;
}

export default function PDFDownloadButton({
  sections,
  nomeFantasia,
  politicaNome,
  programa,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const sectionsForPdf = programa
        ? applyPoliticaPlaceholdersToSections(sections, programa, nomeFantasia || undefined)
        : sections.map((section) => ({
            ...section,
            texto: section.texto
              ? applyPoliticaPlaceholders(section.texto, { nome_fantasia: nomeFantasia, nome: nomeFantasia })
              : section.texto,
            descricao: section.descricao
              ? applyPoliticaPlaceholders(section.descricao, { nome_fantasia: nomeFantasia, nome: nomeFantasia })
              : section.descricao,
          }));

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: sectionsForPdf,
          politicaNome,
          nomeFantasia,
          programa: programa ?? undefined,
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