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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, aspectRatio = '16:9' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5.1',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image'],
        image_config: {
          num_images: 1,
          aspect_ratio: aspectRatio,
          quality: 'high'
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API de imagem:', errorText);
      return NextResponse.json({ error: 'Erro ao gerar imagem' }, { status: 500 });
    }

    const data = await response.json();
    
    // Extrair a imagem da resposta
    const imageData = data.choices?.[0]?.message?.images?.[0];
    
    if (!imageData) {
      return NextResponse.json({ error: 'Nenhuma imagem gerada' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      image: imageData.image_url?.url || imageData 
    });
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    return NextResponse.json({ error: 'Erro ao gerar imagem' }, { status: 500 });
  }
}
