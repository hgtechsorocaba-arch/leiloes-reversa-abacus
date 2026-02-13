'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, CheckCircle, XCircle, FileText, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminUsersPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [currentDocUrl, setCurrentDocUrl] = useState<string | null>(null);
  const [currentDocTitle, setCurrentDocTitle] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.email !== 'admin@reversa.com') {
        router.push('/');
      } else {
        loadUsers();
      }
    }
  }, [status, session, router]);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, statusAprovacao: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, statusAprovacao }),
      });

      if (res.ok) {
        toast.success('Status atualizado com sucesso');
        loadUsers();
      } else {
        toast.error('Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleViewDocument = async (userId: string, docType: 'frente' | 'verso' | 'selfie', userName: string) => {
    const docTitles = {
      frente: 'CNH/RG Frente',
      verso: 'CNH/RG Verso',
      selfie: 'Selfie com Documento',
    };

    setCurrentDocTitle(`${docTitles[docType]} - ${userName}`);
    setDocLoading(true);
    setDocModalOpen(true);
    setCurrentDocUrl(null);

    try {
      const res = await fetch(`/api/admin/users/docs?userId=${userId}&docType=${docType}`);
      
      if (res.ok) {
        const data = await res.json();
        setCurrentDocUrl(data.url);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Documento não encontrado');
        setDocModalOpen(false);
      }
    } catch (error) {
      console.error('Erro ao carregar documento:', error);
      toast.error('Erro ao carregar documento');
      setDocModalOpen(false);
    } finally {
      setDocLoading(false);
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
              Gerenciar Usuários
            </h1>
            <p className="text-lg text-gray-600">
              Total de usuários: {users.length}
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Voltar ao Admin</Button>
          </Link>
        </div>

        {users.length > 0 ? (
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {user.name}
                      </h3>
                      {user.statusAprovacao === 'aprovado' && (
                        <Badge className="bg-green-600">Aprovado</Badge>
                      )}
                      {user.statusAprovacao === 'pendente' && (
                        <Badge className="bg-orange-600">Pendente</Badge>
                      )}
                      {user.statusAprovacao === 'reprovado' && (
                        <Badge variant="destructive">Reprovado</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <p>Email: <strong>{user.email}</strong></p>
                      <p>CPF: <strong>{user.cpf}</strong></p>
                      <p>Telefone: <strong>{user.telefone}</strong></p>
                      <p>Cidade: <strong>{user.cidade}/{user.estado}</strong></p>
                    </div>

                    {/* Botões para visualizar documentos */}
                    <div className="flex gap-2 flex-wrap">
                      <p className="text-sm text-gray-500 w-full mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Documentos Enviados:
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(user.id, 'frente', user.name)}
                        disabled={!user.docFrenteUrl}
                        className={!user.docFrenteUrl ? 'opacity-50' : ''}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        CNH/RG Frente
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(user.id, 'verso', user.name)}
                        disabled={!user.docVersoUrl}
                        className={!user.docVersoUrl ? 'opacity-50' : ''}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        CNH/RG Verso
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(user.id, 'selfie', user.name)}
                        disabled={!user.selfieUrl}
                        className={!user.selfieUrl ? 'opacity-50' : ''}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Selfie
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {user.statusAprovacao !== 'aprovado' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleUpdateStatus(user.id, 'aprovado')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                    )}
                    {user.statusAprovacao !== 'reprovado' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(user.id, 'reprovado')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reprovar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum usuário cadastrado</p>
          </div>
        )}

        {/* Modal para visualização de documentos */}
        <Dialog open={docModalOpen} onOpenChange={setDocModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{currentDocTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center min-h-[400px]">
              {docLoading ? (
                <Loader2 className="w-12 h-12 animate-spin text-[#2c5282]" />
              ) : currentDocUrl ? (
                <img
                  src={currentDocUrl}
                  alt={currentDocTitle}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : (
                <p className="text-gray-500">Documento não disponível</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
