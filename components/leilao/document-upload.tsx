'use client';

import { useState } from 'react';
import { Upload, FileCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface DocumentUploadProps {
  label: string;
  docType: 'docFrenteUrl' | 'docVersoUrl' | 'selfieUrl';
  onUploadComplete: (url: string, docType: string) => void;
  value?: string;
}

export function DocumentUpload({ label, docType, onUploadComplete, value }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(!!value);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    setUploading(true);

    try {
      // Obter URL presigned
      const presignedRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          isPublic: false,
          forSignup: true, // Permite upload durante o cadastro sem autenticação
        }),
      });

      if (!presignedRes.ok) {
        throw new Error('Erro ao obter URL de upload');
      }

      const { uploadUrl, cloud_storage_path } = await presignedRes.json();

      // Verificar se precisa enviar Content-Disposition header
      const url = new URL(uploadUrl);
      const signedHeaders = url.searchParams.get('X-Amz-SignedHeaders');
      const needsContentDisposition = signedHeaders?.includes('content-disposition');

      // Fazer upload
      const headers: HeadersInit = {
        'Content-Type': file.type,
      };
      
      if (needsContentDisposition) {
        headers['Content-Disposition'] = 'attachment';
      }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      // Confirmar upload
      const completeRes = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloud_storage_path,
          isPublic: false,
          docType,
          forSignup: true, // Permite confirmação durante o cadastro sem autenticação
        }),
      });

      if (!completeRes.ok) {
        throw new Error('Erro ao confirmar upload');
      }

      setUploaded(true);
      onUploadComplete(cloud_storage_path, docType);
      toast.success('Documento enviado com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 hover:border-[#2c5282] transition-colors">
      <CardContent className="p-6">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading || uploaded}
          />
          <div className="flex flex-col items-center justify-center gap-3">
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-[#2c5282] animate-spin" />
                <p className="text-sm text-gray-600">Enviando...</p>
              </>
            ) : uploaded ? (
              <>
                <FileCheck className="w-10 h-10 text-green-600" />
                <p className="text-sm font-semibold text-green-600">{label}</p>
                <p className="text-xs text-gray-500">Enviado com sucesso</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">{label}</p>
                <Button type="button" variant="outline" size="sm" className="mt-2">
                  Selecionar arquivo
                </Button>
              </>
            )}
          </div>
        </label>
      </CardContent>
    </Card>
  );
}
