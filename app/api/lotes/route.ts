import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ativo';

    const lotes = await prisma.lote.findMany({
      where: {
        status,
      },
      orderBy: {
        dataFim: 'asc',
      },
      include: {
        lances: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            lances: true,
          },
        },
      },
    });

    return NextResponse.json({ lotes });
  } catch (error) {
    console.error('Erro ao buscar lotes:', error);
    return NextResponse.json({ error: 'Erro ao buscar lotes' }, { status: 500 });
  }
}
