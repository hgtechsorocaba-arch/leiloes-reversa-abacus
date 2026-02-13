'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Users, Gavel, Plus, Image as ImageIcon } from 'lucide-react';

export default function AdminPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLotes: 0,
    totalUsers: 0,
    totalLances: 0,
    usersPendentes: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Verificar se é admin
      if (session?.user?.email !== 'admin@reversa.com') {
        router.push('/');
      } else {
        loadStats();
      }
    }
  }, [status, session, router]);

  const loadStats = async () => {
    try {
      // Buscar estatísticas
      const [lotesRes, usersRes, lancesRes] = await Promise.all([
        fetch('/api/admin/lotes'),
        fetch('/api/admin/users'),
        fetch('/api/admin/lances'),
      ]);

      if (lotesRes.ok) {
        const data = await lotesRes.json();
        setStats(prev => ({ ...prev, totalLotes: data.lotes?.length ?? 0 }));
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setStats(prev => ({
          ...prev,
          totalUsers: data.users?.length ?? 0,
          usersPendentes: data.users?.filter((u: any) => u.statusAprovacao === 'pendente').length ?? 0,
        }));
      }

      if (lancesRes.ok) {
        const data = await lancesRes.json();
        setStats(prev => ({ ...prev, totalLances: data.lances?.length ?? 0 }));
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-lg text-gray-600">
            Gerencie lotes, usuários e lances da plataforma
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Lotes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gavel className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Lances</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLances}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cadastros Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.usersPendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/lotes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Gerenciar Lotes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Crie, edite ou exclua lotes de leilão
                </p>
                <Button className="w-full bg-[#2c5282] hover:bg-[#1e3a5f]">
                  <Plus className="w-4 h-4 mr-2" />
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gerenciar Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Aprove, reprove ou visualize cadastros
                </p>
                <Button className="w-full bg-[#2c5282] hover:bg-[#1e3a5f]">
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/lances">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="w-5 h-5" />
                  Ver Lances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Visualize o histórico de todos os lances
                </p>
                <Button className="w-full bg-[#2c5282] hover:bg-[#1e3a5f]">
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/banners">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Gerenciar Banners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Crie banners para a página inicial
                </p>
                <Button className="w-full bg-[#2c5282] hover:bg-[#1e3a5f]">
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
