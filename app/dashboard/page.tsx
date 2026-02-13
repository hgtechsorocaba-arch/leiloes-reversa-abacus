'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gavel, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatarMoeda } from '@/lib/utils-extra';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface Lance {
  id: string;
  valor: number;
  createdAt: string;
  lote: {
    id: string;
    titulo: string;
    lanceAtual: number | null;
    status: string;
    dataFim: string;
  };
}

interface User {
  name: string;
  email: string;
  statusAprovacao: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [lances, setLances] = useState<Lance[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  const loadData = async () => {
    try {
      // Buscar lances do usuário
      const lancesRes = await fetch('/api/lances');
      if (lancesRes.ok) {
        const data = await lancesRes.json();
        setLances(data.lances ?? []);
      }

      // Buscar dados do usuário (status de aprovação)
      const userRes = await fetch('/api/user/me');
      if (userRes.ok) {
        const data = await userRes.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#2c5282]" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const statusAprovacao = user?.statusAprovacao ?? 'pendente';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Olá, {session.user?.name ?? 'Usuário'}!
          </h1>
          <p className="text-lg text-gray-600">
            Bem-vindo ao seu painel de controle
          </p>
        </div>

        {/* Status de Aprovação */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {statusAprovacao === 'aprovado' ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-green-600">Cadastro Aprovado</h3>
                    <p className="text-gray-600">Você já pode dar lances nos leilões!</p>
                  </div>
                </>
              ) : statusAprovacao === 'reprovado' ? (
                <>
                  <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-red-600">Cadastro Reprovado</h3>
                    <p className="text-gray-600">
                      Seu cadastro foi reprovado. Entre em contato conosco para mais informações.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-12 h-12 text-orange-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-orange-600">Cadastro Pendente</h3>
                    <p className="text-gray-600">
                      Seu cadastro está em análise. Aguarde a aprovação para poder dar lances.
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Meus Lances */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Gavel className="w-6 h-6" />
              Meus Lances
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lances.length > 0 ? (
              <div className="space-y-4">
                {lances.map((lance) => {
                  const isVencendo = lance.valor >= (lance.lote?.lanceAtual ?? 0);
                  const isEncerrado = lance.lote?.status === 'encerrado';

                  return (
                    <Link key={lance.id} href={`/lotes/${lance.lote?.id ?? ''}`}>
                      <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              {lance.lote?.titulo ?? 'Lote'}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {format(new Date(lance.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                          {isEncerrado ? (
                            <Badge variant="secondary">Encerrado</Badge>
                          ) : isVencendo ? (
                            <Badge className="bg-green-600 hover:bg-green-700">Vencendo</Badge>
                          ) : (
                            <Badge variant="destructive">Superado</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Seu Lance</p>
                            <p className="font-bold text-[#2c5282]">{formatarMoeda(lance.valor)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Lance Atual</p>
                            <p className="font-bold text-gray-900">
                              {formatarMoeda(lance.lote?.lanceAtual ?? 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Você ainda não deu nenhum lance.
                </p>
                <Link
                  href="/lotes"
                  className="text-[#2c5282] hover:underline font-medium"
                >
                  Ver leilões disponíveis →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
