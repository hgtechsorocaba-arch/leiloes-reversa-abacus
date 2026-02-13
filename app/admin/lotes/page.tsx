'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Package, Trophy, MessageCircle, Mail, Copy, CheckCircle, Plus, Trash2, Upload, Image as ImageIcon, Video, Sparkles, X, Wand2, Tag, Pencil, Eye, Calendar, DollarSign, User, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Categorias de origem para lotes de logística reversa
const CATEGORIAS_ORIGEM = [
  'Devolução Marketplace',
  'Caixa Amassada',
  'Open Box',
  'Avaria Cosmética',
  'Avaria Funcional',
  'Mostruário',
  'Excesso de Estoque',
  'Retorno de Cliente',
  'Produto de Vitrine',
  'Embalagem Danificada',
  'Recall/Recolhimento',
  'Prazo de Validade Próximo',
  'Sinistro/Salvado',
  'Peça de Showroom',
  'Outlet/Fim de Linha'
];

interface ResumoLote {
  resumo: {
    lote: { id: string; titulo: string; descricao: string };
    arrematante: {
      nome: string;
      email: string;
      cpf: string;
      telefone: string;
      endereco: string;
    };
    valores: {
      valorLance: number;
      taxaLeiloeiro: number;
      taxaLeiloeiroPercentual: string;
      taxaAdministrativa: number;
      taxaAdministrativaPercentual: string;
      valorTotal: number;
    };
  };
  textoResumo: string;
  telefoneArrematante: string;
  emailArrematante: string;
}

interface UploadedFile {
  url: string;
  name: string;
}

