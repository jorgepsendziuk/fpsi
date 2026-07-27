'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  Alert,
  Skeleton,
  Snackbar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Policy as PolicyIcon,
  Publish as PublishIcon,
} from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import SectionDisplay from './components/SectionDisplay';
import PDFDownloadButton from './components/PDFDownloadButton';
import {
  fetchProgramaById,
  fetchPoliticaProgramaByTipo,
  fetchPoliticaModeloSecoes,
  upsertPoliticaPrograma,
  publicarPoliticaPrograma,
  fetchPoliticaProgramaVersoes,
  type PoliticaSecao,
  type PoliticaProgramaVersaoRow,
} from '../../../../../lib/services/dataService';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useProgramaIdFromParam } from '../../../../../hooks/useProgramaIdFromParam';
import { ProgramaLastActivityLine } from '@/components/common/ProgramaLastActivityLine';
import {
  applyPoliticaPlaceholders,
  applyPoliticaPlaceholdersToSections,
} from '../../../../../lib/utils/politicaPlaceholders';
import { getPoliticaCatalogMeta } from '@/lib/politicas/politicasCatalog';
import { PoliticaTipoIcon } from '@/lib/politicas/PoliticaTipoIcon';
import { useUserPermissions } from '@/hooks/useUserPermissions';

type Section = PoliticaSecao;

