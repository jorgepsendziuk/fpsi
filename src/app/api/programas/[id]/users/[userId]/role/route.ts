import { NextRequest, NextResponse } from 'next/server';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { shouldUseDemoData } from '@/lib/services/demoDataService';
import { UserRole, getDefaultPermissions } from '@/lib/types/user';

// PUT /api/programas/[id]/users/[userId]/role - Alterar função do usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const programaId = parseInt(params.id);
    const userId = params.userId;
    const body = await request.json();
    const { role } = body;

    // Validar função
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: 'Função inválida' }, { status: 400 });
    }

    // Obter permissões padrão para a nova função
    const permissions = getDefaultPermissions(role);

    // Verificar se é modo demo
    if (shouldUseDemoData(programaId)) {
      return NextResponse.json({
        message: `Usuário promovido para ${role} com sucesso (modo demo)`,
        data: { 
          user_id: userId, 
          role, 
          permissions,
          updated_at: new Date().toISOString()
        }
      });
    }

    // Verificar se usuário existe no programa
    const { data: existingUser } = await supabaseBrowserClient
      .from('programa_users')
      .select('id, role')
      .eq('programa_id', programaId)
      .eq('user_id', userId)
      .single();

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado neste programa' }, { status: 404 });
    }

    // Atualizar função e permissões
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
      console.error('Erro ao alterar função:', error);
      return NextResponse.json({ error: 'Erro ao alterar função do usuário' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Função alterada para ${role} com sucesso`, 
      data: {
        ...data,
        previous_role: existingUser.role
      }
    });
  } catch (error) {
    console.error('Erro na API de alterar função:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}