import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin
    if (!session?.user?.email || session.user.email !== 'admin@reversa.com') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const docType = searchParams.get('docType');

    if (!userId || !docType) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        docFrenteUrl: true,
        docVersoUrl: true,
        selfieUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    let cloud_storage_path: string | null = null;

    switch (docType) {
      case 'frente':
        cloud_storage_path = user.docFrenteUrl;
        break;
      case 'verso':
        cloud_storage_path = user.docVersoUrl;
        break;
      case 'selfie':
        cloud_storage_path = user.selfieUrl;
        break;
      default:
        return NextResponse.json({ error: 'Tipo de documento inválido' }, { status: 400 });
    }

    if (!cloud_storage_path) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    // Gerar URL assinada para visualização
    const viewUrl = await getFileUrl(cloud_storage_path, false);

    return NextResponse.json({ url: viewUrl });
  } catch (error) {
    console.error('Erro ao obter documento:', error);
    return NextResponse.json({ error: 'Erro ao obter documento' }, { status: 500 });
  }
}
