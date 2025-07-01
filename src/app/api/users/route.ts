import { NextRequest, NextResponse } from 'next/server';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { shouldUseDemoData } from '@/lib/services/demoDataService';
import { UserRole, getDefaultPermissions } from '@/lib/types/user';

// GET /api/users?programaId=1 - Listar usuários do programa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programaId = parseInt(searchParams.get('programaId') || '0');

    if (!programaId) {
      return NextResponse.json({ error: 'programaId é obrigatório' }, { status: 400 });
    }

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

// POST /api/users - Adicionar/atualizar usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { programaId, userId, role, action = 'add' } = body;

    if (!programaId || !userId) {
      return NextResponse.json({ error: 'programaId e userId são obrigatórios' }, { status: 400 });
    }

    const permissions = getDefaultPermissions(role || UserRole.ANALISTA);

    // Verificar se é modo demo
    if (shouldUseDemoData(programaId)) {
      return NextResponse.json({
        message: `Usuário ${action === 'add' ? 'adicionado' : 'atualizado'} com sucesso (modo demo)`,
        data: {
          id: Date.now(),
          programa_id: programaId,
          user_id: userId,
          role: role || UserRole.ANALISTA,
          permissions,
          status: 'accepted',
          created_at: new Date().toISOString()
        }
      });
    }

    if (action === 'update_role') {
      // Atualizar função do usuário
      const { data, error } = await supabaseBrowserClient
        .from('programa_users')
        .update({
          role,
          permissions,
          updated_at: new Date().toISOString()
        })
        .eq('programa_id', programaId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Função alterada com sucesso', data });
    } else {
      // Adicionar novo usuário
      const { data, error } = await supabaseBrowserClient
        .from('programa_users')
        .insert({
          programa_id: programaId,
          user_id: userId,
          role: role || UserRole.ANALISTA,
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
    }
  } catch (error) {
    console.error('Erro na API de usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/users - Remover usuário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programaId = parseInt(searchParams.get('programaId') || '0');
    const userId = searchParams.get('userId');

    if (!programaId || !userId) {
      return NextResponse.json({ error: 'programaId e userId são obrigatórios' }, { status: 400 });
    }

    // Verificar se é modo demo
    if (shouldUseDemoData(programaId)) {
      return NextResponse.json({ message: 'Usuário removido com sucesso (modo demo)' });
    }

    // Remover usuário do programa
    const { error } = await supabaseBrowserClient
      .from('programa_users')
      .delete()
      .eq('programa_id', programaId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao remover usuário:', error);
      return NextResponse.json({ error: 'Erro ao remover usuário' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Erro na API de remover usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}