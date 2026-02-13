import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePresignedUploadUrl } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, contentType, isPublic, forSignup, forAdmin } = body;

    const session = await getServerSession(authOptions);
    
    // Verifica se é admin
    const isAdmin = session?.user?.email === 'admin@reversa.com';

    // Permite upload sem autenticação apenas para cadastro de documentos
    // Ou permite se for admin
    if (!forSignup && !isAdmin) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }
    }

    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Validar tipo de arquivo (imagens e PDFs)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 });
    }

    const result = await generatePresignedUploadUrl(fileName, contentType, isPublic ?? false);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao gerar URL de upload:', error);
    return NextResponse.json({ error: 'Erro ao gerar URL de upload' }, { status: 500 });
  }
}
