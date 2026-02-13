import { prisma } from '@/lib/db';
import { LoteCard } from '@/components/leilao/lote-card';
import { Gavel } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getLotes() {
  const lotes = await prisma.lote.findMany({
    where: {
      status: 'ativo',
    },
    orderBy: {
      dataFim: 'asc',
    },
    include: {
      _count: {
        select: {
          lances: true,
        },
      },
    },
  });

  return lotes;
}

export default async function LotesPage() {
  const lotes = await getLotes();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Leilões <span className="text-[#2c5282]">Ativos</span>
          </h1>
          <p className="text-lg text-gray-600">
            Confira todos os leilões disponíveis e dê seu lance!
          </p>
        </div>

        {lotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotes.map((lote, index) => (
              <LoteCard key={lote.id} lote={lote} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Gavel className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Nenhum leilão ativo no momento
            </h2>
            <p className="text-gray-600">
              Volte em breve para conferir novos lotes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
