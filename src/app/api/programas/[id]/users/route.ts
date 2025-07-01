import { NextRequest, NextResponse } from 'next/server';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { shouldUseDemoData } from '@/lib/services/demoDataService';
import { UserRole, getDefaultPermissions } from '@/lib/types/user';

// GET /api/programas/[id]/users - Listar usuários do programa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const programaId = parseInt(params.id);

    // Verificar se é modo demo
    if (shouldUseDemoData(programaId)) {
      // Retornar usuários demo
      return NextResponse.json([
        {
          id: 1,
          programa_id: programaId,
          user_id: 'demo@fpsi.com.br',
          role: UserRole.ADMIN,
          permissions: getDefaultPermissions(UserRole.ADMIN),
          status: 'accepted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    }

    // Buscar usuários reais no banco
    const { data, error } = await supabaseBrowserClient
      .from('programa_users')
      .select('*')
      .eq('programa_id', programaId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro na API de usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/programas/[id]/users - Adicionar usuário ao programa
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const programaId = parseInt(params.id);
    const body = await request.json();
    const { user_id, role, permissions } = body;

    // Verificar se é modo demo
    if (shouldUseDemoData(programaId)) {
      return NextResponse.json({
        message: 'Usuário adicionado com sucesso (modo demo)',
        data: {
          id: Date.now(),
          programa_id: programaId,
          user_id,
          role,
          permissions,
          status: 'accepted',
          created_at: new Date().toISOString()
        }
      });
    }

    // Verificar se usuário já existe no programa
    const { data: existingUser } = await supabaseBrowserClient
      .from('programa_users')
      .select('id')
      .eq('programa_id', programaId)
      .eq('user_id', user_id)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já existe neste programa' }, { status: 400 });
    }

    // Adicionar usuário
    const { data, error } = await supabaseBrowserClient
      .from('programa_users')
      .insert({
        programa_id: programaId,
        user_id,
        role,
        permissions,
        status: 'accepted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar usuário:', error);
      return NextResponse.json({ error: 'Erro ao adicionar usuário' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Usuário adicionado com sucesso', data });
  } catch (error) {
    console.error('Erro na API de adicionar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}