'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CpfInput } from '@/components/leilao/cpf-input';
import { AddressForm } from '@/components/leilao/address-form';
import { DocumentUpload } from '@/components/leilao/document-upload';
import { validarCPF, formatarTelefone } from '@/lib/utils-extra';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Dados do usuário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Endereço
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  
  // Documentos
  const [docFrenteUrl, setDocFrenteUrl] = useState('');
  const [docVersoUrl, setDocVersoUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatarTelefone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!validarCPF(cpf)) {
      toast.error('CPF inválido');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!docFrenteUrl || !docVersoUrl || !selfieUrl) {
      toast.error('Por favor, envie todos os documentos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          password,
          cpf,
          telefone,
          cep,
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          docFrenteUrl,
          docVersoUrl,
          selfieUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao realizar cadastro');
        return;
      }

      toast.success('Cadastro realizado com sucesso! Fazendo login...');

      // Fazer login automático
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Cadastro realizado, mas houve erro ao fazer login. Faça login manualmente.');
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-[#2c5282] rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Cadastro de Novo Usuário</CardTitle>
            <CardDescription className="text-base">
              Preencha todos os campos para criar sua conta e participar dos leilões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
                
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="João da Silva"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={telefone}
                      onChange={handleTelefoneChange}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <CpfInput value={cpf} onChange={setCpf} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua senha"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
                <AddressForm
                  cep={cep}
                  endereco={endereco}
                  numero={numero}
                  complemento={complemento}
                  bairro={bairro}
                  cidade={cidade}
                  estado={estado}
                  onCepChange={setCep}
                  onEnderecoChange={setEndereco}
                  onNumeroChange={setNumero}
                  onComplementoChange={setComplemento}
                  onBairroChange={setBairro}
                  onCidadeChange={setCidade}
                  onEstadoChange={setEstado}
                />
              </div>

              {/* Documentos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Documentos *</h3>
                <p className="text-sm text-gray-600">
                  Envie fotos nítidas dos seus documentos para validação do cadastro
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DocumentUpload
                    label="CNH/RG Frente"
                    docType="docFrenteUrl"
                    onUploadComplete={(url) => setDocFrenteUrl(url)}
                    value={docFrenteUrl}
                  />
                  <DocumentUpload
                    label="CNH/RG Verso"
                    docType="docVersoUrl"
                    onUploadComplete={(url) => setDocVersoUrl(url)}
                    value={docVersoUrl}
                  />
                  <DocumentUpload
                    label="Selfie com Documento"
                    docType="selfieUrl"
                    onUploadComplete={(url) => setSelfieUrl(url)}
                    value={selfieUrl}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2c5282] hover:bg-[#1e3a5f] text-white py-6 text-lg"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    'Finalizar Cadastro'
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-[#2c5282] hover:underline font-medium">
                  Faça login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
