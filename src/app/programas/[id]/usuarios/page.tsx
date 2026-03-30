'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { UserManagement } from '../../../../components/user-management/UserManagement';
import { useUserPermissions, useDemoPermissions } from '../../../../hooks/useUserPermissions';
import { useProgramaIdFromParam } from '../../../../hooks/useProgramaIdFromParam';
import { shouldUseDemoData } from '../../../../lib/services/demoDataService';
import * as dataService from '../../../../lib/services/dataService';
import { ProgramaLastActivityLine } from '@/components/common/ProgramaLastActivityLine';

export default function UsuariosPage() {
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

  // Verificar se o usuário tem permissão para visualizar usuários
  useEffect(() => {
    if (!permissions.isLoading && !permissions.canViewResource('users')) {
      setError('Você não tem permissão para acessar o gerenciamento de usuários deste programa');
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

  const programaName = programa.nome || programa.nome_fantasia || programa.razao_social || `Programa #${programaId}`;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 3 }}>
        <ProgramaLastActivityLine programaId={programaId} programaPathSegment={idOrSlug} />
      </Box>

      {/* Modo Demo Alert */}
      {isDemoMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Modo Demonstração:</strong> Este é um ambiente de demonstração. 
            As operações de gerenciamento de usuários são simuladas e não persistem.
          </Typography>
        </Alert>
      )}

      {/* Componente de Gerenciamento de Usuários */}
      <UserManagement 
        programaId={programaId}
        programaName={programaName}
      />
    </Container>
  );
}