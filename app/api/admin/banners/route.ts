import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Listar banners
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get('active') === 'true';
    
    const banners = await prisma.banner.findMany({
      where: onlyActive ? { ativo: true } : {},
      orderBy: { ordem: 'asc' },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Erro ao buscar banners:', error);
    return NextResponse.json({ error: 'Erro ao buscar banners' }, { status: 500 });
  }
}

// POST - Criar banner
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== 'admin@reversa.com') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { titulo, imageUrl, link, ordem, ativo } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL da imagem é obrigatória' }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        titulo: titulo || null,
        imageUrl,
        link: link || null,
        ordem: ordem ?? 0,
        ativo: ativo ?? true,
      },
    });

    return NextResponse.json({ message: 'Banner criado com sucesso', banner }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar banner:', error);
    return NextResponse.json({ error: 'Erro ao criar banner' }, { status: 500 });
  }
}

// PUT - Atualizar banner
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== 'admin@reversa.com') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { id, titulo, imageUrl, link, ordem, ativo } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do banner é obrigatório' }, { status: 400 });
    }

    const updateData: any = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (link !== undefined) updateData.link = link;
    if (ordem !== undefined) updateData.ordem = ordem;
    if (ativo !== undefined) updateData.ativo = ativo;

    const banner = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: 'Banner atualizado com sucesso', banner });
  } catch (error) {
    console.error('Erro ao atualizar banner:', error);
    return NextResponse.json({ error: 'Erro ao atualizar banner' }, { status: 500 });
  }
}

// DELETE - Excluir banner
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== 'admin@reversa.com') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    let id: string | null = null;
    
    try {
      const body = await req.json();
      id = body.bannerId || body.id;
    } catch {
      const { searchParams } = new URL(req.url);
      id = searchParams.get('id');
    }

    if (!id) {
      return NextResponse.json({ error: 'ID do banner é obrigatório' }, { status: 400 });
    }

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Banner excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir banner:', error);
    return NextResponse.json({ error: 'Erro ao excluir banner' }, { status: 500 });
  }
}
