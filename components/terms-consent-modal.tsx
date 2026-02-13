'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AlertTriangle, FileText, Shield, Cookie } from 'lucide-react';

export function TermsConsentModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedCookies, setAcceptedCookies] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verificar se o usuário já aceitou os termos
    const consent = localStorage.getItem('termos_aceitos');
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (acceptedTerms && acceptedPrivacy && acceptedCookies) {
      localStorage.setItem('termos_aceitos', new Date().toISOString());
      localStorage.setItem('cookies_consent', 'accepted');
      setOpen(false);
    }
  };

  const allAccepted = acceptedTerms && acceptedPrivacy && acceptedCookies;

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2c5282] flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Termos de Uso e Políticas
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Para utilizar a plataforma Leilões Reversa, você precisa ler e aceitar nossos termos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Aviso de Penalidades */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h3 className="font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              AVISO IMPORTANTE
            </h3>
            <p className="text-red-700 text-sm mt-2">
              Ao participar dos leilões, você assume o compromisso de pagar pelos lotes arrematados. 
              <strong> A desistência ou inadimplência resultará em:</strong>
            </p>
            <ul className="text-red-700 text-sm mt-2 list-disc list-inside space-y-1">
              <li>Multa de 20% sobre o valor do lance</li>
              <li>Pagamento das taxas (5% leiloeiro + 2% administrativa)</li>
              <li>Bloqueio na plataforma</li>
              <li>Cobrança judicial e possível processo criminal</li>
            </ul>
          </div>

          {/* Taxas */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-800">Taxas Aplicáveis</h3>
            <p className="text-blue-700 text-sm mt-1">
              Além do valor do lance vencedor, o arrematante pagará:
            </p>
            <ul className="text-blue-700 text-sm mt-1">
              <li>• <strong>5%</strong> de comissão do leiloeiro</li>
              <li>• <strong>2%</strong> de taxa administrativa</li>
            </ul>
          </div>

          {/* Checkboxes de aceite */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox 
                id="terms" 
                checked={acceptedTerms} 
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm cursor-pointer">
                <span className="flex items-center gap-2 font-medium text-gray-900">
                  <FileText className="w-4 h-4 text-[#2c5282]" />
                  Termos de Uso
                </span>
                <span className="text-gray-600 block mt-1">
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" className="text-[#2c5282] underline hover:text-[#1e3a5f]">
                    Termos de Uso
                  </Link>
                  , incluindo as penalidades por desistência ou inadimplência.
                </span>
              </label>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox 
                id="privacy" 
                checked={acceptedPrivacy} 
                onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
              />
              <label htmlFor="privacy" className="text-sm cursor-pointer">
                <span className="flex items-center gap-2 font-medium text-gray-900">
                  <Shield className="w-4 h-4 text-[#2c5282]" />
                  Política de Privacidade
                </span>
                <span className="text-gray-600 block mt-1">
                  Li e aceito a{' '}
                  <Link href="/privacidade" target="_blank" className="text-[#2c5282] underline hover:text-[#1e3a5f]">
                    Política de Privacidade
                  </Link>
                  {' '}e autorizo o tratamento dos meus dados conforme a LGPD.
                </span>
              </label>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox 
                id="cookies" 
                checked={acceptedCookies} 
                onCheckedChange={(checked) => setAcceptedCookies(checked as boolean)}
              />
              <label htmlFor="cookies" className="text-sm cursor-pointer">
                <span className="flex items-center gap-2 font-medium text-gray-900">
                  <Cookie className="w-4 h-4 text-[#2c5282]" />
                  Política de Cookies
                </span>
                <span className="text-gray-600 block mt-1">
                  Li e aceito a{' '}
                  <Link href="/cookies" target="_blank" className="text-[#2c5282] underline hover:text-[#1e3a5f]">
                    Política de Cookies
                  </Link>
                  {' '}e autorizo o uso de cookies necessários.
                </span>
              </label>
            </div>
          </div>

          <Button 
            onClick={handleAccept} 
            disabled={!allAccepted}
            className="w-full bg-[#2c5282] hover:bg-[#1e3a5f] disabled:bg-gray-300 disabled:cursor-not-allowed"
            size="lg"
          >
            {allAccepted ? 'Aceitar e Continuar' : 'Marque todas as opções para continuar'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Ao aceitar, você confirma que leu e compreendeu todos os documentos acima.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
