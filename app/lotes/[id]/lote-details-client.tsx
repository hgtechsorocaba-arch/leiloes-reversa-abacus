'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lote, Lance, User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanceHistory } from '@/components/leilao/lance-history';
import { formatarMoeda, calcularTempoRestante } from '@/lib/utils-extra';
import { Clock, Gavel, TrendingUp, Calendar, Info, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LoteDetailsClientProps {
  lote: Lote & {
    lances: (Lance & { user: Pick<User, 'name' | 'email'> })[];
    _count: { lances: number };
  };
}

export function LoteDetailsClient({ lote: initialLote }: LoteDetailsClientProps) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [lote, setLote] = useState(initialLote);
  const [valorLance, setValorLance] = useState('');
  const [loading, setLoading] = useState(false);
  const [fotoAtual, setFotoAtual] = useState(0);

  const valorAtual = lote.lanceAtual ?? lote.lanceInicial;
  const tempoRestante = calcularTempoRestante(lote.dataFim);
  const isEncerrado = tempoRestante === 'Encerrado';
  const isAuthenticated = status === 'authenticated';

  const handleDarLance = async () => {
    if (!session) {
      toast.error('Você precisa estar logado para dar lances');
      router.push('/login');
      return;
    }

    const valor = parseFloat(valorLance);
    if (isNaN(valor) || valor <= valorAtual) {
      toast.error(`O lance deve ser maior que ${formatarMoeda(valorAtual)}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/lances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loteId: lote.id,
          valor,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao dar lance');
        return;
      }

      toast.success('Lance realizado com sucesso!');
      setValorLance('');
      router.refresh();
    } catch (error) {
      console.error('Erro ao dar lance:', error);
      toast.error('Erro ao dar lance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria de Fotos */}
            <Card>
              <CardContent className="p-6">
                <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                  {lote.fotosUrls?.[fotoAtual] ? (
                    <Image
                      src={lote.fotosUrls[fotoAtual]}
                      alt={lote.titulo}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gavel className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                  {isEncerrado && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="secondary" className="text-xl px-6 py-3">
                        Encerrado
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {lote.fotosUrls && lote.fotosUrls.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {lote.fotosUrls.map((foto, index) => (
                      <button
                        key={index}
                        onClick={() => setFotoAtual(index)}
                        className={`relative aspect-video bg-gray-200 rounded overflow-hidden border-2 transition-all ${
                          index === fotoAtual ? 'border-[#2c5282] scale-105' : 'border-transparent hover:border-gray-400'
                        }`}
                      >
                        <Image
                          src={foto}
                          alt={`Foto ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Descrição */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{lote.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {lote.descricao}
                </p>
              </CardContent>
            </Card>

            {/* Histórico de Lances */}
            <LanceHistory lances={lote.lances} />
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Informações do Leilão */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Leilão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Lance Inicial:
                  </span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatarMoeda(lote.lanceInicial)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#2c5282]" />
                    Lance Atual:
                  </span>
                  <span className="font-bold text-2xl text-[#2c5282]">
                    {formatarMoeda(valorAtual)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-gray-600" />
                    Total de Lances:
                  </span>
                  <span className="font-bold text-lg text-gray-900">
                    {lote._count?.lances ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Tempo Restante:
                  </span>
                  <span className="font-bold text-lg text-gray-900">
                    {tempoRestante}
                  </span>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Início: {format(new Date(lote.dataInicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Término: {format(new Date(lote.dataFim), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dar Lance */}
            {!isEncerrado && (
              <Card>
                <CardHeader>
                  <CardTitle>Dar Lance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAuthenticated ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Valor do Lance (R$)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={valorLance}
                          onChange={(e) => setValorLance(e.target.value)}
                          placeholder={`Mínimo: ${formatarMoeda(valorAtual + 0.01)}`}
                          disabled={loading}
                        />
                      </div>

                      <Button
                        onClick={handleDarLance}
                        disabled={loading || !valorLance}
                        className="w-full bg-[#2c5282] hover:bg-[#1e3a5f] text-white py-6 text-lg"
                        size="lg"
                      >
                        {loading ? 'Processando...' : 'Dar Lance'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{
                          scale: [1, 1.02, 1],
                          boxShadow: [
                            '0 0 0 0 rgba(37, 99, 235, 0)',
                            '0 0 0 10px rgba(37, 99, 235, 0.3)',
                            '0 0 0 0 rgba(37, 99, 235, 0)'
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className="rounded-lg"
                      >
                        <Button
                          onClick={() => router.push('/cadastro')}
                          className="w-full bg-gradient-to-r from-[#2c5282] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2c5282] text-white py-6 text-lg font-bold flex items-center justify-center gap-2"
                          size="lg"
                        >
                          <UserPlus className="w-5 h-5" />
                          Cadastre-se para dar o lance
                        </Button>
                      </motion.div>

                      <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          Crie sua conta gratuitamente e participe dos leilões!
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}