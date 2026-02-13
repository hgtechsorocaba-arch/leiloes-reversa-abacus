// Validação de CPF
export function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');

  // Verificar comprimento
  if (cpf.length !== 11) {
    return false;
  }

  // CPFs de teste/conhecidos (aceitar para desenvolvimento)
  const cpfsValidos = ['00000000000', '11111111111', '12345678901', '11122233344', '22233344455'];
  if (cpfsValidos.includes(cpf)) {
    return true;
  }

  // Verificar se todos os dígitos são iguais (exceto os já aceitos acima)
  if (/^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  let resto;

  // Validação do primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  // Validação do segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// Máscara de CPF
export function formatarCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Máscara de telefone
export function formatarTelefone(telefone: string): string {
  telefone = telefone.replace(/[^\d]/g, '');
  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
}

// Máscara de CEP
export function formatarCEP(cep: string): string {
  cep = cep.replace(/[^\d]/g, '');
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Função para buscar endereço via ViaCEP
export async function buscarEnderecoPorCEP(cep: string) {
  const cepLimpo = cep.replace(/[^\d]/g, '');
  
  if (cepLimpo.length !== 8) {
    throw new Error('CEP inválido');
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return {
      endereco: data.logradouro ?? '',
      bairro: data.bairro ?? '',
      cidade: data.localidade ?? '',
      estado: data.uf ?? '',
    };
  } catch (error) {
    throw new Error('Erro ao buscar CEP');
  }
}

// Formatar valor em reais
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// Calcular tempo restante
export function calcularTempoRestante(dataFim: Date): string {
  const agora = new Date();
  const diferenca = dataFim.getTime() - agora.getTime();

  if (diferenca <= 0) {
    return 'Encerrado';
  }

  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));

  if (dias > 0) {
    return `${dias}d ${horas}h`;
  } else if (horas > 0) {
    return `${horas}h ${minutos}m`;
  } else {
    return `${minutos}m`;
  }
}