function buildGenericSections(nomePolitica: string): Section[] {
  return [
    {
      id: 0,
      secao: nomePolitica || 'Política de Segurança',
      titulo: 'Introdução',
      descricao: 'IMPORTANTE: Este modelo deve ser utilizado exclusivamente como referência, devendo o órgão ou entidade considerar as particularidades técnicas específicas do seu ambiente.',
      texto: ''
    },
    {
      id: 1,
      secao: 'Propósito',
      titulo: 'Objetivo da Política',
      descricao: 'Descreva os objetivos básicos da política e o que ela pretende alcançar.',
      texto: `<p>Esta ${nomePolitica} tem por objetivo estabelecer diretrizes, princípios e procedimentos a serem seguidos por todas as pessoas que se relacionam com [Órgão ou Entidade].</p>`
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
}

export default function PoliticaPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);
  const politicaId = params.politicaId as string;
  const { canEditResource, canApproveResource, isLoading: permsLoading, permissions } =
    useUserPermissions(programaId ?? undefined);

  // Se permissões ainda não vieram, mantém edição (RLS do Supabase continua valendo).
  const canEdit = permsLoading ? true : permissions ? canEditResource('politicas') : true;
  const canPublish = permsLoading ? false : canApproveResource('politicas');

  const catalogMeta = getPoliticaCatalogMeta(politicaId);
  const politicaNome = catalogMeta?.nome ?? 'Política';
  const politicaDescricao = catalogMeta?.descricao ?? '';
  const politicaCor = catalogMeta?.cor ?? '#2196F3';
  const politicaIconKey = catalogMeta?.iconKey;

  const [sections, setSections] = useState<Section[]>([]);
  const [programa, setPrograma] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingModel, setLoadingModel] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [inicioVigencia, setInicioVigencia] = useState('');
  const [prazoRevisao, setPrazoRevisao] = useState('');
  const [status, setStatus] = useState<'rascunho' | 'publicado'>('rascunho');
  const [publicadoEm, setPublicadoEm] = useState<string | null>(null);
  const [versoes, setVersoes] = useState<PoliticaProgramaVersaoRow[]>([]);
  const [versaoDialogOpen, setVersaoDialogOpen] = useState(false);
  const [versaoNota, setVersaoNota] = useState('');

  useEffect(() => {
    if (programaId == null || !politicaId) return;
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setLoadingModel(true);
        setError(null);

        const mapRaw = (raw: unknown[], programaData: Record<string, unknown> | null) =>
          applyPoliticaPlaceholdersToSections(
            raw.map((section) => {
              const s = section as Record<string, unknown>;
              return {
                id: Number(s.id),
                secao: String(s.secao ?? ''),
                titulo: String(s.titulo ?? ''),
                descricao: String(s.descricao ?? ''),
                texto: s.texto != null ? String(s.texto) : '',
              };
            }),
            programaData
          );

        const programaData = await fetchProgramaById(programaId);
        if (cancelled) return;
        setPrograma(programaData);

        const [saved, vers] = await Promise.all([
          fetchPoliticaProgramaByTipo(programaId, politicaId),
          fetchPoliticaProgramaVersoes(programaId, politicaId),
        ]);
        if (cancelled) return;

        setVersoes(vers);
        if (saved) {
          setInicioVigencia(saved.inicio_vigencia ? String(saved.inicio_vigencia).slice(0, 10) : '');
          setPrazoRevisao(saved.prazo_revisao ? String(saved.prazo_revisao).slice(0, 10) : '');
          setStatus(saved.status === 'publicado' ? 'publicado' : 'rascunho');
          setPublicadoEm(saved.publicado_em);
        } else {
          setInicioVigencia('');
          setPrazoRevisao('');
          setStatus('rascunho');
          setPublicadoEm(null);
        }

        const raw = saved?.secoes;
        if (Array.isArray(raw) && raw.length > 0) {
          setSections(mapRaw(raw, programaData));
          return;
        }

        const fromDb = await fetchPoliticaModeloSecoes(politicaId);
        if (cancelled) return;
        if (fromDb && fromDb.length > 0) {
          setSections(applyPoliticaPlaceholdersToSections(fromDb, programaData));
          return;
        }

        const response = await fetch(`/models/${politicaId}.json`);
        if (cancelled) return;
        if (response.ok) {
          const modelo = await response.json();
          setSections(mapRaw(modelo.secoes || [], programaData));
          return;
        }

        setSections(
          applyPoliticaPlaceholdersToSections(buildGenericSections(politicaNome), programaData)
        );
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        if (!cancelled) {
          setError('Erro ao carregar dados da política');
          setSections(buildGenericSections(politicaNome));
        }
      } finally {
        if (!cancelled) {
          setLoadingModel(false);
          setLoading(false);
        }
      }
    };

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [programaId, politicaId, politicaNome]);

  const metaVigencia = () => ({
    inicio_vigencia: inicioVigencia.trim() || null,
    prazo_revisao: prazoRevisao.trim() || null,
  });

  const handleSalvarPrograma = async () => {
    if (programaId == null || !canEdit) return;
    try {
      setSaving(true);
      await upsertPoliticaPrograma(programaId, politicaId, sections, metaVigencia());
      setSnackbar('Política salva neste programa (rascunho).');
    } catch (e) {
      console.error(e);
      setSnackbar(
        e instanceof Error ? `Erro ao salvar: ${e.message}` : 'Erro ao salvar política.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublicar = async () => {
    if (programaId == null || !canPublish) return;
    try {
      setPublishing(true);
      const versao = await publicarPoliticaPrograma(
        programaId,
        politicaId,
        sections,
        metaVigencia(),
        versaoNota
      );
      setStatus('publicado');
      setPublicadoEm(versao.created_at);
      setVersoes((prev) => [versao, ...prev]);
      setVersaoDialogOpen(false);
      setVersaoNota('');
      setSnackbar(`Versão ${versao.numero} publicada.`);
    } catch (e) {
      console.error(e);
      setSnackbar(
        e instanceof Error ? `Erro ao publicar: ${e.message}` : 'Erro ao publicar política.'
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleSectionTextChange = (id: number, text: string) => {
    if (!canEdit) return;
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id === id) {
          const updatedText = programa
            ? applyPoliticaPlaceholders(text, programa)
            : text;
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

  if (!politicaId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Política não informada.
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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 2 }}>
      <Container maxWidth="lg" sx={{ px: 2 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleVoltar} sx={{ minWidth: "auto" }}>
                Voltar
              </Button>
              <Chip
                size="small"
                label={status === 'publicado' ? 'Publicado' : 'Rascunho'}
                color={status === 'publicado' ? 'success' : 'default'}
              />
              {publicadoEm ? (
                <Typography variant="caption" color="text.secondary">
                  Última publicação: {new Date(publicadoEm).toLocaleString('pt-BR')}
                </Typography>
              ) : null}
            </Box>

            <PageHeroHeader
              title="Editor de documentos"
              icon={<PolicyIcon sx={{ fontSize: 30 }} aria-hidden />}
              description={
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Box sx={{ color: "text.primary", display: "flex", alignItems: "center" }}>
                      {politicaIconKey ? <PoliticaTipoIcon iconKey={politicaIconKey} /> : <PolicyIcon />}
                    </Box>
                    <Typography variant="subtitle2" component="p" sx={{ fontWeight: 600, color: "text.primary", m: 0 }}>
                      {politicaNome}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {politicaDescricao} • Programa: <strong>{programa?.nome || programa?.nome_fantasia}</strong>
                  </Typography>
                  <ProgramaLastActivityLine programaId={programaId} programaPathSegment={idOrSlug} sx={{ mt: 1.5 }} />
                </>
              }
              trailing={
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={saving || loadingModel || publishing || !canEdit || permsLoading}
                    onClick={handleSalvarPrograma}
                  >
                    {saving ? "Salvando…" : "Salvar no programa"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<PublishIcon />}
                    disabled={publishing || loadingModel || saving || !canPublish || permsLoading}
                    onClick={() => setVersaoDialogOpen(true)}
                  >
                    Publicar versão
                  </Button>
                  <PDFDownloadButton
                    sections={sections}
                    nomeFantasia={programa?.nome || programa?.nome_fantasia || ""}
                    politicaNome={politicaNome}
                    programa={programa}
                  />
                </Stack>
              }
            />

            {!canEdit && !permsLoading ? (
              <Alert severity="info">Você não tem permissão para editar políticas neste programa.</Alert>
            ) : null}
            {canEdit && !canPublish && !permsLoading ? (
              <Alert severity="info">
                Você pode salvar rascunhos. Publicar versão requer permissão <strong>can_publish_politicas</strong>.
              </Alert>
            ) : null}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ maxWidth: 420 }}>
              <DatePicker
                label="Início da vigência"
                value={inicioVigencia ? dayjs(inicioVigencia) : null}
                onChange={(d) => setInicioVigencia(d ? d.format("YYYY-MM-DD") : "")}
                format="DD/MM/YYYY"
                disabled={!canEdit}
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
              <DatePicker
                label="Prazo de revisão"
                value={prazoRevisao ? dayjs(prazoRevisao) : null}
                onChange={(d) => setPrazoRevisao(d ? d.format("YYYY-MM-DD") : "")}
                format="DD/MM/YYYY"
                disabled={!canEdit}
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
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
                  politicaCor={politicaCor}
                  readOnly={!canEdit}
                />
              ))}
            </Box>
          )}
        </Paper>

        {versoes.length > 0 ? (
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Histórico de versões
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nº</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Nota</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versoes.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.numero}</TableCell>
                    <TableCell>{new Date(v.created_at).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{v.nota || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : null}

        <Dialog open={versaoDialogOpen} onClose={() => !publishing && setVersaoDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Publicar versão</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Congela o conteúdo atual em uma versão imutável e marca o documento como publicado (visível no portal
              interno, se for documento de portal e não houver URL externa).
            </Typography>
            <TextField
              label="Nota da versão (opcional)"
              value={versaoNota}
              onChange={(e) => setVersaoNota(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              disabled={publishing}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVersaoDialogOpen(false)} disabled={publishing}>
              Cancelar
            </Button>
            <Button variant="contained" color="success" onClick={handlePublicar} disabled={publishing}>
              {publishing ? 'Publicando…' : 'Confirmar publicação'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={Boolean(snackbar)}
          autoHideDuration={6000}
          onClose={() => setSnackbar(null)}
          message={snackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>
    </Box>
    </LocalizationProvider>
  );
}
