import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cloud_storage_path, isPublic, docType, forSignup } = body;

    if (!cloud_storage_path) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Para cadastro, apenas retorna o path (será salvo quando finalizar o cadastro)
    if (forSignup) {
      return NextResponse.json({
        message: 'Upload concluído com sucesso',
        cloud_storage_path,
        isPublic,
      });
    }

    // Para usuários logados, verifica autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Se for documento de usuário, atualizar na base
    if (docType && ['docFrenteUrl', 'docVersoUrl', 'selfieUrl'].includes(docType)) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          [docType]: cloud_storage_path,
        },
      });
    }

    return NextResponse.json({
      message: 'Upload concluído com sucesso',
      cloud_storage_path,
      isPublic,
    });
  } catch (error) {
    console.error('Erro ao completar upload:', error);
    return NextResponse.json({ error: 'Erro ao completar upload' }, { status: 500 });
  }
}
