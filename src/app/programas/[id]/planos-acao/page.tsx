'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';

const PlanoAcaoResumo = dynamic(
  () => import('../../../../components/planos-acao/PlanoAcaoResumo'),
  { ssr: false, loading: () => <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box> }
);
import { useUserPermissions, useDemoPermissions } from '../../../../hooks/useUserPermissions';
import { useProgramaIdFromParam } from '../../../../hooks/useProgramaIdFromParam';
import { shouldUseDemoData } from '../../../../lib/services/demoDataService';
import * as dataService from '../../../../lib/services/dataService';
import { getProgramaTituloOrganizacao, getProgramaTituloPrincipal } from '../../../../lib/utils/programaDisplay';
import { ProgramaLastActivityLine } from '@/components/common/ProgramaLastActivityLine';
import { PageHeroHeader } from '@/components/common/PageHeroHeader';

export default function PlanosAcaoPage() {
  const params = useParams();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading, error: idError } = useProgramaIdFromParam(idOrSlug);
  const [programa, setPrograma] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDemoMode = shouldUseDemoData(programaId ?? 0);
  const realPermissions = useUserPermissions(programaId ?? undefined);
  const demoPermissions = useDemoPermissions();
  const permissions = isDemoMode ? demoPermissions : realPermissions;

  useEffect(() => {
    if (programaId == null) return;
    const fetchPrograma = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dataService.fetchProgramaById(programaId);
        if (!data) throw new Error('Programa não encontrado');
        setPrograma(data);
      } catch (err) {
        console.error('Erro ao carregar programa:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    fetchPrograma();
  }, [programaId]);

  // Verificar se o usuário tem permissão para visualizar planos
  useEffect(() => {
    if (!permissions.isLoading && !permissions.canViewResource('planos')) {
      setError('Você não tem permissão para acessar o plano de trabalho deste programa');
    }
  }, [permissions.isLoading, permissions.canViewResource, permissions]);

  if (idLoading || loading || permissions.isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!programaId) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="warning">Programa não encontrado.</Alert>
      </Container>
    );
  }

  if (error || idError || permissions.error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error || idError || permissions.error}
        </Alert>
      </Container>
    );
  }

  if (!programa) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="warning">
          Programa não encontrado.
        </Alert>
      </Container>
    );
  }

  const programaName = getProgramaTituloPrincipal(programa);
  const programaOrganizacao = getProgramaTituloOrganizacao(programa);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <PageHeroHeader
        title="Plano de trabalho"
        icon={<AssignmentIcon sx={{ fontSize: 30 }} aria-hidden />}
        description={
          <>
            <Typography variant="body1" component="span" sx={{ fontWeight: 600, color: "text.primary", display: "block" }}>
              {programaName}
            </Typography>
            {programaOrganizacao ? (
              <Typography variant="body2" component="span" display="block" sx={{ mt: 0.25 }}>
                {programaOrganizacao}
              </Typography>
            ) : null}
            <Typography variant="body2" component="span" display="block" sx={{ mt: programaOrganizacao ? 0.5 : 0.25 }}>
              Acompanhamento resumido das medidas por diagnóstico e controle
            </Typography>
            <ProgramaLastActivityLine programaId={programaId} programaPathSegment={idOrSlug} sx={{ mt: 1.5 }} />
          </>
        }
      />

      {/* Modo Demo Alert */}
      {isDemoMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Modo Demonstração:</strong> Este é um ambiente de demonstração. 
            O plano de trabalho exibido é fictício e as operações são simuladas.
          </Typography>
        </Alert>
      )}

      {/* Plano de Trabalho Resumido */}
      <PlanoAcaoResumo 
        programaId={programaId}
        programaName={programaName}
        programaOrganizacao={programaOrganizacao}
      />
    </Container>
  );
}