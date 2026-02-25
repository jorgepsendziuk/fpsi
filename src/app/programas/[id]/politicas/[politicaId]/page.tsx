'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Button,
  Stack,
  Alert,
  Skeleton,
  useTheme,
  alpha
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Policy as PolicyIcon,
  Assignment as AssignmentIcon
} from "@mui/icons-material";
import SectionDisplay from './components/SectionDisplay';
import PDFDownloadButton from './components/PDFDownloadButton';
import { fetchProgramaById } from '../../../../../lib/services/dataService';
import { useProgramaIdFromParam } from '../../../../../hooks/useProgramaIdFromParam';

interface Section {
  titulo: string;
  id: number;
  secao: string;
  descricao: string;
  texto?: string;
}

interface PoliticaConfig {
  id: string;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
  cor: string;
}

const POLITICAS_CONFIG: { [key: string]: PoliticaConfig } = {
  politica_protecao_dados_pessoais: {
    id: 'politica_protecao_dados_pessoais',
    nome: 'Política de Proteção de Dados Pessoais',
    descricao: 'Diretrizes para proteção de dados pessoais conforme LGPD',
    icon: <PolicyIcon />,
    cor: '#2196F3'
  },
  politica_backup: {
    id: 'politica_backup',
    nome: 'Política de Backup',
    descricao: 'Procedimentos para backup e recuperação de dados',
    icon: <AssignmentIcon />,
    cor: '#4CAF50'
  },
  politica_controle_acesso: {
    id: 'politica_controle_acesso',
    nome: 'Política de Controle de Acesso',
    descricao: 'Gestão de credenciais e privilégios de acesso',
    icon: <AssignmentIcon />,
    cor: '#FF9800'
  },
  politica_defesas_malware: {
    id: 'politica_defesas_malware',
    nome: 'Política de Defesas contra Malware',
    descricao: 'Proteção contra softwares maliciosos',
    icon: <AssignmentIcon />,
    cor: '#F44336'
  },
  politica_desenvolvimento_pessoas: {
    id: 'politica_desenvolvimento_pessoas',
    nome: 'Política de Desenvolvimento de Pessoas',
    descricao: 'Treinamento e conscientização em segurança',
    icon: <AssignmentIcon />,
    cor: '#9C27B0'
  },
  politica_gerenciamento_vulnerabilidades: {
    id: 'politica_gerenciamento_vulnerabilidades',
    nome: 'Política de Gerenciamento de Vulnerabilidades',
    descricao: 'Identificação e correção de vulnerabilidades',
    icon: <AssignmentIcon />,
    cor: '#E91E63'
  },
  politica_gestao_ativos: {
    id: 'politica_gestao_ativos',
    nome: 'Política de Gestão de Ativos',
    descricao: 'Inventário e gestão de ativos de TI',
    icon: <AssignmentIcon />,
    cor: '#607D8B'
  },
  politica_logs_auditoria: {
    id: 'politica_logs_auditoria',
    nome: 'Política de Logs e Auditoria',
    descricao: 'Registros de eventos e trilhas de auditoria',
    icon: <AssignmentIcon />,
    cor: '#795548'
  },
  politica_provedor_servicos: {
    id: 'politica_provedor_servicos',
    nome: 'Política de Provedor de Serviços',
    descricao: 'Gestão de fornecedores e prestadores de serviços',
    icon: <AssignmentIcon />,
    cor: '#00BCD4'
  },
  politica_seguranca_informacao: {
    id: 'politica_seguranca_informacao',
    nome: 'Política de Segurança da Informação',
    descricao: 'Diretrizes gerais de segurança da informação',
    icon: <AssignmentIcon />,
    cor: '#3F51B5'
  }
};

