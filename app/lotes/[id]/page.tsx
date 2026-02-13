import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { LoteDetailsClient } from './lote-details-client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

async function getLote(id: string) {
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

  return lote;
}

export default async function LoteDetailPage({ params }: PageProps) {
  const lote = await getLote(params.id);

  if (!lote) {
    notFound();
  }

  return <LoteDetailsClient lote={lote} />;
}
