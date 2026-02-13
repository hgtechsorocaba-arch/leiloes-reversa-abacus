'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatarCEP, buscarEnderecoPorCEP } from '@/lib/utils-extra';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddressFormProps {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  onCepChange: (cep: string) => void;
  onEnderecoChange: (endereco: string) => void;
  onNumeroChange: (numero: string) => void;
  onComplementoChange: (complemento: string) => void;
  onBairroChange: (bairro: string) => void;
  onCidadeChange: (cidade: string) => void;
  onEstadoChange: (estado: string) => void;
}

export function AddressForm({
  cep,
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  onCepChange,
  onEnderecoChange,
  onNumeroChange,
  onComplementoChange,
  onBairroChange,
  onCidadeChange,
  onEstadoChange,
}: AddressFormProps) {
  const [loading, setLoading] = useState(false);

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCEP(e.target.value);
    onCepChange(formatted);
  };

  useEffect(() => {
    const cepLimpo = cep.replace(/[^\d]/g, '');
    
    if (cepLimpo.length === 8) {
      setLoading(true);
      buscarEnderecoPorCEP(cep)
        .then((data) => {
          onEnderecoChange(data.endereco);
          onBairroChange(data.bairro);
          onCidadeChange(data.cidade);
          onEstadoChange(data.estado);
        })
        .catch((error) => {
          toast.error('CEP não encontrado');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [cep]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cep">CEP *</Label>
          <div className="relative">
            <Input
              id="cep"
              type="text"
              value={cep}
              onChange={handleCepChange}
              placeholder="00000-000"
              maxLength={9}
              required
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="numero">Número *</Label>
          <Input
            id="numero"
            type="text"
            value={numero}
            onChange={(e) => onNumeroChange(e.target.value)}
            placeholder="123"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="endereco">Endereço *</Label>
        <Input
          id="endereco"
          type="text"
          value={endereco}
          onChange={(e) => onEnderecoChange(e.target.value)}
          placeholder="Rua, Avenida..."
          required
        />
      </div>

      <div>
        <Label htmlFor="complemento">Complemento</Label>
        <Input
          id="complemento"
          type="text"
          value={complemento}
          onChange={(e) => onComplementoChange(e.target.value)}
          placeholder="Apto, Bloco..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bairro">Bairro *</Label>
          <Input
            id="bairro"
            type="text"
            value={bairro}
            onChange={(e) => onBairroChange(e.target.value)}
            placeholder="Bairro"
            required
          />
        </div>
        <div>
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            type="text"
            value={cidade}
            onChange={(e) => onCidadeChange(e.target.value)}
            placeholder="Cidade"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="estado">Estado *</Label>
        <Input
          id="estado"
          type="text"
          value={estado}
          onChange={(e) => onEstadoChange(e.target.value)}
          placeholder="SP"
          maxLength={2}
          required
        />
      </div>
    </div>
  );
}
