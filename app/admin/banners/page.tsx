'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Image as ImageIcon, Plus, Trash2, Upload, Sparkles, X, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Banner {
  id: string;
  titulo: string | null;
  imageUrl: string;
  link: string | null;
  ordem: number;
  ativo: boolean;
}

export default function AdminBannersPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [iaModal, setIaModal] = useState(false);
  const [criando, setCriando] = useState(false);
  const [deletando, setDeletando] = useState<string | null>(null);
  
  const [uploadingQuick, setUploadingQuick] = useState(false);
  const [bannerPrompt, setBannerPrompt] = useState('');
  const [generatingBanner, setGeneratingBanner] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const quickUploadRef = useRef<HTMLInputElement>(null);
  
  const [iaBanner, setIaBanner] = useState({
    titulo: '',
    link: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.email !== 'admin@reversa.com') {
        router.push('/');
      } else {
        loadBanners();
      }
    }
  }, [status, session, router]);

  const loadBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners');
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners ?? []);
      }
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload Rápido - Cria banner automaticamente após upload
  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande (max 10MB)');
      return;
    }
    
    setUploadingQuick(true);
    
    try {
      // 1. Obter URL pré-assinada
      const presignedRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          forSignup: true,
        }),
      });
      
      if (!presignedRes.ok) {
        toast.error('Erro ao preparar upload');
        return;
      }
      
      const { uploadUrl, cloud_storage_path } = await presignedRes.json();
      
      // 2. Fazer upload
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
        toast.error('Erro ao enviar imagem');
        return;
      }
      
      // 3. Completar upload
      const completeRes = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloud_storage_path,
          isPublic: true,
          forSignup: true,
        }),
      });
      
      if (!completeRes.ok) {
        toast.error('Erro ao finalizar upload');
        return;
      }
      
      const { url } = await completeRes.json();
      
      // 4. Criar banner automaticamente
      const fileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      
      const bannerRes = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: fileName,
          imageUrl: url,
          link: null,
          ordem: banners.length,
        }),
      });

      if (bannerRes.ok) {
        toast.success('Banner adicionado com sucesso!');
        loadBanners();
      } else {
        toast.error('Erro ao criar banner');
      }
    } catch (error) {
      console.error('Erro no upload rápido:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploadingQuick(false);
      if (quickUploadRef.current) quickUploadRef.current.value = '';
    }
  };

  const handleGenerateBanner = async () => {
    if (!bannerPrompt.trim()) {
      toast.error('Digite uma descrição para o banner');
      return;
    }
    
    setGeneratingBanner(true);
    
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Crie um banner profissional para site de leilão: ${bannerPrompt}. Estilo moderno, cores vibrantes, alta qualidade, sem texto.`,
          aspectRatio: '16:9',
        }),
      });
      
      if (!res.ok) {
        toast.error('Erro ao gerar banner');
        return;
      }
      
      const data = await res.json();
      
      if (data.image) {
        setGeneratedImage(data.image);
        setIaBanner({ ...iaBanner, titulo: bannerPrompt });
        toast.success('Banner gerado! Clique em "Criar Banner" para adicionar.');
      }
    } catch (error) {
      console.error('Erro ao gerar banner:', error);
      toast.error('Erro ao gerar banner');
    } finally {
      setGeneratingBanner(false);
    }
  };

  const handleCriarBannerIA = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!generatedImage) {
      toast.error('Gere um banner com IA primeiro');
      return;
    }
    
    setCriando(true);

    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: iaBanner.titulo || null,
          imageUrl: generatedImage,
          link: iaBanner.link || null,
          ordem: banners.length,
        }),
      });

      if (res.ok) {
        toast.success('Banner criado com sucesso!');
        setIaModal(false);
        setIaBanner({ titulo: '', link: '' });
        setGeneratedImage(null);
        setBannerPrompt('');
        loadBanners();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao criar banner');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar banner');
    } finally {
      setCriando(false);
    }
  };

  const handleToggleAtivo = async (banner: Banner) => {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: banner.id,
          ativo: !banner.ativo,
        }),
      });

      if (res.ok) {
        toast.success(banner.ativo ? 'Banner desativado' : 'Banner ativado');
        loadBanners();
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar banner');
    }
  };

  const handleDeletarBanner = async (bannerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;
    
    setDeletando(bannerId);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId }),
      });

      if (res.ok) {
        toast.success('Banner excluído!');
        loadBanners();
      } else {
        toast.error('Erro ao excluir banner');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir banner');
    } finally {
      setDeletando(null);
    }
  };

  const handleMoverBanner = async (banner: Banner, direcao: 'up' | 'down') => {
    const index = banners.findIndex(b => b.id === banner.id);
    if (direcao === 'up' && index === 0) return;
    if (direcao === 'down' && index === banners.length - 1) return;

    const novaOrdem = direcao === 'up' ? banner.ordem - 1 : banner.ordem + 1;
    const outroBanner = banners[direcao === 'up' ? index - 1 : index + 1];

    try {
      await Promise.all([
        fetch('/api/admin/banners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: banner.id, ordem: novaOrdem }),
        }),
        fetch('/api/admin/banners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: outroBanner.id, ordem: banner.ordem }),
        }),
      ]);
      loadBanners();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao reordenar banners');
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
              Gerenciar Banners
            </h1>
            <p className="text-lg text-gray-600">
              Banners exibidos na página inicial
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIaModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar com IA
            </Button>
            <Link href="/admin">
              <Button variant="outline">Voltar ao Admin</Button>
            </Link>
          </div>
        </div>

        {banners.length > 0 ? (
          <div className="space-y-4">
            {banners.map((banner, index) => (
              <Card key={banner.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoverBanner(banner, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoverBanner(banner, 'down')}
                      disabled={index === banners.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="w-48 h-28 relative bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.titulo || 'Banner'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {banner.titulo || 'Sem título'}
                    </h3>
                    {banner.link && (
                      <p className="text-sm text-gray-500 truncate">
                        Link: {banner.link}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={banner.ativo ? 'bg-green-600' : 'bg-gray-400'}>
                        {banner.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <span className="text-xs text-gray-400">Ordem: {banner.ordem}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`ativo-${banner.id}`} className="text-sm">Ativo</Label>
                      <Switch
                        id={`ativo-${banner.id}`}
                        checked={banner.ativo}
                        onCheckedChange={() => handleToggleAtivo(banner)}
                      />
                    </div>
                    <Button
                      onClick={() => handleDeletarBanner(banner.id)}
                      disabled={deletando === banner.id}
                      variant="destructive"
                      size="sm"
                    >
                      {deletando === banner.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum banner cadastrado</p>
          </div>
        )}

        {/* Área de Upload Rápido */}
        <Card className="mt-6 p-6 border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors">
          <input
            ref={quickUploadRef}
            type="file"
            accept="image/*"
            onChange={handleQuickUpload}
            className="hidden"
          />
          <div 
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => !uploadingQuick && quickUploadRef.current?.click()}
          >
            {uploadingQuick ? (
              <>
                <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-3" />
                <p className="text-gray-600 font-medium">Enviando e criando banner...</p>
              </>
            ) : (
              <>
                <div className="p-4 bg-green-100 rounded-full mb-3">
                  <Upload className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-900 font-semibold text-lg">Clique para fazer upload de banner</p>
                <p className="text-gray-500 text-sm mt-1">O banner será criado automaticamente após o upload</p>
                <p className="text-gray-400 text-xs mt-2">Formatos: JPG, PNG, WebP | Máx: 10MB</p>
              </>
            )}
          </div>
        </Card>

        {/* Modal de Geração com IA */}
        <Dialog open={iaModal} onOpenChange={setIaModal}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-700">
                <Sparkles className="w-6 h-6" />
                Gerar Banner com IA
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCriarBannerIA} className="space-y-4">
              {/* Gerar com IA */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <Label className="flex items-center gap-2 mb-3 text-purple-800 font-medium">
                  <Sparkles className="w-4 h-4" />
                  Descreva o banner que você quer
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={bannerPrompt}
                    onChange={(e) => setBannerPrompt(e.target.value)}
                    placeholder="Ex: Leilão de carros de luxo, eletrônicos..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateBanner}
                    disabled={generatingBanner}
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

              {/* Preview */}
              {generatedImage && (
                <div className="relative">
                  <Label className="mb-2 block">Banner Gerado:</Label>
                  <div className="aspect-video relative bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={generatedImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneratedImage(null)}
                    className="absolute top-6 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {generatedImage && (
                <>
                  <div>
                    <Label htmlFor="titulo">Título (opcional)</Label>
                    <Input
                      id="titulo"
                      value={iaBanner.titulo}
                      onChange={(e) => setIaBanner({ ...iaBanner, titulo: e.target.value })}
                      placeholder="Ex: Promoção de Verão"
                    />
                  </div>

                  <div>
                    <Label htmlFor="link">Link (opcional)</Label>
                    <Input
                      id="link"
                      value={iaBanner.link}
                      onChange={(e) => setIaBanner({ ...iaBanner, link: e.target.value })}
                      placeholder="Ex: /lotes ou https://..."
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={criando || !generatedImage}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {criando ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Criar Banner
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIaModal(false);
                    setGeneratedImage(null);
                    setBannerPrompt('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}