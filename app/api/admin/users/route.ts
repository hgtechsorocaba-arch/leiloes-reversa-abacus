import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  
  const admin = await prisma.admin.findUnique({ where: { email: user.email } });
  return !!admin;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    // Se for pedido de um usuário específico com documentos
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      // Gerar URLs assinadas para os documentos
      const docFrenteUrl = user.docFrenteUrl ? await getFileUrl(user.docFrenteUrl, false) : null;
      const docVersoUrl = user.docVersoUrl ? await getFileUrl(user.docVersoUrl, false) : null;
      const selfieUrl = user.selfieUrl ? await getFileUrl(user.selfieUrl, false) : null;

      return NextResponse.json({
        user: {
          ...user,
          password: undefined,
          docFrenteUrl,
          docVersoUrl,
          selfieUrl,
        },
      });
    }

    // Lista de usuários
    const where = status ? { statusAprovacao: status } : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        telefone: true,
        cidade: true,
        estado: true,
        statusAprovacao: true,
        createdAt: true,
        docFrenteUrl: true,
        docVersoUrl: true,
        selfieUrl: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, statusAprovacao } = body;

    if (!userId || !statusAprovacao) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    if (!['pendente', 'aprovado', 'reprovado'].includes(statusAprovacao)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { statusAprovacao },
    });

    return NextResponse.json({ message: 'Status atualizado com sucesso', user });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}
