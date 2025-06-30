'use client';

import { useState, useEffect } from 'react';
import SectionDisplay from './SectionDisplay';
import modelo from './modelo.json';
import { Container, Paper, Typography, Box } from '@mui/material';
import PDFDownloadButton from './PDFDownloadButton';
import { useSearchParams } from 'next/navigation';
import { fetchProgramaById } from '../../../lib/services/dataService';

interface Section {
  titulo: string;
  id: number;
  secao: string;
  descricao: string;
  texto?: string;
}

export default function ProtecaoDadosPessoais() {
  const [sections, setSections] = useState<Section[]>(
    modelo.secoes.map(section => ({
      id: section.id,
      secao: section.secao,
      titulo: section.titulo,
      descricao: section.descricao ?? '',
      texto: section.texto ?? ''
    }))
  );
  const [programa, setPrograma] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadPrograma = async () => {
      const programaId = searchParams.get('programaId');
      if (programaId) {
        const data = await fetchProgramaById(Number(programaId));
        setPrograma(data);
        if (data && data.nome_fantasia) {
          setSections(prevSections =>
            prevSections.map(section => ({
              id: section.id,
              secao: section.secao,
              titulo: section.titulo,
              descricao: section.descricao,
              texto: section.texto
                ? section.texto.replace(/\[Órgão ou Entidade\]/g, data.nome_fantasia)
                : section.texto
            }))
          );
        }
      }
    };
    loadPrograma();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSectionTextChange = (id: number, text: string) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === id ? { ...section, texto: text } : section
      )
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 2 }}>
      <Container maxWidth="lg" sx={{ px: 2 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                pb: 1.5, 
                borderBottom: '2px solid',
                borderColor: 'divider',
                fontSize: '1.8rem'
              }}
            >
              Editor de Políticas
            </Typography>
            <PDFDownloadButton sections={sections} nomeFantasia={programa?.nome_fantasia || ''} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sections.map(section => (
              <SectionDisplay
                key={section.id}
                section={{
                  ...section,
                  titulo: section.titulo
                }}
                onTextChange={handleSectionTextChange}
                nomeFantasia={programa?.nome_fantasia || ''}
              />
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 