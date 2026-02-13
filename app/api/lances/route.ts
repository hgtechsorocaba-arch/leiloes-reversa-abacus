import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se usuário está aprovado
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.statusAprovacao !== 'aprovado') {
      return NextResponse.json(
        { error: 'Seu cadastro ainda não foi aprovado. Aguarde a aprovação para dar lances.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { loteId, valor } = body;

    if (!loteId || !valor) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Buscar lote
    const lote = await prisma.lote.findUnique({
      where: { id: loteId },
      include: {
        lances: {
          orderBy: {
            valor: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!lote) {
      return NextResponse.json({ error: 'Lote não encontrado' }, { status: 404 });
    }

    // Verificar se leilão está ativo
    if (lote.status !== 'ativo') {
      return NextResponse.json({ error: 'Este leilão não está mais ativo' }, { status: 400 });
    }

    // Verificar se ainda está no prazo
    const agora = new Date();
    if (agora > lote.dataFim) {
      return NextResponse.json({ error: 'Este leilão já foi encerrado' }, { status: 400 });
    }

    // Verificar valor mínimo
    const lanceAtual = lote.lanceAtual || lote.lanceInicial;
    if (valor <= lanceAtual) {
      return NextResponse.json(
        { error: `O lance deve ser maior que R$ ${lanceAtual.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Criar lance
    const lance = await prisma.lance.create({
      data: {
        valor,
        loteId,
        userId: session.user.id,
      },
    });

    // Atualizar lance atual do lote
    await prisma.lote.update({
      where: { id: loteId },
      data: { lanceAtual: valor },
    });

    return NextResponse.json(
      { message: 'Lance realizado com sucesso!', lance },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao dar lance:', error);
    return NextResponse.json({ error: 'Erro ao realizar lance' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const lances = await prisma.lance.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        lote: true,
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
