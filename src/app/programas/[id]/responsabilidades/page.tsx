"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Snackbar, 
  Alert, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Breadcrumbs, 
  Link,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import * as dataService from "@/app/diagnostico/services/dataService";
import { 
  Add, 
  Edit, 
  Delete, 
  ArrowBack, 
  Person, 
  Email, 
  Business,
  Save,
  Cancel,
  PersonAdd
} from "@mui/icons-material";
import { supabaseBrowserClient } from "@/utils/supabase/client";

interface Responsavel {
  id: number;
  nome: string;
  email: string;
  departamento: string;
  programa: number;
}

interface EditingResponsavel {
  id?: number;
  nome: string;
  email: string;
  departamento: string;
}

export default function ProgramaResponsaveisCRUDPage() {
  const params = useParams();
  const programaId = Number(params.id);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string, severity: "success" | "error" } | null>(null);
  const [controleInterno, setControleInterno] = useState("");
  const [si, setSI] = useState("");
  const [privacidade, setPrivacidade] = useState("");
  const [ti, setTI] = useState("");
  
  // Estados para o modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingResponsavel, setEditingResponsavel] = useState<EditingResponsavel>({
    nome: "", email: "", departamento: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado para dados do programa
  const [programaData, setProgramaData] = useState<{ nome_fantasia?: string; razao_social?: string }>({});
  
  const isMounted = useRef(true);

  // Buscar responsáveis do programa
  const fetchResponsaveis = async () => {
    setLoading(true);
    const data = await dataService.fetchResponsaveis(programaId);
    if (!isMounted.current) return;
    setResponsaveis(data);
    setLoading(false);
  };

  // Buscar dados do programa para os campos principais
  const fetchProgramaCamposPrincipais = async () => {
    const programa = await dataService.fetchProgramaById(programaId);
    if (!isMounted.current) return;
    
    // Salvar dados do programa
    setProgramaData(programa);
    
    setControleInterno(programa.responsavel_controle_interno ? String(programa.responsavel_controle_interno) : "");
    setSI(programa.responsavel_si ? String(programa.responsavel_si) : "");
    setPrivacidade(programa.responsavel_privacidade ? String(programa.responsavel_privacidade) : "");
    setTI(programa.responsavel_ti ? String(programa.responsavel_ti) : "");
  };

  useEffect(() => {
    isMounted.current = true;
    fetchResponsaveis();
    fetchProgramaCamposPrincipais();
    return () => { isMounted.current = false; };
  }, [programaId]);

  // Salvar campo de responsável principal
  const handleSaveResponsavel = async (field: string, value: string) => {
    setLoading(true);
    await dataService.updateProgramaField(programaId, field, value);
    if (!isMounted.current) return;
    setSnackbar({ message: "Responsável atualizado!", severity: "success" });
    setLoading(false);
  };

  // Handlers dos combos
  const handleChangeCombo = (setter: any, field: string) => async (e: any) => {
    const value = e.target.value;
    setter(value);
    await handleSaveResponsavel(field, value);
  };

  // Handlers do modal
  const handleAddClick = () => {
    setEditingResponsavel({ nome: "", email: "", departamento: "" });
    setIsEditing(false);
    setEditModalOpen(true);
  };

  const handleEditClick = (responsavel: Responsavel) => {
    setEditingResponsavel({
      id: responsavel.id,
      nome: responsavel.nome,
      email: responsavel.email,
      departamento: responsavel.departamento
    });
    setIsEditing(true);
    setEditModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este responsável?")) return;
    
    setLoading(true);
    await supabaseBrowserClient.from("responsavel").delete().eq("id", id);
    if (!isMounted.current) return;
    await fetchResponsaveis();
    if (!isMounted.current) return;
    setSnackbar({ message: "Responsável removido!", severity: "success" });
    setLoading(false);
  };

  const handleSaveModal = async () => {
    if (!editingResponsavel.nome.trim() || !editingResponsavel.email.trim()) {
      setSnackbar({ message: "Nome e email são obrigatórios!", severity: "error" });
      return;
    }

    setLoading(true);
    
    if (isEditing && editingResponsavel.id) {
      // Atualizar
      await supabaseBrowserClient
        .from("responsavel")
        .update({
          nome: editingResponsavel.nome,
          email: editingResponsavel.email,
          departamento: editingResponsavel.departamento
        })
        .eq("id", editingResponsavel.id);
      setSnackbar({ message: "Responsável atualizado!", severity: "success" });
    } else {
      // Criar novo
      await supabaseBrowserClient
        .from("responsavel")
        .insert({
          programa: programaId,
          nome: editingResponsavel.nome,
          email: editingResponsavel.email,
          departamento: editingResponsavel.departamento
        });
      setSnackbar({ message: "Responsável criado!", severity: "success" });
    }
    
    if (!isMounted.current) return;
    await fetchResponsaveis();
    if (!isMounted.current) return;
    setEditModalOpen(false);
    setLoading(false);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingResponsavel({ nome: "", email: "", departamento: "" });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/programas" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <ArrowBack sx={{ mr: 0.5 }} fontSize="small" />
            Programas
          </Link>
          <Link 
            href={`/programas/${programaId}`}
            underline="hover" 
            color="inherit"
            sx={{ 
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block'
            }}
            title={programaData.nome_fantasia || programaData.razao_social}
          >
            {programaData.nome_fantasia || programaData.razao_social || 'Carregando...'}
          </Link>
          <Typography color="text.primary">Responsáveis</Typography>
        </Breadcrumbs>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Responsáveis pelo Programa
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie os responsáveis principais e a equipe do programa
        </Typography>
      </Box>

      {/* Responsáveis Principais */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          mb: 4,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Person sx={{ mr: 1 }} />
          Responsáveis Principais
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Responsável Controle Interno</InputLabel>
              <Select 
                value={controleInterno} 
                label="Responsável Controle Interno" 
                onChange={handleChangeCombo(setControleInterno, "responsavel_controle_interno")}
              >
                <MenuItem value="">Não definido</MenuItem>
                {responsaveis.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Responsável SI</InputLabel>
              <Select 
                value={si} 
                label="Responsável SI" 
                onChange={handleChangeCombo(setSI, "responsavel_si")}
              >
                <MenuItem value="">Não definido</MenuItem>
                {responsaveis.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Responsável Privacidade</InputLabel>
              <Select 
                value={privacidade} 
                label="Responsável Privacidade" 
                onChange={handleChangeCombo(setPrivacidade, "responsavel_privacidade")}
              >
                <MenuItem value="">Não definido</MenuItem>
                {responsaveis.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Responsável TI</InputLabel>
              <Select 
                value={ti} 
                label="Responsável TI" 
                onChange={handleChangeCombo(setTI, "responsavel_ti")}
              >
                <MenuItem value="">Não definido</MenuItem>
                {responsaveis.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de Responsáveis */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonAdd sx={{ mr: 1 }} />
            Equipe do Programa ({responsaveis.length})
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />} 
            onClick={handleAddClick}
            sx={{ 
              borderRadius: 2,
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Adicionar Responsável
          </Button>
        </Box>

        {responsaveis.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            color: 'text.secondary'
          }}>
            <PersonAdd sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Nenhum responsável cadastrado
            </Typography>
            <Typography variant="body2">
              Adicione responsáveis para começar a gerenciar a equipe
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {responsaveis.map((responsavel) => (
              <Grid item xs={12} sm={6} md={4} key={responsavel.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8]
                    },
                    border: `1px solid ${theme.palette.divider}`,
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.02)'
                      : '#fff'
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                      {responsavel.nome}
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {responsavel.email}
                        </Typography>
                      </Box>
                      {responsavel.departamento && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Business sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {responsavel.departamento}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditClick(responsavel)}
                      sx={{ borderRadius: 2 }}
                    >
                      Editar
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(responsavel.id)}
                      sx={{ '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' } }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Modal de Edição */}
      <Dialog 
        open={editModalOpen} 
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {isEditing ? 'Editar Responsável' : 'Novo Responsável'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              fullWidth
              value={editingResponsavel.nome}
              onChange={(e) => setEditingResponsavel({ ...editingResponsavel, nome: e.target.value })}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={editingResponsavel.email}
              onChange={(e) => setEditingResponsavel({ ...editingResponsavel, email: e.target.value })}
              required
            />
            <TextField
              label="Departamento"
              fullWidth
              value={editingResponsavel.departamento}
              onChange={(e) => setEditingResponsavel({ ...editingResponsavel, departamento: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleCloseModal}
            startIcon={<Cancel />}
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveModal}
            variant="contained"
            startIcon={<Save />}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(null)} 
          severity={snackbar?.severity || "success"} 
          sx={{ width: '100%' }}
        >
          {snackbar?.message || ""}
        </Alert>
      </Snackbar>
    </Container>
  );
} 