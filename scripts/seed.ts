import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar admin padrão (admin@reversa.com / adm123) com privilégios de admin
  const hashedAdminPassword = await bcrypt.hash('adm123', 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@reversa.com' },
    update: { password: hashedAdminPassword },
    create: {
      email: 'admin@reversa.com',
      password: hashedAdminPassword,
      nome: 'Administrador Principal',
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // Criar usuário admin também na tabela User para login via NextAuth
  const hashedUserPassword = await bcrypt.hash('adm123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@reversa.com' },
    update: { password: hashedUserPassword },
    create: {
      email: 'admin@reversa.com',
      password: hashedUserPassword,
      name: 'Administrador Principal',
      cpf: '88888888888',
      telefone: '(15) 99999-9999',
      cep: '18095-000',
      endereco: 'Rua Administrativa',
      numero: '1',
      bairro: 'Centro',
      cidade: 'Sorocaba',
      estado: 'SP',
      statusAprovacao: 'aprovado',
    },
  });
  console.log('✅ Usuário admin criado:', adminUser.email);

  // Criar alguns usuários de teste
  const usuarios = [
    {
      email: 'maria@exemplo.com',
      password: await bcrypt.hash('senha123', 10),
      name: 'Maria Silva',
      cpf: '11122233344',
      telefone: '(15) 98888-1111',
      cep: '18095-100',
      endereco: 'Av. General Carneiro',
      numero: '456',
      bairro: 'Alto da Boa Vista',
      cidade: 'Sorocaba',
      estado: 'SP',
      statusAprovacao: 'aprovado',
    },
    {
      email: 'jose@exemplo.com',
      password: await bcrypt.hash('senha123', 10),
      name: 'José Santos',
      cpf: '22233344455',
      telefone: '(15) 98888-2222',
      cep: '18085-000',
      endereco: 'Rua Doutor Nogueira Martins',
      numero: '789',
      bairro: 'Vila Hortência',
      cidade: 'Sorocaba',
      estado: 'SP',
      statusAprovacao: 'pendente',
    },
  ];

  for (const userData of usuarios) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log('✅ Usuário criado:', user.email);
  }

  // Criar lotes de exemplo
  const dataInicio = new Date();
  const dataFim = new Date();
  dataFim.setDate(dataFim.getDate() + 7); // Leilão termina em 7 dias

  const lotes = [
    {
      titulo: 'Lote de Eletrônicos - Notebooks e Tablets',
      descricao: 'Lote contendo 15 notebooks usados de logística reversa, diversas marcas (Dell, HP, Lenovo), em bom estado de conservação. Inclui também 8 tablets Samsung. Ideal para revenda ou uso corporativo. Todos testados e funcionais.',
      lanceInicial: 5000.00,
      lanceAtual: 5500.00,
      status: 'ativo',
      dataInicio,
      dataFim,
      fotosUrls: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
      ],
      videosUrls: [],
    },
    {
      titulo: 'Lote de Smartphones',
      descricao: 'Conjunto de 30 smartphones de logística reversa. Marcas variadas: Samsung, Motorola, Xiaomi. Alguns com pequenos defeitos estéticos, todos ligam e funcionam. Ótima oportunidade para revendedores.',
      lanceInicial: 3500.00,
      lanceAtual: 4200.00,
      status: 'ativo',
      dataInicio,
      dataFim,
      fotosUrls: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800',
      ],
      videosUrls: [],
    },
    {
      titulo: 'Lote de Eletrodomésticos Pequenos',
      descricao: 'Mix de eletrodomésticos de logística reversa: 10 liquidificadores, 8 batedeiras, 12 ferros de passar, 6 cafeteiras elétricas. Produtos testados, diversos em embalagem original. Marcas: Philips, Mondial, Britânia.',
      lanceInicial: 2000.00,
      lanceAtual: 2500.00,
      status: 'ativo',
      dataInicio,
      dataFim,
      fotosUrls: [
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
      ],
      videosUrls: [],
    },
    {
      titulo: 'Lote de Televisores LED',
      descricao: '8 televisores LED de 32 a 55 polegadas. Marcas: LG, Samsung, Philco. Todos em perfeito funcionamento, alguns com pequenos arranhões na moldura. Logística reversa de loja de departamentos.',
      lanceInicial: 4000.00,
      status: 'ativo',
      dataInicio,
      dataFim,
      fotosUrls: [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
      ],
      videosUrls: [],
    },
  ];

  for (const loteData of lotes) {
    const lote = await prisma.lote.create({
      data: loteData,
    });
    console.log('✅ Lote criado:', lote.titulo);
  }

  // Criar alguns lances de exemplo nos lotes
  const allLotes = await prisma.lote.findMany();
  const allUsers = await prisma.user.findMany({ where: { statusAprovacao: 'aprovado' } });

  if (allLotes.length > 0 && allUsers.length > 0) {
    // Lances no primeiro lote
    await prisma.lance.create({
      data: {
        valor: 5200.00,
        loteId: allLotes[0]?.id ?? '',
        userId: allUsers[0]?.id ?? '',
      },
    });
    
    await prisma.lance.create({
      data: {
        valor: 5500.00,
        loteId: allLotes[0]?.id ?? '',
        userId: allUsers[1] ? allUsers[1].id : allUsers[0]?.id ?? '',
      },
    });

    // Lances no segundo lote
    await prisma.lance.create({
      data: {
        valor: 3800.00,
        loteId: allLotes[1]?.id ?? '',
        userId: allUsers[0]?.id ?? '',
      },
    });
    
    await prisma.lance.create({
      data: {
        valor: 4200.00,
        loteId: allLotes[1]?.id ?? '',
        userId: allUsers[1] ? allUsers[1].id : allUsers[0]?.id ?? '',
      },
    });

    // Lance no terceiro lote
    await prisma.lance.create({
      data: {
        valor: 2500.00,
        loteId: allLotes[2]?.id ?? '',
        userId: allUsers[0]?.id ?? '',
      },
    });

    console.log('✅ Lances de exemplo criados');
  }

  console.log('\n🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
