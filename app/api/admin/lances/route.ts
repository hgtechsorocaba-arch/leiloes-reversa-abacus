import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const loteId = searchParams.get('loteId');

    const where = loteId ? { loteId } : {};

    const lances = await prisma.lance.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            cpf: true,
          },
        },
        lote: {
          select: {
            titulo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ lances });
  } catch (error) {
    console.error('Erro ao buscar lances:', error);
    return NextResponse.json({ error: 'Erro ao buscar lances' }, { status: 500 });
  }
}
