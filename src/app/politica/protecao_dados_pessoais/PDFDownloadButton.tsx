'use client';

import { Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useState } from 'react';

interface PDFDownloadButtonProps {
  sections: Array<{
    id: number;
    secao: string;
    descricao: string;
    texto?: string;
  }>;
  nomeFantasia: string;
}

export default function PDFDownloadButton({ sections, nomeFantasia }: PDFDownloadButtonProps) {
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
        body: JSON.stringify({ sections: sectionsWithNome }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(error instanceof Error ? error.message : 'Erro ao gerar o PDF. Por favor, tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PrintIcon />}
        onClick={generatePDF}
        disabled={isGenerating}
      >
        {isGenerating ? 'Gerando PDF...' : 'IMPRIMIR'}
      </Button>
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 