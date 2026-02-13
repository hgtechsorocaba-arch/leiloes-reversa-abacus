import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const TAXA_LEILOEIRO = 0.05; // 5%
const TAXA_ADMINISTRATIVA = 0.02; // 2%

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se é admin
    if (!session?.user?.email || session.user.email !== 'admin@reversa.com') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { loteId } = body;

    if (!loteId) {
      return NextResponse.json({ error: 'ID do lote é obrigatório' }, { status: 400 });
    }

    // Buscar lote com lance vencedor
    const lote = await prisma.lote.findUnique({
      where: { id: loteId },
      include: {
        lances: {
          orderBy: { valor: 'desc' },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                telefone: true,
                cep: true,
                endereco: true,
                numero: true,
                complemento: true,
                bairro: true,
                cidade: true,
                estado: true,
              },
            },
          },
        },
      },
    });

    if (!lote) {
      return NextResponse.json({ error: 'Lote não encontrado' }, { status: 404 });
    }

    const lanceVencedor = lote.lances[0];

    if (!lanceVencedor) {
      return NextResponse.json({ error: 'Nenhum lance registrado para este lote' }, { status: 400 });
    }

    // Calcular valores
    const valorLance = lanceVencedor.valor;
    const taxaLeiloeiro = valorLance * TAXA_LEILOEIRO;
    const taxaAdm = valorLance * TAXA_ADMINISTRATIVA;
    const valorTotal = valorLance + taxaLeiloeiro + taxaAdm;

    // Formatar endereço completo
    const enderecoCompleto = [
      lanceVencedor.user.endereco,
      lanceVencedor.user.numero,
      lanceVencedor.user.complemento,
      lanceVencedor.user.bairro,
      `${lanceVencedor.user.cidade}/${lanceVencedor.user.estado}`,
      `CEP: ${lanceVencedor.user.cep}`,
    ].filter(Boolean).join(', ');

    // Gerar dados do resumo
    const resumo = {
      lote: {
        id: lote.id,
        titulo: lote.titulo,
        descricao: lote.descricao,
      },
      arrematante: {
        nome: lanceVencedor.user.name,
        email: lanceVencedor.user.email,
        cpf: lanceVencedor.user.cpf,
        telefone: lanceVencedor.user.telefone,
        endereco: enderecoCompleto,
      },
      valores: {
        valorLance: valorLance,
        taxaLeiloeiro: taxaLeiloeiro,
        taxaLeiloeiroPercentual: '5%',
        taxaAdministrativa: taxaAdm,
        taxaAdministrativaPercentual: '2%',
        valorTotal: valorTotal,
      },
      dataArremate: lanceVencedor.createdAt,
      dataGeracao: new Date(),
    };

    // Gerar texto formatado para WhatsApp/Email
    const textoResumo = `
🏆 *LEILÃO ARREMATADO - LEILÕES REVERSA*

📦 *LOTE:* ${lote.titulo}
📝 *Descrição:* ${lote.descricao}

👤 *ARREMATANTE:*
Nome: ${lanceVencedor.user.name}
CPF: ${lanceVencedor.user.cpf}
Telefone: ${lanceVencedor.user.telefone}
Email: ${lanceVencedor.user.email}
Endereço: ${enderecoCompleto}

💰 *VALORES:*
Valor do Lance: R$ ${valorLance.toFixed(2).replace('.', ',')}
Taxa Leiloeiro (5%): R$ ${taxaLeiloeiro.toFixed(2).replace('.', ',')}
Taxa Administrativa (2%): R$ ${taxaAdm.toFixed(2).replace('.', ',')}

💵 *VALOR TOTAL A PAGAR: R$ ${valorTotal.toFixed(2).replace('.', ',')}*

📅 Data da Arrematação: ${new Date(lanceVencedor.createdAt).toLocaleString('pt-BR')}

⚠️ *IMPORTANTE:*
- O pagamento deve ser realizado em até 48 horas
- A desistência está sujeita a multa de 20% + taxas
- A retirada deve ser feita em até 5 dias úteis após o pagamento

---
Leilões Reversa - Logística Reversa em Sorocaba
www.leiloesreversa.com.br
`.trim();

    // Atualizar status do lote
    await prisma.lote.update({
      where: { id: loteId },
      data: { status: 'finalizado' },
    });

    return NextResponse.json({
      resumo,
      textoResumo,
      telefoneArrematante: lanceVencedor.user.telefone,
      emailArrematante: lanceVencedor.user.email,
    });
  } catch (error) {
    console.error('Erro ao finalizar lote:', error);
    return NextResponse.json({ error: 'Erro ao finalizar lote' }, { status: 500 });
  }
}
