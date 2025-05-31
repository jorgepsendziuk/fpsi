'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useState, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Flag para controlar inicialização do TinyMCE
let tinymceInitialized = false;

const initializeTinyMCE = async () => {
  if (typeof window !== 'undefined' && !tinymceInitialized) {
    try {
      // Import TinyMCE core usando dynamic import com type assertion
      await import('tinymce/tinymce');
      
      // Import componentes essenciais
      await Promise.all([
        import('tinymce/icons/default/icons.min.js' as any),
        import('tinymce/themes/silver/theme.min.js' as any),
        import('tinymce/models/dom/model.min.js' as any),
      ]);
      
      // Import skins
      await Promise.all([
        import('tinymce/skins/ui/oxide/skin.js' as any),
        import('tinymce/skins/ui/oxide/content.js' as any),
        import('tinymce/skins/content/default/content.js' as any),
      ]);
      
      // Import plugins em paralelo
      await Promise.all([
        import('tinymce/plugins/advlist' as any),
        import('tinymce/plugins/autolink' as any),
        import('tinymce/plugins/lists' as any),
        import('tinymce/plugins/link' as any),
        import('tinymce/plugins/charmap' as any),
        import('tinymce/plugins/preview' as any),
        import('tinymce/plugins/searchreplace' as any),
        import('tinymce/plugins/visualblocks' as any),
        import('tinymce/plugins/code' as any),
        import('tinymce/plugins/fullscreen' as any),
        import('tinymce/plugins/insertdatetime' as any),
        import('tinymce/plugins/table' as any),
        import('tinymce/plugins/wordcount' as any),
      ]);
      
      tinymceInitialized = true;
    } catch (error) {
      console.error('Erro ao carregar TinyMCE:', error);
      throw error;
    }
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
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const setupEditor = async () => {
      try {
        await initializeTinyMCE();
        setIsMounted(true);
        setIsEditorReady(true);
      } catch (error) {
        setLoadError('Erro ao carregar o editor');
        console.error('Erro na inicialização do TinyMCE:', error);
      }
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
        
        {loadError ? (
          <Box 
            sx={{ 
              height: 300, 
              border: '1px solid', 
              borderColor: 'error.main', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'error.light',
              color: 'error.contrastText'
            }}
          >
            <Typography>{loadError}</Typography>
          </Box>
        ) : isMounted && isEditorReady ? (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Editor
              licenseKey="gpl" // GPL license for self-hosted (camelCase for React wrapper)
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