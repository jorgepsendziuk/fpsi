"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Typography, Card, CardContent, Grid, Box, Breadcrumbs, Link, Chip, Stack, Divider, Paper, CardActionArea, TextField, IconButton } from "@mui/material";
import { Business, Group, Policy, CheckCircleOutline, ArrowBack, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import * as dataService from "@/app/diagnostico/services/dataService";

const sections = [
  {
    key: "responsabilidades",
    title: "Responsabilidades",
    icon: <Group fontSize="large" color="secondary" />,
    description: "Gestão dos responsáveis pelo programa.",
    path: "responsabilidades"
  },
  {
    key: "politicas",
    title: "Políticas de Segurança",
    icon: <Policy fontSize="large" color="info" />,
    description: "Visualize e edite as políticas de segurança do programa.",
    path: "politicas"
  },
  {
    key: "diagnostico",
    title: "Diagnóstico",
    icon: <CheckCircleOutline fontSize="large" color="success" />,
    description: "Acesse o diagnóstico e maturidade do programa.",
    path: "diagnostico"
  }
];

const editableFields = [
  { key: "razao_social", label: "Razão Social" },
  { key: "nome_fantasia", label: "Nome Fantasia" },
  { key: "cnpj", label: "CNPJ" },
  { key: "atendimento_fone", label: "Telefone" },
  { key: "atendimento_email", label: "Email" },
  { key: "atendimento_site", label: "Site" },
  { key: "politica_inicio_vigencia", label: "Início Vigência" },
  { key: "politica_prazo_revisao", label: "Prazo Revisão" }
];

export default function ProgramaMainPage() {
  const router = useRouter();
  const params = useParams();
  const programaId = params.id;
  const [programa, setPrograma] = useState<any>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrograma = async () => {
      setLoading(true);
      const data = await dataService.fetchProgramaById(Number(programaId));
      setPrograma(data);
      setLoading(false);
    };
    fetchPrograma();
  }, [programaId]);

  const handleEdit = (field: string, value: string) => {
    setEditField(field);
    setEditValue(value);
  };

  const handleCancel = () => {
    setEditField(null);
    setEditValue("");
  };

  const handleSave = async (field: string) => {
    setLoading(true);
    await dataService.updateProgramaField(Number(programaId), field, editValue);
    setPrograma((prev: any) => ({ ...prev, [field]: editValue }));
    setEditField(null);
    setEditValue("");
    setLoading(false);
  };

  if (!programa) {
    return <Container maxWidth="md" sx={{ py: 6 }}><Typography>Carregando...</Typography></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Breadcrumb e título */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link href="/programas" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <ArrowBack sx={{ mr: 0.5 }} fontSize="small" />
            Programas
          </Link>
          <Typography color="text.primary">{programa.nome_fantasia || `Programa #${programaId}`}</Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight="bold" align="left">
          {programa.nome_fantasia || programa.razao_social || `Programa #${programaId}`}
        </Typography>
      </Box>

      {/* Card de dados do programa */}
      <Paper elevation={3} sx={{ mb: 5, p: 3, borderRadius: 3 }}>
        <Grid container spacing={2}>
          {editableFields.map(field => (
            <Grid item xs={12} sm={6} key={field.key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}><strong>{field.label}:</strong></Typography>
                {editField === field.key ? (
                  <>
                    <TextField
                      size="small"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      sx={{ flex: 1 }}
                      disabled={loading}
                    />
                    <IconButton color="success" onClick={() => handleSave(field.key)} disabled={loading}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton color="error" onClick={handleCancel} disabled={loading}>
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {programa[field.key] || <span style={{ color: '#bbb' }}>Não informado</span>}
                    </Typography>
                    <IconButton color="primary" onClick={() => handleEdit(field.key, programa[field.key] || "") }>
                      <EditIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Grid de cards para as outras seções */}
      <Grid container spacing={3}>
        {sections.map(section => (
          <Grid item xs={12} sm={6} md={4} key={section.key}>
            <Card 
              sx={{ 
                height: '100%', 
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardActionArea 
                onClick={() => router.push(`/programas/${programaId}/${section.path}`)}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  py: 4,
                  px: 3,
                  height: '100%',
                  minHeight: 200,
                  justifyContent: 'center'
                }}>
                  <Box sx={{ mb: 2 }}>
                    {section.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" mb={1} align="center">
                    {section.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    align="center" 
                    sx={{ 
                      flexGrow: 1,
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}
                  >
                    {section.description}
                  </Typography>
                  <Typography 
                    variant="button" 
                    color="primary" 
                    sx={{ 
                      mt: 2,
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                  >
                    Acessar →
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 