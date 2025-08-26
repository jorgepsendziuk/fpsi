'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Avatar,
  Tooltip,
  Stack,
  Grid,
  Divider,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as CoordinatorIcon,
  Assessment as AnalystIcon,
  Visibility as ConsultorIcon,
  Security as AuditorIcon
} from '@mui/icons-material';
import { 
  UserRole, 
  ProgramaUser, 
  UserInvite, 
  InviteStatus,
  getRoleDisplayName,
  getRoleDescription,
  getDefaultPermissions 
} from '../../lib/types/user';
import { useUserPermissions } from '../../hooks/useUserPermissions';

interface UserManagementProps {
  programaId: number;
  programaName: string;
}

interface InviteDialogData {
  email: string;
  role: UserRole;
  message: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ 
  programaId, 
  programaName 
}) => {
  const [users, setUsers] = useState<ProgramaUser[]>([]);
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProgramaUser | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [inviteData, setInviteData] = useState<InviteDialogData>({
    email: '',
    role: UserRole.ANALISTA,
    message: ''
  });

  const { user: currentUser, canViewResource, canEditResource, hasPermission } = useUserPermissions(programaId);

  useEffect(() => {
    if (canViewResource('users')) {
      loadUsersAndInvites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programaId, canViewResource]);

  const loadUsersAndInvites = async () => {
    try {
      setLoading(true);
      
      const usersResponse = await fetch(`/api/users?programaId=${programaId}`);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Convites ainda não implementados na nova API
      setInvites([]);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programaId,
          userId: inviteData.email,
          role: inviteData.role,
          action: 'add'
        }),
      });

      if (response.ok) {
        setInviteDialogOpen(false);
        setInviteData({ email: '', role: UserRole.ANALISTA, message: '' });
        await loadUsersAndInvites();
      } else {
        throw new Error('Erro ao adicionar usuário');
      }
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programaId,
          userId,
          role: newRole,
          action: 'update_role'
        }),
      });

      if (response.ok) {
        await loadUsersAndInvites();
      } else {
        throw new Error('Erro ao alterar função do usuário');
      }
    } catch (error) {
      console.error('Erro ao alterar função:', error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário do programa?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users?programaId=${programaId}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadUsersAndInvites();
      } else {
        throw new Error('Erro ao remover usuário');
      }
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
    }
  };

  const handleCancelInvite = async (inviteId: number) => {
    // Função temporariamente desabilitada - convites não implementados na nova API
    console.log('Cancelar convite:', inviteId);
  };

  const getRoleIcon = (role: UserRole) => {
    const iconProps = { fontSize: 'small' as const };
    
    switch (role) {
      case UserRole.ADMIN:
        return <AdminIcon {...iconProps} />;
      case UserRole.COORDENADOR:
        return <CoordinatorIcon {...iconProps} />;
      case UserRole.ANALISTA:
        return <AnalystIcon {...iconProps} />;
      case UserRole.CONSULTOR:
        return <ConsultorIcon {...iconProps} />;
      case UserRole.AUDITOR:
        return <AuditorIcon {...iconProps} />;
      default:
        return <AnalystIcon {...iconProps} />;
    }
  };

  const getRoleColor = (role: UserRole): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (role) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.COORDENADOR:
        return 'primary';
      case UserRole.ANALISTA:
        return 'success';
      case UserRole.CONSULTOR:
        return 'warning';
      case UserRole.AUDITOR:
        return 'secondary';
      default:
        return 'success';
    }
  };

  const getInviteStatusIcon = (status: InviteStatus) => {
    switch (status) {
      case InviteStatus.PENDING:
        return <AccessTimeIcon fontSize="small" />;
      case InviteStatus.ACCEPTED:
        return <CheckIcon fontSize="small" />;
      case InviteStatus.DECLINED:
        return <CloseIcon fontSize="small" />;
      case InviteStatus.EXPIRED:
        return <CloseIcon fontSize="small" />;
      default:
        return <AccessTimeIcon fontSize="small" />;
    }
  };

  const getInviteStatusColor = (status: InviteStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case InviteStatus.PENDING:
        return 'warning';
      case InviteStatus.ACCEPTED:
        return 'success';
      case InviteStatus.DECLINED:
        return 'error';
      case InviteStatus.EXPIRED:
        return 'error';
      default:
        return 'default';
    }
  };

  if (!canViewResource('users')) {
    return (
      <Alert severity="warning">
        Você não tem permissão para visualizar usuários deste programa.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Gerenciar Usuários
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {programaName}
              </Typography>
            </Box>
            {hasPermission('can_invite_users') && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setInviteDialogOpen(true)}
              >
                Convidar Usuário
              </Button>
            )}
          </Box>
        </Grid>

        {/* Usuários Ativos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Usuários Ativos ({users.length})
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuário</TableCell>
                      <TableCell>Função</TableCell>
                      <TableCell>Adicionado em</TableCell>
                      <TableCell>Status</TableCell>
                      {(hasPermission('can_change_roles') || hasPermission('can_remove_users')) && (
                        <TableCell width="60">Ações</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {user.user_id.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {user.user_id}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {user.user_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={getRoleDisplayName(user.role)}
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label="Ativo"
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        
                        {(hasPermission('can_change_roles') || hasPermission('can_remove_users')) && (
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setSelectedUser(user);
                                setMenuAnchor(e.currentTarget);
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Convites Pendentes */}
        {invites.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Convites Pendentes ({invites.filter(i => i.status === InviteStatus.PENDING).length})
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>Função</TableCell>
                        <TableCell>Enviado em</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell width="60">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invites.map((invite) => (
                        <TableRow key={invite.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <EmailIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {invite.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              icon={getRoleIcon(invite.role)}
                              label={getRoleDisplayName(invite.role)}
                              color={getRoleColor(invite.role)}
                              size="small"
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(invite.invited_at).toLocaleDateString('pt-BR')}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              icon={getInviteStatusIcon(invite.status)}
                              label={invite.status}
                              color={getInviteStatusColor(invite.status)}
                              size="small"
                            />
                          </TableCell>
                          
                          <TableCell>
                            {hasPermission('can_invite_users') && invite.status === InviteStatus.PENDING && (
                              <Tooltip title="Cancelar convite">
                                <IconButton
                                  size="small"
                                  onClick={() => handleCancelInvite(invite.id)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Menu de Ações do Usuário */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setSelectedUser(null);
        }}
      >
        {hasPermission('can_change_roles') && selectedUser && (
          <MenuItem
            onClick={() => {
              // Implementar dialog de alteração de função
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Alterar Função
          </MenuItem>
        )}
        
        {hasPermission('can_remove_users') && selectedUser && selectedUser.user_id !== currentUser?.id && (
          <MenuItem
            onClick={() => {
              if (selectedUser) {
                handleRemoveUser(selectedUser.user_id);
              }
              setMenuAnchor(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Remover Usuário
          </MenuItem>
        )}
      </Menu>

      {/* Dialog de Convite */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Convidar Usuário para {programaName}
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Email do usuário"
              type="email"
              fullWidth
              value={inviteData.email}
              onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
            />
            
            <FormControl fullWidth>
              <InputLabel>Função</InputLabel>
              <Select
                value={inviteData.role}
                label="Função"
                onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value as UserRole }))}
              >
                <MenuItem value={UserRole.ANALISTA}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getRoleIcon(UserRole.ANALISTA)}
                    {getRoleDisplayName(UserRole.ANALISTA)}
                  </Box>
                </MenuItem>
                <MenuItem value={UserRole.COORDENADOR}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getRoleIcon(UserRole.COORDENADOR)}
                    {getRoleDisplayName(UserRole.COORDENADOR)}
                  </Box>
                </MenuItem>
                <MenuItem value={UserRole.CONSULTOR}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getRoleIcon(UserRole.CONSULTOR)}
                    {getRoleDisplayName(UserRole.CONSULTOR)}
                  </Box>
                </MenuItem>
                <MenuItem value={UserRole.AUDITOR}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getRoleIcon(UserRole.AUDITOR)}
                    {getRoleDisplayName(UserRole.AUDITOR)}
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <Alert severity="info">
              <Typography variant="body2">
                {getRoleDescription(inviteData.role)}
              </Typography>
            </Alert>
            
            <TextField
              label="Mensagem (opcional)"
              multiline
              rows={3}
              fullWidth
              value={inviteData.message}
              onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Adicione uma mensagem personalizada ao convite..."
            />
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleInviteUser}
            variant="contained"
            disabled={!inviteData.email}
          >
            Enviar Convite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};