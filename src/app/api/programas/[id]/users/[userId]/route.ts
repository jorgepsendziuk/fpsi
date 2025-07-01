import { NextRequest, NextResponse } from 'next/server';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { shouldUseDemoData } from '@/lib/services/demoDataService';

// DELETE /api/programas/[id]/users/[userId] - Remover usuário do programa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const programaId = parseInt(params.id);
    const userId = params.userId;

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

// PUT /api/programas/[id]/users/[userId] - Atualizar dados do usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const programaId = parseInt(params.id);
    const userId = params.userId;
    const body = await request.json();
    const { role, permissions } = body;

    // Verificar se é modo demo
    if (shouldUseDemoData(programaId)) {
      return NextResponse.json({
        message: 'Usuário atualizado com sucesso (modo demo)',
        data: { user_id: userId, role, permissions }
      });
    }

    // Atualizar usuário
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

    return NextResponse.json({ message: 'Usuário atualizado com sucesso', data });
  } catch (error) {
    console.error('Erro na API de atualizar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}