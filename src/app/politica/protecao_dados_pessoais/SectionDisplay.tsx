'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useState, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Dynamic import para TinyMCE somente no lado do cliente
let tinymceInitialized = false;

const initializeTinyMCE = async () => {
  if (typeof window !== 'undefined' && !tinymceInitialized) {
    // Import TinyMCE core
    await import('tinymce/tinymce');
    
    // Import essentials
    await import('tinymce/icons/default/icons.min.js');
    await import('tinymce/themes/silver/theme.min.js');
    await import('tinymce/models/dom/model.min.js');
    
    // Import skins
    await import('tinymce/skins/ui/oxide/skin.js');
    await import('tinymce/skins/ui/oxide/content.js');
    await import('tinymce/skins/content/default/content.js');
    
    // Import plugins que são usados
    await import('tinymce/plugins/advlist');
    await import('tinymce/plugins/autolink');
    await import('tinymce/plugins/lists');
    await import('tinymce/plugins/link');
    await import('tinymce/plugins/charmap');
    await import('tinymce/plugins/preview');
    await import('tinymce/plugins/searchreplace');
    await import('tinymce/plugins/visualblocks');
    await import('tinymce/plugins/code');
    await import('tinymce/plugins/fullscreen');
    await import('tinymce/plugins/insertdatetime');
    await import('tinymce/plugins/table');
    await import('tinymce/plugins/wordcount');
    
    tinymceInitialized = true;
  }
};

interface Section {
  id: number;
  secao: string;
  titulo: string;
  descricao: string;
  texto?: string;
}

interface SectionDisplayProps {
  section: Section;
  onTextChange: (sectionId: number, text: string) => void;
  nomeFantasia: string;
}

export default function SectionDisplay({ section, onTextChange, nomeFantasia }: SectionDisplayProps) {
  const [content, setContent] = useState(section.texto || '');
  const [isMounted, setIsMounted] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    const setupEditor = async () => {
      await initializeTinyMCE();
      setIsMounted(true);
      setIsEditorReady(true);
    };
    
    setupEditor();
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
        {isMounted && isEditorReady ? (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Editor
              value={displayContent}
              init={{
                license_key: 'gpl', // Using GPL license for self-hosted
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