export default function AdminLotesPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [lotes, setLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState<string | null>(null);
  const [resumoModal, setResumoModal] = useState<ResumoLote | null>(null);
  const [copied, setCopied] = useState(false);
  const [novoLoteModal, setNovoLoteModal] = useState(false);
  const [criandoLote, setCriandoLote] = useState(false);
  const [deletando, setDeletando] = useState<string | null>(null);
  
  // Estados para edição
  const [editandoLote, setEditandoLote] = useState<any | null>(null);
  const [editandoModal, setEditandoModal] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [editPhotos, setEditPhotos] = useState<UploadedFile[]>([]);
  const [editVideo, setEditVideo] = useState<UploadedFile | null>(null);
  
  // Estados para visualização detalhada
  const [visualizandoLote, setVisualizandoLote] = useState<any | null>(null);
  const [visualizandoModal, setVisualizandoModal] = useState(false);
  
  // Estados para upload de fotos
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedFile[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Estado para vídeo
  const [uploadedVideo, setUploadedVideo] = useState<UploadedFile | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  // Estados para geração de banner com IA
  const [bannerPrompt, setBannerPrompt] = useState('');
  const [generatingBanner, setGeneratingBanner] = useState(false);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [novoLote, setNovoLote] = useState({
    titulo: '',
    descricao: '',
    origem: '',
    lanceInicial: '',
    dataFim: '',
  });
  
  // Estado para sugestão da IA
  const [sugerindo, setSugerindo] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.email !== 'admin@reversa.com') {
        router.push('/');
      } else {
        loadLotes();
      }
    }
  }, [status, session, router]);

  const loadLotes = async () => {
    try {
      const res = await fetch('/api/admin/lotes');
      if (res.ok) {
        const data = await res.json();
        setLotes(data.lotes ?? []);
      }
    } catch (error) {
      console.error('Erro ao carregar lotes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para upload de foto
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const remainingSlots = 20 - uploadedPhotos.length;
    if (remainingSlots <= 0) {
      toast.error('Limite de 20 fotos atingido');
      return;
    }
    
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploadingPhoto(true);
    
    try {
      for (const file of filesToUpload) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} muito grande (max 10MB)`);
          continue;
        }
        
        // Obter URL pré-assinada
        const presignedRes = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            isPublic: true,
          }),
        });
        
        if (!presignedRes.ok) {
          toast.error(`Erro ao preparar upload de ${file.name}`);
          continue;
        }
        
        const { uploadUrl, cloud_storage_path } = await presignedRes.json();
        
        // Verificar se precisa incluir Content-Disposition
        const urlParams = new URLSearchParams(uploadUrl.split('?')[1]);
        const signedHeaders = urlParams.get('X-Amz-SignedHeaders') || '';
        const headers: Record<string, string> = { 'Content-Type': file.type };
        if (signedHeaders.includes('content-disposition')) {
          headers['Content-Disposition'] = 'attachment';
        }
        
        // Fazer upload para S3
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers,
          body: file,
        });
        
        if (!uploadRes.ok) {
          toast.error(`Erro ao enviar ${file.name}`);
          continue;
        }
        
        // Completar upload
        const completeRes = await fetch('/api/upload/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cloud_storage_path,
            isPublic: true,
          }),
        });
        
        if (completeRes.ok) {
          const { url } = await completeRes.json();
          setUploadedPhotos(prev => [...prev, { url, name: file.name }]);
        }
      }
      
      toast.success('Fotos enviadas com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar fotos');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // Função para upload de vídeo
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Vídeo muito grande (max 100MB)');
      return;
    }
    
    setUploadingVideo(true);
    
    try {
      const presignedRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          isPublic: true,
        }),
      });
      
      if (!presignedRes.ok) {
        toast.error('Erro ao preparar upload');
        return;
      }
      
      const { uploadUrl, cloud_storage_path } = await presignedRes.json();
      
      const urlParams = new URLSearchParams(uploadUrl.split('?')[1]);
      const signedHeaders = urlParams.get('X-Amz-SignedHeaders') || '';
      const headers: Record<string, string> = { 'Content-Type': file.type };
      if (signedHeaders.includes('content-disposition')) {
        headers['Content-Disposition'] = 'attachment';
      }
      
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: file,
      });
      
      if (!uploadRes.ok) {
        toast.error('Erro ao enviar vídeo');
        return;
      }
      
      const completeRes = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloud_storage_path,
          isPublic: true,
        }),
      });
      
      if (completeRes.ok) {
        const { url } = await completeRes.json();
        setUploadedVideo({ url, name: file.name });
        toast.success('Vídeo enviado com sucesso!');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar vídeo');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // Função para gerar banner com IA
  const handleGenerateBanner = async () => {
    if (!bannerPrompt.trim()) {
      toast.error('Digite uma descrição para o banner');
      return;
    }
    
    if (uploadedPhotos.length >= 20) {
      toast.error('Limite de 20 fotos atingido');
      return;
    }
    
    setGeneratingBanner(true);
    
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Crie um banner profissional para leilão reverso: ${bannerPrompt}. Estilo moderno, cores vibrantes, alta qualidade.`,
          aspectRatio: '16:9',
        }),
      });
      
      if (!res.ok) {
        toast.error('Erro ao gerar banner');
        return;
      }
      
      const data = await res.json();
      
      if (data.image) {
        setUploadedPhotos(prev => [...prev, { url: data.image, name: 'Banner gerado por IA' }]);
        toast.success('Banner gerado com sucesso!');
        setBannerPrompt('');
      }
    } catch (error) {
      console.error('Erro ao gerar banner:', error);
      toast.error('Erro ao gerar banner');
    } finally {
      setGeneratingBanner(false);
    }
  };

  // Remover foto
  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Remover vídeo
  const removeVideo = () => {
    setUploadedVideo(null);
  };

  // Função para sugerir preenchimento com IA
  const handleSugerirIA = async () => {
    if (!novoLote.titulo || novoLote.titulo.length < 3) {
      toast.error('Digite um título com pelo menos 3 caracteres');
      return;
    }
    
    setSugerindo(true);
    
    try {
      const res = await fetch('/api/lotes/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: novoLote.titulo }),
      });
      
      if (!res.ok) {
        toast.error('Erro ao obter sugestão');
        return;
      }
      
      const data = await res.json();
      
      setNovoLote(prev => ({
        ...prev,
        descricao: data.descricao || prev.descricao,
        origem: data.origem || prev.origem,
        lanceInicial: data.lanceInicial ? data.lanceInicial.toString() : prev.lanceInicial,
      }));
      
      toast.success('Sugestões aplicadas! Revise e ajuste conforme necessário.');
    } catch (error) {
      console.error('Erro na sugestão:', error);
      toast.error('Erro ao obter sugestão');
    } finally {
      setSugerindo(false);
    }
  };

  // Função para formatar número do lote
  const formatNumeroLote = (numero: number) => {
    return `#${numero.toString().padStart(5, '0')}#`;
  };

  const handleFinalizarLote = async (loteId: string) => {
    setFinalizando(loteId);
    try {
      const res = await fetch('/api/lotes/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loteId }),
      });

      if (res.ok) {
        const data = await res.json();
        setResumoModal(data);
        toast.success('Lote finalizado com sucesso!');
        loadLotes();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao finalizar lote');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao finalizar lote');
    } finally {
      setFinalizando(null);
    }
  };

  const handleCopyText = () => {
    if (resumoModal?.textoResumo) {
      navigator.clipboard.writeText(resumoModal.textoResumo);
      setCopied(true);
      toast.success('Texto copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendWhatsApp = () => {
    if (resumoModal) {
      const telefone = resumoModal.telefoneArrematante.replace(/\D/g, '');
      const telefoneFormatado = telefone.startsWith('55') ? telefone : `55${telefone}`;
      const texto = encodeURIComponent(resumoModal.textoResumo);
      window.open(`https://wa.me/${telefoneFormatado}?text=${texto}`, '_blank');
    }
  };

  const handleSendEmail = () => {
    if (resumoModal) {
      const subject = encodeURIComponent(`Arrematação - ${resumoModal.resumo.lote.titulo}`);
      const body = encodeURIComponent(resumoModal.textoResumo);
      window.open(`mailto:${resumoModal.emailArrematante}?subject=${subject}&body=${body}`, '_blank');
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCriarLote = async (e: React.FormEvent) => {
    e.preventDefault();
    setCriandoLote(true);

    try {
      // Filtrar URLs nulas ou vazias
      const fotosUrls = uploadedPhotos
        .map(p => p.url)
        .filter(url => url && url.trim() !== '');
      const videosUrls = uploadedVideo?.url 
        ? [uploadedVideo.url].filter(url => url && url.trim() !== '') 
        : [];

      const res = await fetch('/api/admin/lotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: novoLote.titulo,
          descricao: novoLote.descricao,
          origem: novoLote.origem || null,
          lanceInicial: parseFloat(novoLote.lanceInicial),
          dataFim: new Date(novoLote.dataFim).toISOString(),
          fotosUrls,
          videosUrls,
        }),
      });

      if (res.ok) {
        toast.success('Lote criado com sucesso!');
        setNovoLoteModal(false);
        setNovoLote({
          titulo: '',
          descricao: '',
          origem: '',
          lanceInicial: '',
          dataFim: '',
        });
        setUploadedPhotos([]);
        setUploadedVideo(null);
        loadLotes();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao criar lote');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar lote');
    } finally {
      setCriandoLote(false);
    }
  };

  // Função para abrir modal de edição
  const handleAbrirEdicao = (lote: any) => {
    setEditandoLote({
      ...lote,
      lanceInicial: lote.lanceInicial?.toString() || '',
      dataFim: lote.dataFim ? new Date(lote.dataFim).toISOString().slice(0, 16) : '',
    });
    setEditPhotos(
      (lote.fotosUrls || []).map((url: string, i: number) => ({ url, name: `Foto ${i + 1}` }))
    );
    setEditVideo(
      lote.videosUrls?.[0] ? { url: lote.videosUrls[0], name: 'Vídeo do lote' } : null
    );
    setEditandoModal(true);
  };

  // Função para salvar edição
  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoLote) return;
    
    setSalvandoEdicao(true);
    
    try {
      const fotosUrls = editPhotos
        .map(p => p.url)
        .filter(url => url && url.trim() !== '');
      const videosUrls = editVideo?.url 
        ? [editVideo.url].filter(url => url && url.trim() !== '') 
        : [];

      const res = await fetch('/api/admin/lotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editandoLote.id,
          titulo: editandoLote.titulo,
          descricao: editandoLote.descricao,
          origem: editandoLote.origem || null,
          lanceInicial: parseFloat(editandoLote.lanceInicial),
          dataFim: new Date(editandoLote.dataFim).toISOString(),
          fotosUrls,
          videosUrls,
        }),
      });

      if (res.ok) {
        toast.success('Lote atualizado com sucesso!');
        setEditandoModal(false);
        setEditandoLote(null);
        setEditPhotos([]);
        setEditVideo(null);
        loadLotes();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao atualizar lote');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar lote');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  // Função para upload de foto na edição
  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const remainingSlots = 20 - editPhotos.length;
    if (remainingSlots <= 0) {
      toast.error('Limite de 20 fotos atingido');
      return;
    }
    
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploadingPhoto(true);
    
    try {
      for (const file of filesToUpload) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} muito grande (max 10MB)`);
          continue;
        }
        
        const presignedRes = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            isPublic: true,
          }),
        });
        
        if (!presignedRes.ok) continue;
        
        const { uploadUrl, cloud_storage_path } = await presignedRes.json();
        
        const urlParams = new URLSearchParams(uploadUrl.split('?')[1]);
        const signedHeaders = urlParams.get('X-Amz-SignedHeaders') || '';
        const headers: Record<string, string> = { 'Content-Type': file.type };
        if (signedHeaders.includes('content-disposition')) {
          headers['Content-Disposition'] = 'attachment';
        }
        
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers,
          body: file,
        });
        
        if (!uploadRes.ok) continue;
        
        const completeRes = await fetch('/api/upload/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cloud_storage_path,
            isPublic: true,
          }),
        });
        
        if (completeRes.ok) {
          const { url } = await completeRes.json();
          setEditPhotos(prev => [...prev, { url, name: file.name }]);
        }
      }
      
      toast.success('Fotos enviadas!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar fotos');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Função para abrir visualização detalhada
  const handleVerDetalhes = async (lote: any) => {
    try {
      // Buscar dados completos do lote incluindo lances e arrematante
      const res = await fetch(`/api/lotes/${lote.id}`);
      if (res.ok) {
        const data = await res.json();
        setVisualizandoLote(data.lote || lote);
      } else {
        setVisualizandoLote(lote);
      }
      setVisualizandoModal(true);
    } catch (error) {
      setVisualizandoLote(lote);
      setVisualizandoModal(true);
    }
  };

  const handleDeletarLote = async (loteId: string) => {
    if (!confirm('Tem certeza que deseja excluir este lote?')) return;
    
    setDeletando(loteId);
    try {
      const res = await fetch('/api/admin/lotes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loteId }),
      });

      if (res.ok) {
        toast.success('Lote excluído com sucesso!');
        loadLotes();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao excluir lote');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir lote');
    } finally {
      setDeletando(null);
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
              Gerenciar Lotes
            </h1>
            <p className="text-lg text-gray-600">
              Total de lotes: {lotes.length}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setNovoLoteModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Lote
            </Button>
            <Link href="/admin">
              <Button variant="outline">Voltar ao Admin</Button>
            </Link>
          </div>
        </div>

        {/* Info das taxas */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Taxas aplicadas automaticamente:</strong> 5% comissão do leiloeiro + 2% taxa administrativa
          </p>
        </div>

        {lotes.length > 0 ? (
          <div className="grid gap-4">
            {lotes.map((lote) => (
              <Card key={lote.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-sm bg-[#2c5282] text-white px-2 py-0.5 rounded">
                        {formatNumeroLote(lote.numero || 0)}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {lote.titulo}
                      </h3>
                      {lote.origem && (
                        <Badge variant="outline" className="border-orange-500 text-orange-600">
                          <Tag className="w-3 h-3 mr-1" />
                          {lote.origem}
                        </Badge>
                      )}
                      {lote.status === 'ativo' && (
                        <Badge className="bg-green-600">Ativo</Badge>
                      )}
                      {lote.status === 'finalizado' && (
                        <Badge className="bg-blue-600">Finalizado</Badge>
                      )}
                      {lote.status === 'cancelado' && (
                        <Badge variant="destructive">Cancelado</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {lote.descricao}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Lance Inicial:</span>
                        <p className="font-semibold">R$ {lote.lanceInicial?.toFixed(2) ?? '0.00'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Lance Atual:</span>
                        <p className="font-semibold text-green-600">R$ {(lote.lanceAtual ?? lote.lanceInicial ?? 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Lances:</span>
                        <p className="font-semibold">{lote._count?.lances ?? 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Valor Total (c/ taxas):</span>
                        <p className="font-semibold text-[#2c5282]">
                          R$ {((lote.lanceAtual ?? lote.lanceInicial ?? 0) * 1.07).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {/* Botão Ver Detalhes - sempre visível */}
                    <Button
                      onClick={() => handleVerDetalhes(lote)}
                      variant="outline"
                      size="sm"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    
                    {/* Botão Editar - visível para lotes ativos */}
                    {lote.status === 'ativo' && (
                      <Button
                        onClick={() => handleAbrirEdicao(lote)}
                        variant="outline"
                        size="sm"
                        className="border-orange-500 text-orange-600 hover:bg-orange-50"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )}
                    
                    {lote.status === 'ativo' && (lote._count?.lances ?? 0) > 0 && (
                      <Button
                        onClick={() => handleFinalizarLote(lote.id)}
                        disabled={finalizando === lote.id}
                        className="bg-[#2c5282] hover:bg-[#1e3a5f]"
                        size="sm"
                      >
                        {finalizando === lote.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trophy className="w-4 h-4 mr-2" />
                        )}
                        Finalizar
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeletarLote(lote.id)}
                      disabled={deletando === lote.id}
                      variant="destructive"
                      size="sm"
                    >
                      {deletando === lote.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum lote cadastrado</p>
          </div>
        )}

        {/* Modal de Novo Lote */}
        <Dialog open={novoLoteModal} onOpenChange={setNovoLoteModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#2c5282]">
                <Plus className="w-6 h-6" />
                Criar Novo Lote
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCriarLote} className="space-y-6">
              {/* Título com botão de IA */}
              <div>
                <Label htmlFor="titulo">Título do Lote *</Label>
                <div className="flex gap-2">
                  <Input
                    id="titulo"
                    value={novoLote.titulo}
                    onChange={(e) => setNovoLote({ ...novoLote, titulo: e.target.value })}
                    placeholder="Ex: 10 Panelas Elétricas Mondial"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleSugerirIA}
                    disabled={sugerindo || novoLote.titulo.length < 3}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    title="Preencher com IA"
                  >
                    {sugerindo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Digite o título e clique no botão de IA para sugerir descrição, origem e lance inicial
                </p>
              </div>

              {/* Campo de Origem com categorias clicáveis */}
              <div>
                <Label htmlFor="origem" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Origem do Lote
                </Label>
                <Input
                  id="origem"
                  value={novoLote.origem}
                  onChange={(e) => setNovoLote({ ...novoLote, origem: e.target.value })}
                  placeholder="Selecione ou digite a origem"
                  className="mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS_ORIGEM.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNovoLote({ ...novoLote, origem: cat })}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        novoLote.origem === cat
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-orange-100 hover:border-orange-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={novoLote.descricao}
                  onChange={(e) => setNovoLote({ ...novoLote, descricao: e.target.value })}
                  placeholder="Descreva detalhadamente o lote..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lanceInicial">Lance Inicial (R$) *</Label>
                  <Input
                    id="lanceInicial"
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoLote.lanceInicial}
                    onChange={(e) => setNovoLote({ ...novoLote, lanceInicial: e.target.value })}
                    placeholder="1000.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dataFim">Data/Hora de Encerramento *</Label>
                  <Input
                    id="dataFim"
                    type="datetime-local"
                    value={novoLote.dataFim}
                    onChange={(e) => setNovoLote({ ...novoLote, dataFim: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Seção de Upload de Fotos */}
              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-5 h-5" />
                  Fotos do Lote (máx. 20 fotos)
                </Label>
                
                <div className="space-y-3">
                  {/* Botão de Upload */}
                  <div className="flex gap-2">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto || uploadedPhotos.length >= 20}
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Enviar Fotos
                    </Button>
                    <span className="text-sm text-gray-500 self-center">
                      {uploadedPhotos.length}/20 fotos
                    </span>
                  </div>

                  {/* Gerar Banner com IA */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Label className="flex items-center gap-2 mb-2 text-purple-800">
                      <Sparkles className="w-4 h-4" />
                      Gerar Banner com IA
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={bannerPrompt}
                        onChange={(e) => setBannerPrompt(e.target.value)}
                        placeholder="Ex: Banner para leilão de carros usados"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleGenerateBanner}
                        disabled={generatingBanner || uploadedPhotos.length >= 20}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {generatingBanner ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Gerar
                      </Button>
                    </div>
                  </div>

                  {/* Grid de Fotos */}
                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {uploadedPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square relative bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={photo.url}
                              alt={photo.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Seção de Upload de Vídeo */}
              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-3">
                  <Video className="w-5 h-5" />
                  Vídeo do Lote (máx. 1 vídeo, 100MB)
                </Label>
                
                <div className="space-y-3">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  
                  {!uploadedVideo ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={uploadingVideo}
                    >
                      {uploadingVideo ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Enviar Vídeo
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                      <Video className="w-8 h-8 text-gray-500" />
                      <span className="flex-1 truncate">{uploadedVideo.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeVideo}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={criandoLote}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {criandoLote ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Criar Lote
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNovoLoteModal(false);
                    setNovoLote({
                      titulo: '',
                      descricao: '',
                      origem: '',
                      lanceInicial: '',
                      dataFim: '',
                    });
                    setUploadedPhotos([]);
                    setUploadedVideo(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de Resumo do Lote Finalizado */}
        <Dialog open={!!resumoModal} onOpenChange={() => setResumoModal(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#2c5282]">
                <Trophy className="w-6 h-6" />
                Lote Arrematado com Sucesso!
              </DialogTitle>
            </DialogHeader>

            {resumoModal && (
              <div className="space-y-6">
                {/* Dados do Lote */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Lote</h4>
                  <p className="font-medium">{resumoModal.resumo.lote.titulo}</p>
                </div>

                {/* Dados do Arrematante */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Arrematante</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Nome:</span> {resumoModal.resumo.arrematante.nome}</p>
                    <p><span className="text-gray-500">CPF:</span> {resumoModal.resumo.arrematante.cpf}</p>
                    <p><span className="text-gray-500">Telefone:</span> {resumoModal.resumo.arrematante.telefone}</p>
                    <p><span className="text-gray-500">Email:</span> {resumoModal.resumo.arrematante.email}</p>
                  </div>
                  <p className="text-sm mt-2"><span className="text-gray-500">Endereço:</span> {resumoModal.resumo.arrematante.endereco}</p>
                </div>

                {/* Valores */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Valores</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Valor do Lance:</span>
                      <span className="font-medium">{formatCurrency(resumoModal.resumo.valores.valorLance)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Taxa Leiloeiro (5%):</span>
                      <span>{formatCurrency(resumoModal.resumo.valores.taxaLeiloeiro)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Taxa Administrativa (2%):</span>
                      <span>{formatCurrency(resumoModal.resumo.valores.taxaAdministrativa)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>VALOR TOTAL:</span>
                      <span className="text-green-600">{formatCurrency(resumoModal.resumo.valores.valorTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Texto para envio */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">Texto para Envio</h4>
                    <Button variant="outline" size="sm" onClick={handleCopyText}>
                      {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                  <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40 whitespace-pre-wrap">
                    {resumoModal.textoResumo}
                  </pre>
                </div>

                {/* Botões de envio */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSendWhatsApp}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar via WhatsApp
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    variant="outline"
                    className="flex-1"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar via Email
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Lote */}
        <Dialog open={editandoModal} onOpenChange={(open) => {
          if (!open) {
            setEditandoModal(false);
            setEditandoLote(null);
            setEditPhotos([]);
            setEditVideo(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <Pencil className="w-6 h-6" />
                Editar Lote {editandoLote?.numero ? formatNumeroLote(editandoLote.numero) : ''}
              </DialogTitle>
            </DialogHeader>

            {editandoLote && (
              <form onSubmit={handleSalvarEdicao} className="space-y-6">
                {/* Título */}
                <div>
                  <Label htmlFor="edit-titulo">Título do Lote *</Label>
                  <Input
                    id="edit-titulo"
                    value={editandoLote.titulo}
                    onChange={(e) => setEditandoLote({ ...editandoLote, titulo: e.target.value })}
                    required
                  />
                </div>

                {/* Origem */}
                <div>
                  <Label htmlFor="edit-origem" className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Origem do Lote
                  </Label>
                  <Input
                    id="edit-origem"
                    value={editandoLote.origem || ''}
                    onChange={(e) => setEditandoLote({ ...editandoLote, origem: e.target.value })}
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS_ORIGEM.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEditandoLote({ ...editandoLote, origem: cat })}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                          editandoLote.origem === cat
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-orange-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <Label htmlFor="edit-descricao">Descrição *</Label>
                  <Textarea
                    id="edit-descricao"
                    value={editandoLote.descricao}
                    onChange={(e) => setEditandoLote({ ...editandoLote, descricao: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-lanceInicial">Lance Inicial (R$) *</Label>
                    <Input
                      id="edit-lanceInicial"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editandoLote.lanceInicial}
                      onChange={(e) => setEditandoLote({ ...editandoLote, lanceInicial: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-dataFim">Data/Hora de Encerramento *</Label>
                    <Input
                      id="edit-dataFim"
                      type="datetime-local"
                      value={editandoLote.dataFim}
                      onChange={(e) => setEditandoLote({ ...editandoLote, dataFim: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Fotos */}
                <div className="border-t pt-4">
                  <Label className="flex items-center gap-2 mb-3">
                    <ImageIcon className="w-5 h-5" />
                    Fotos do Lote ({editPhotos.length}/20)
                  </Label>
                  
                  <div className="space-y-3">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEditPhotoUpload}
                        className="hidden"
                        id="edit-photo-input"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('edit-photo-input')?.click()}
                        disabled={uploadingPhoto || editPhotos.length >= 20}
                      >
                        {uploadingPhoto ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Adicionar Fotos
                      </Button>
                    </div>

                    {editPhotos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {editPhotos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square relative bg-gray-100 rounded overflow-hidden">
                              <Image
                                src={photo.url}
                                alt={photo.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditPhotos(prev => prev.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={salvandoEdicao}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {salvandoEdicao ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Salvar Alterações
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditandoModal(false);
                      setEditandoLote(null);
                      setEditPhotos([]);
                      setEditVideo(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Visualização Detalhada */}
        <Dialog open={visualizandoModal} onOpenChange={(open) => {
          if (!open) {
            setVisualizandoModal(false);
            setVisualizandoLote(null);
          }
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#2c5282]">
                <FileText className="w-6 h-6" />
                Detalhes do Lote {visualizandoLote?.numero ? formatNumeroLote(visualizandoLote.numero) : ''}
              </DialogTitle>
            </DialogHeader>

            {visualizandoLote && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  {visualizandoLote.status === 'ativo' && (
                    <Badge className="bg-green-600 text-lg px-4 py-1">Ativo</Badge>
                  )}
                  {visualizandoLote.status === 'finalizado' && (
                    <Badge className="bg-blue-600 text-lg px-4 py-1">Finalizado</Badge>
                  )}
                  {visualizandoLote.status === 'cancelado' && (
                    <Badge variant="destructive" className="text-lg px-4 py-1">Cancelado</Badge>
                  )}
                  {visualizandoLote.origem && (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      <Tag className="w-3 h-3 mr-1" />
                      {visualizandoLote.origem}
                    </Badge>
                  )}
                </div>

                {/* Título e Descrição */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{visualizandoLote.titulo}</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{visualizandoLote.descricao}</p>
                </div>

                {/* Informações Financeiras */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Valores
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Lance Inicial:</span>
                      <p className="font-semibold text-lg">R$ {visualizandoLote.lanceInicial?.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Lance Atual:</span>
                      <p className="font-semibold text-lg text-green-600">
                        R$ {(visualizandoLote.lanceAtual ?? visualizandoLote.lanceInicial ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total de Lances:</span>
                      <p className="font-semibold text-lg">{visualizandoLote.lances?.length ?? visualizandoLote._count?.lances ?? 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Valor Total (c/ taxas):</span>
                      <p className="font-semibold text-lg text-[#2c5282]">
                        R$ {((visualizandoLote.lanceAtual ?? visualizandoLote.lanceInicial ?? 0) * 1.07).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datas */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Datas
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Início:</span>
                      <p className="font-semibold">
                        {new Date(visualizandoLote.dataInicio).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Encerramento:</span>
                      <p className="font-semibold">
                        {new Date(visualizandoLote.dataFim).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Arrematante (se finalizado) */}
                {visualizandoLote.status === 'finalizado' && visualizandoLote.lances && visualizandoLote.lances.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      Arrematante
                    </h4>
                    {(() => {
                      const ultimoLance = visualizandoLote.lances.sort(
                        (a: any, b: any) => b.valor - a.valor
                      )[0];
                      const arrematante = ultimoLance?.user;
                      if (!arrematante) return <p className="text-gray-500">Dados do arrematante não disponíveis</p>;
                      
                      return (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Nome:</span>
                            <p className="font-semibold">{arrematante.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <p className="font-semibold">{arrematante.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">CPF:</span>
                            <p className="font-semibold">{arrematante.cpf}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Telefone:</span>
                            <p className="font-semibold">{arrematante.telefone}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Endereço:</span>
                            <p className="font-semibold">
                              {arrematante.endereco}, {arrematante.numero} {arrematante.complemento ? `- ${arrematante.complemento}` : ''}<br />
                              {arrematante.bairro} - {arrematante.cidade}/{arrematante.estado} - CEP: {arrematante.cep}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Lance Vencedor:</span>
                            <p className="font-bold text-green-600 text-lg">R$ {ultimoLance.valor.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Fotos */}
                {visualizandoLote.fotosUrls && visualizandoLote.fotosUrls.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Fotos ({visualizandoLote.fotosUrls.length})
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {visualizandoLote.fotosUrls.map((url: string, index: number) => (
                        <div key={index} className="aspect-square relative bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={url}
                            alt={`Foto ${index + 1}`}
                            fill
                            className="object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(url, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vídeos */}
                {visualizandoLote.videosUrls && visualizandoLote.videosUrls.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Vídeos
                    </h4>
                    <div className="space-y-2">
                      {visualizandoLote.videosUrls.map((url: string, index: number) => (
                        <video key={index} controls className="w-full rounded-lg max-h-64">
                          <source src={url} type="video/mp4" />
                          Seu navegador não suporta vídeos.
                        </video>
                      ))}
                    </div>
                  </div>
                )}

                {/* Histórico de Lances */}
                {visualizandoLote.lances && visualizandoLote.lances.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Histórico de Lances ({visualizandoLote.lances.length})
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {visualizandoLote.lances
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((lance: any, index: number) => (
                          <div key={lance.id} className={`flex justify-between items-center p-2 rounded ${index === 0 ? 'bg-green-100' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{lance.user?.name || 'Usuário'}</span>
                            </div>
                            <div className="text-right">
                              <span className={`font-semibold ${index === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                                R$ {lance.valor.toFixed(2)}
                              </span>
                              <p className="text-xs text-gray-500">
                                {new Date(lance.createdAt).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  {visualizandoLote.status === 'ativo' && (
                    <Button
                      onClick={() => {
                        setVisualizandoModal(false);
                        handleAbrirEdicao(visualizandoLote);
                      }}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar Lote
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVisualizandoModal(false);
                      setVisualizandoLote(null);
                    }}
                    className="flex-1"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
