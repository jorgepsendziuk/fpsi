'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useState, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Section {
  id: number;
  secao: string;
  titulo: string;
  descricao: string;
  texto?: string;
}

interface SectionDisplayProps {
  section: Section;
  onTextChange: (id: number, text: string) => void;
  nomeFantasia: string;
}

export default function SectionDisplay({ section, onTextChange, nomeFantasia }: SectionDisplayProps) {
  const [content, setContent] = useState(section.texto || '');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayContent = content
    ? content.replace(/\[Órgão ou Entidade\]/g, nomeFantasia)
    : '';

  const handleEditorChange = (text: string) => {
    setContent(text);
    onTextChange(section.id, text);
  };

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          '& .MuiAccordionSummary-content': {
            flexDirection: 'column',
          },
        }}
      >
        <Typography variant="h4" component="h2" sx={{ mb: 1, fontSize: '1.6rem', fontWeight: 'bold' }}>
          {section.secao}
        </Typography>
        <Typography variant="h5" component="h3" sx={{ color: 'text.secondary', fontSize: '1.3rem' }}>
          {section.titulo}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {section.descricao}
          </Typography>
        </Box>
        {isMounted ? (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Editor
              apiKey="u5nzk0vkrbayrac05shc8v5mnoes0d8uw8ykym31wgiq4x7u"
              value={displayContent}
              init={{
                height: 300,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
                  'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'table', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                branding: false,
                promotion: false
              }}
              onEditorChange={handleEditorChange}
            />
          </Box>
        ) : (
          <Box 
            sx={{ 
              height: 300, 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.50'
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
} 