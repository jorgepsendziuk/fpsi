'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { UserManagement } from '../../../../components/user-management/UserManagement';
import { useUserPermissions, useDemoPermissions } from '../../../../hooks/useUserPermissions';
import { shouldUseDemoData } from '../../../../lib/services/demoDataService';
import * as dataService from '../../../../lib/services/dataService';

export default function UsuariosPage() {
  const router = useRouter();
  const params = useParams();
  const programaId = Number(params.id);
  const [programa, setPrograma] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usar permissões demo ou reais dependendo do contexto
  const isDemoMode = shouldUseDemoData(programaId);
  const realPermissions = useUserPermissions(programaId);
  const demoPermissions = useDemoPermissions();
  const permissions = isDemoMode ? demoPermissions : realPermissions;

  useEffect(() => {
    const fetchPrograma = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await dataService.fetchProgramaById(programaId);
        if (!data) {
          throw new Error('Programa não encontrado');
        }
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

  if (loading || permissions.isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || permissions.error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs sx={{ mb: 1 }}>
            <Link 
              href="/programas" 
              underline="hover" 
              color="inherit" 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ArrowBack sx={{ mr: 0.5 }} fontSize="small" />
              Programas
            </Link>
            <Link 
              href={`/programas/${programaId}`} 
              underline="hover" 
              color="inherit"
            >
              {programa?.nome_fantasia || `Programa #${programaId}`}
            </Link>
            <Typography color="text.primary">Usuários</Typography>
          </Breadcrumbs>
        </Box>

        <Alert severity="error" sx={{ mt: 3 }}>
          {error || permissions.error}
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

  const programaName = programa.nome_fantasia || programa.razao_social || `Programa #${programaId}`;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link 
            href="/programas" 
            underline="hover" 
            color="inherit" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <ArrowBack sx={{ mr: 0.5 }} fontSize="small" />
            Programas
          </Link>
          <Link 
            href={`/programas/${programaId}`} 
            underline="hover" 
            color="inherit"
          >
            {programaName}
          </Link>
          <Typography color="text.primary">Usuários</Typography>
        </Breadcrumbs>
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