import { prisma } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { LoteCard } from '@/components/leilao/lote-card';
import { Button } from '@/components/ui/button';
import { Gavel, ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import { BannerCarousel } from '@/components/banner-carousel';

export const dynamic = 'force-dynamic';

async function getLotesDestaque() {
  const lotes = await prisma.lote.findMany({
    where: {
      status: 'ativo',
    },
    orderBy: {
      dataFim: 'asc',
    },
    take: 6,
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

async function getBanners() {
  const banners = await prisma.banner.findMany({
    where: {
      ativo: true,
    },
    orderBy: {
      ordem: 'asc',
    },
  });

  return banners;
}

export default async function HomePage() {
  const lotesDestaque = await getLotesDestaque();
  const banners = await getBanners();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <BannerCarousel banners={banners} />
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#2c5282] to-[#1e3a5f] text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Leilões de <span className="text-yellow-400">Logística Reversa</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-200">
                Oportunidades exclusivas em Sorocaba e Região
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/lotes">
                  <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 text-lg px-8 py-6 animate-pulse">
                    Ver Leilões Ativos
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20 text-lg px-8 py-6">
                    Cadastre-se Agora
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <Image
                  src="/logo-reversa.png"
                  alt="Leilões Reversa"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#2c5282] rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Segurança</h3>
              <p className="text-gray-600">
                Plataforma segura com aprovação de cadastros e validação de documentos.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#2c5282] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Leilões ao Vivo</h3>
              <p className="text-gray-600">
                Acompanhe lances em tempo real e não perca nenhuma oportunidade.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#2c5282] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Melhores Preços</h3>
              <p className="text-gray-600">
                Produtos de logística reversa com preços competitivos e qualidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lotes em Destaque */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lotes em <span className="text-[#2c5282]">Destaque</span>
            </h2>
            <p className="text-lg text-gray-600">
              Confira os leilões ativos e dê seu lance agora mesmo!
            </p>
          </div>

          {lotesDestaque.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {lotesDestaque.map((lote, index) => (
                <LoteCard key={lote.id} lote={lote} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Nenhum leilão ativo no momento.</p>
            </div>
          )}

          <div className="text-center">
            <Link href="/lotes">
              <Button size="lg" className="bg-[#2c5282] hover:bg-[#1e3a5f] text-lg px-8">
                Ver Todos os Leilões
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#2c5282] to-[#1e3a5f] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar a dar lances?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Cadastre-se agora e participe dos nossos leilões de logística reversa.
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 text-lg px-12 py-6 animate-pulse">
              Cadastrar Agora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
