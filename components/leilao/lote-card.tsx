'use client';

import { Lote } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Gavel, TrendingUp, Tag } from 'lucide-react';
import { formatarMoeda, calcularTempoRestante } from '@/lib/utils-extra';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LoteCardProps {
  lote: Lote & {
    _count?: { lances: number };
    numero?: number;
    origem?: string | null;
  };
  index?: number;
}

// Função para formatar número do lote
const formatNumeroLote = (numero?: number) => {
  if (!numero) return null;
  return `#${numero.toString().padStart(5, '0')}#`;
};

export function LoteCard({ lote, index = 0 }: LoteCardProps) {
  const valorAtual = lote.lanceAtual ?? lote.lanceInicial;
  const tempoRestante = calcularTempoRestante(lote.dataFim);
  const isEncerrado = tempoRestante === 'Encerrado';
  const numeroFormatado = formatNumeroLote(lote.numero);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/lotes/${lote.id}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-gray-200">
          <CardHeader className="p-0">
            <div className="relative aspect-video bg-gray-200 overflow-hidden">
              {lote.fotosUrls?.[0] ? (
                <Image
                  src={lote.fotosUrls[0]}
                  alt={lote.titulo}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Gavel className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {numeroFormatado && (
                <div className="absolute top-2 left-2">
                  <span className="font-mono text-xs bg-[#2c5282] text-white px-2 py-1 rounded shadow">
                    {numeroFormatado}
                  </span>
                </div>
              )}
              {isEncerrado && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Encerrado
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
              {lote.titulo}
            </h3>
            {lote.origem && (
              <div className="mb-2">
                <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {lote.origem}
                </Badge>
              </div>
            )}
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {lote.descricao}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Lance Atual:
                </span>
                <span className="font-bold text-[#2c5282] text-lg">
                  {formatarMoeda(valorAtual)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Tempo:
                </span>
                <span className="font-semibold text-gray-700">
                  {tempoRestante}
                </span>
              </div>
              {(lote._count?.lances ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Gavel className="w-4 h-4" />
                    Lances:
                  </span>
                  <span className="font-semibold text-gray-700">
                    {lote._count?.lances ?? 0}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="w-full text-center text-sm text-[#2c5282] font-medium hover:underline">
              Ver detalhes →
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
