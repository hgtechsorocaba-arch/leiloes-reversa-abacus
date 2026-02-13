import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const lote = await prisma.lote.findUnique({
      where: { id },
      include: {
        lances: {
          orderBy: {
            createdAt: 'desc',
          },
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

    if (!lote) {
      return NextResponse.json({ error: 'Lote não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ lote });
  } catch (error) {
    console.error('Erro ao buscar lote:', error);
    return NextResponse.json({ error: 'Erro ao buscar lote' }, { status: 500 });
  }
}