export default function PoliticaPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);
  const politicaId = params.politicaId as string;
  
  const [sections, setSections] = useState<Section[]>([]);
  const [programa, setPrograma] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingModel, setLoadingModel] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const politicaConfig = POLITICAS_CONFIG[politicaId];

  const loadPoliticaModel = useCallback(async () => {
    try {
      setLoadingModel(true);
      
      // Tentar carregar o JSON específico da política
      const response = await fetch(`/models/${politicaId}.json`);
      
      if (response.ok) {
        const modelo = await response.json();
        setSections(
          modelo.secoes.map((section: any) => ({
            id: section.id,
            secao: section.secao,
            titulo: section.titulo,
            descricao: section.descricao ?? '',
            texto: section.texto ?? ''
          }))
        );
      } else {
        // Se não existe o modelo específico, usar o modelo genérico
        setSections(generateGenericSections());
      }
    } catch (error) {
      console.error('Erro ao carregar modelo:', error);
      // Usar modelo genérico em caso de erro
      setSections(generateGenericSections());
    } finally {
      setLoadingModel(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [politicaId, politicaConfig]);

  useEffect(() => {
    if (programaId == null) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const programaData = await fetchProgramaById(programaId);
        setPrograma(programaData);
        await loadPoliticaModel();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados da política');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [programaId, politicaId, loadPoliticaModel]);

  const generateGenericSections = (): Section[] => {
    return [
      {
        id: 0,
        secao: politicaConfig?.nome || 'Política de Segurança',
        titulo: 'Introdução',
        descricao: 'IMPORTANTE: Este modelo deve ser utilizado exclusivamente como referência, devendo o órgão ou entidade considerar as particularidades técnicas específicas do seu ambiente.',
        texto: ''
      },
      {
        id: 1,
        secao: 'Propósito',
        titulo: 'Objetivo da Política',
        descricao: 'Descreva os objetivos básicos da política e o que ela pretende alcançar.',
        texto: `<p>Esta ${politicaConfig?.nome} tem por objetivo estabelecer diretrizes, princípios e procedimentos a serem seguidos por todas as pessoas que se relacionam com [Órgão ou Entidade].</p>`
      },
      {
        id: 2,
        secao: 'Escopo',
        titulo: 'Amplitude e alcance da Política',
        descricao: 'Defina a quem e a quais sistemas esta política se aplica.',
        texto: '<p>Esta política aplica-se a todos os colaboradores, prestadores de serviços e parceiros do <span style="background-color: yellow;">[Órgão ou entidade]</span>.</p>'
      },
      {
        id: 3,
        secao: 'Termos e definições',
        titulo: 'Glossário',
        descricao: 'Defina quaisquer termos-chave, siglas ou conceitos que serão utilizados na política.',
        texto: '<p>Insira aqui as definições de termos técnicos e conceitos utilizados nesta política.</p>'
      },
      {
        id: 4,
        secao: 'Declarações da política',
        titulo: 'Regras aplicáveis',
        descricao: 'Descreva as regras que compõem a política.',
        texto: '<p>Art. 1º. Fica instituída a presente política no âmbito do <span style="background-color: yellow;">[Órgão ou entidade]</span>.</p>'
      },
      {
        id: 5,
        secao: 'Disposições Finais',
        titulo: 'Disposições Finais',
        descricao: 'Diretrizes finais para revisão e melhoria contínua da política.',
        texto: '<p>Esta política será revisada periodicamente e entra em vigor na data de sua publicação.</p>'
      }
    ];
  };

  const handleSectionTextChange = (id: number, text: string) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id === id) {
          let updatedText = text;
          // Substituir placeholders se programa carregado
          const nomeEntidade = programa?.nome || programa?.nome_fantasia;
          if (nomeEntidade) {
            updatedText = text.replace(/\[Órgão ou Entidade\]/g, nomeEntidade);
          }
          return { ...section, texto: updatedText };
        }
        return section;
      })
    );
  };

  const handleVoltar = () => {
    router.push(`/programas/${idOrSlug}/politicas`);
  };

  if (idLoading || !programaId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  if (!politicaConfig) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Política não encontrada: {politicaId}
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 2 }}>
        <Container maxWidth="lg" sx={{ px: 2 }}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Stack spacing={3}>
              <Skeleton variant="rectangular" width="100%" height={80} />
              <Skeleton variant="rectangular" width="100%" height={200} />
              <Skeleton variant="rectangular" width="100%" height={200} />
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 2 }}>
      <Container maxWidth="lg" sx={{ px: 2 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          {/* Header com Breadcrumbs */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleVoltar}
                sx={{ minWidth: 'auto' }}
              >
                Voltar
              </Button>
              
              <Breadcrumbs separator="›">
                <Link
                  color="inherit"
                  href="/programas"
                  sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  Programas
                </Link>
                <Link
                  color="inherit"
                  href={`/programas/${idOrSlug}`}
                  sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  {programa?.nome || 'Programa'}
                </Link>
                <Link
                  color="inherit"
                  href={`/programas/${idOrSlug}/politicas`}
                  sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  Políticas
                </Link>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  {politicaConfig.icon}
                  <Box component="span" sx={{ ml: 0.5 }}>
                    {politicaConfig.nome}
                  </Box>
                </Typography>
              </Breadcrumbs>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: politicaConfig.cor,
                    mb: 1
                  }}
                >
                  Editor de Políticas
                </Typography>
                <Typography variant="h5" color="text.primary" sx={{ mb: 1 }}>
                  {politicaConfig.nome}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {politicaConfig.descricao} • Programa: <strong>{programa?.nome || programa?.nome_fantasia}</strong>
                </Typography>
              </Box>
              
              <PDFDownloadButton 
                sections={sections} 
                nomeFantasia={programa?.nome || programa?.nome_fantasia || ''} 
                politicaNome={politicaConfig.nome}
              />
            </Box>
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          {loadingModel ? (
            <Stack spacing={2}>
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" width="100%" height={150} />
              ))}
            </Stack>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sections.map(section => (
                <SectionDisplay
                  key={section.id}
                  section={section}
                  onTextChange={handleSectionTextChange}
                  nomeFantasia={programa?.nome || programa?.nome_fantasia || ''}
                  politicaCor={politicaConfig.cor}
                />
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}