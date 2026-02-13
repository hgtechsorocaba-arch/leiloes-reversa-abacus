'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Gavel } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatarMoeda } from '@/lib/utils-extra';

export default function AdminLancesPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [lances, setLances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.email !== 'admin@reversa.com') {
        router.push('/');
      } else {
        loadLances();
      }
    }
  }, [status, session, router]);

  const loadLances = async () => {
    try {
      const res = await fetch('/api/admin/lances');
      if (res.ok) {
        const data = await res.json();
        setLances(data.lances ?? []);
      }
    } catch (error) {
      console.error('Erro ao carregar lances:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Histórico de Lances
            </h1>
            <p className="text-lg text-gray-600">
              Total de lances: {lances.length}
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Voltar ao Admin</Button>
          </Link>
        </div>

        {lances.length > 0 ? (
          <div className="grid gap-4">
            {lances.map((lance) => (
              <Card key={lance.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {lance.lote?.titulo ?? 'Lote'}
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <p>Usuário: <strong>{lance.user?.name ?? 'N/A'}</strong></p>
                      <p>Email: <strong>{lance.user?.email ?? 'N/A'}</strong></p>
                      <p>CPF: <strong>{lance.user?.cpf ?? 'N/A'}</strong></p>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <p>Valor: <strong className="text-[#2c5282]">{formatarMoeda(lance.valor)}</strong></p>
                      <p>Data: <strong>{format(new Date(lance.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</strong></p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum lance registrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
