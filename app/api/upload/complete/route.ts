import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getFileUrl } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cloud_storage_path, isPublic, docType, forSignup } = body;

    if (!cloud_storage_path) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email === 'admin@reversa.com';

    // Para cadastro ou admin, apenas retorna a URL
    if (forSignup || isAdmin || isPublic) {
      const url = await getFileUrl(cloud_storage_path, isPublic ?? false);
      return NextResponse.json({
        message: 'Upload concluído com sucesso',
        cloud_storage_path,
        isPublic,
        url,
      });
    }

    // Para usuários logados, verifica autenticação
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

    const url = await getFileUrl(cloud_storage_path, isPublic ?? false);
    
    return NextResponse.json({
      message: 'Upload concluído com sucesso',
      cloud_storage_path,
      isPublic,
      url,
    });
  } catch (error) {
    console.error('Erro ao completar upload:', error);
    return NextResponse.json({ error: 'Erro ao completar upload' }, { status: 500 });
  }
}
