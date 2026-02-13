import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Função auxiliar para verificar se é admin
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

    const where = status ? { status } : {};

    const lotes = await prisma.lote.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { titulo, descricao, origem, lanceInicial, dataInicio, dataFim, fotosUrls, videosUrls } = body;

    if (!titulo || !descricao || !lanceInicial || !dataFim) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Filtrar valores nulos/undefined dos arrays de URLs
    const fotosUrlsFiltradas = Array.isArray(fotosUrls) 
      ? fotosUrls.filter((url: string | null) => url && typeof url === 'string' && url.trim() !== '')
      : [];
    const videosUrlsFiltrados = Array.isArray(videosUrls)
      ? videosUrls.filter((url: string | null) => url && typeof url === 'string' && url.trim() !== '')
      : [];

    const lote = await prisma.lote.create({
      data: {
        titulo,
        descricao,
        origem: origem || null,
        lanceInicial: parseFloat(String(lanceInicial)),
        dataInicio: dataInicio ? new Date(dataInicio) : new Date(),
        dataFim: new Date(dataFim),
        fotosUrls: fotosUrlsFiltradas,
        videosUrls: videosUrlsFiltrados,
        status: 'ativo',
      },
    });

    return NextResponse.json({ message: 'Lote criado com sucesso', lote }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar lote:', error);
    return NextResponse.json({ error: 'Erro ao criar lote' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { id, titulo, descricao, origem, lanceInicial, dataInicio, dataFim, fotosUrls, videosUrls, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do lote é obrigatório' }, { status: 400 });
    }

    const updateData: any = {};
    if (titulo) updateData.titulo = titulo;
    if (descricao) updateData.descricao = descricao;
    if (origem !== undefined) updateData.origem = origem;
    if (lanceInicial) updateData.lanceInicial = parseFloat(lanceInicial);
    if (dataInicio) updateData.dataInicio = new Date(dataInicio);
    if (dataFim) updateData.dataFim = new Date(dataFim);
    if (fotosUrls) updateData.fotosUrls = fotosUrls;
    if (videosUrls) updateData.videosUrls = videosUrls;
    if (status) updateData.status = status;

    const lote = await prisma.lote.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: 'Lote atualizado com sucesso', lote });
  } catch (error) {
    console.error('Erro ao atualizar lote:', error);
    return NextResponse.json({ error: 'Erro ao atualizar lote' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Tentar pegar do body ou dos searchParams
    let id: string | null = null;
    
    try {
      const body = await req.json();
      id = body.loteId || body.id;
    } catch {
      const { searchParams } = new URL(req.url);
      id = searchParams.get('id');
    }

    if (!id) {
      return NextResponse.json({ error: 'ID do lote é obrigatório' }, { status: 400 });
    }

    // Primeiro deletar os lances relacionados
    await prisma.lance.deleteMany({
      where: { loteId: id },
    });

    // Depois deletar o lote
    await prisma.lote.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Lote excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir lote:', error);
    return NextResponse.json({ error: 'Erro ao excluir lote' }, { status: 500 });
  }
}
