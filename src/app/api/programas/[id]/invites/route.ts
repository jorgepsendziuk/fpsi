import { NextRequest, NextResponse } from 'next/server';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { shouldUseDemoData } from '@/lib/services/demoDataService';
import { UserRole, getDefaultPermissions, InviteStatus } from '@/lib/types/user';
import { randomBytes } from 'crypto';

// GET /api/programas/[id]/invites - Listar convites do programa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const programaId = parseInt(params.id);

    // Verificar se é modo demo
    if (shouldUseDemoData(programaId)) {
      // Retornar convites demo vazios
      return NextResponse.json([]);
    }

    // Buscar convites no banco
    const { data, error } = await supabaseBrowserClient
      .from('programa_invites')
      .select('*')
      .eq('programa_id', programaId)
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar convites:', error);
      return NextResponse.json({ error: 'Erro ao buscar convites' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro na API de convites:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/programas/[id]/invites - Criar novo convite
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const programaId = parseInt(params.id);
    const body = await request.json();
    const { email, role, message } = body;

    // Validar dados
    if (!email || !role) {
      return NextResponse.json({ error: 'Email e função são obrigatórios' }, { status: 400 });
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: 'Função inválida' }, { status: 400 });
    }

    const permissions = getDefaultPermissions(role);

    // Verificar se é modo demo
    if (shouldUseDemoData(programaId)) {
      return NextResponse.json({
        message: 'Convite enviado com sucesso (modo demo)',
        data: {
          id: Date.now(),
          programa_id: programaId,
          email,
          role,
          permissions,
          status: InviteStatus.PENDING,
          invited_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
          token: 'demo-token-' + Date.now(),
          message
        }
      });
    }

    // Verificar se usuário já existe no programa
    const { data: existingUser } = await supabaseBrowserClient
      .from('programa_users')
      .select('id')
      .eq('programa_id', programaId)
      .eq('user_id', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já faz parte deste programa' }, { status: 400 });
    }

    // Verificar se já existe convite pendente
    const { data: existingInvite } = await supabaseBrowserClient
      .from('programa_invites')
      .select('id')
      .eq('programa_id', programaId)
      .eq('email', email)
      .eq('status', InviteStatus.PENDING)
      .single();

    if (existingInvite) {
      return NextResponse.json({ error: 'Já existe um convite pendente para este email' }, { status: 400 });
    }

    // Gerar token seguro
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    // Criar convite
    const { data, error } = await supabaseBrowserClient
      .from('programa_invites')
      .insert({
        programa_id: programaId,
        email,
        role,
        permissions,
        invited_by: 'current_user', // TODO: Pegar do contexto de auth
        invited_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        token,
        status: InviteStatus.PENDING,
        message
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar convite:', error);
      return NextResponse.json({ error: 'Erro ao criar convite' }, { status: 500 });
    }

    // TODO: Enviar email de convite aqui
    console.log(`Convite criado para ${email} como ${role}`);

    return NextResponse.json({ 
      message: 'Convite criado com sucesso', 
      data,
      invite_url: `${process.env.NEXTAUTH_URL}/accept-invite?token=${token}`
    });
  } catch (error) {
    console.error('Erro na API de criar convite:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}