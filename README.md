# Leilões Reversa

Plataforma de leilões de logística reversa para Sorocaba e região.

## Tecnologias

- **Next.js 14** - Framework React
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **NextAuth** - Autenticação
- **Tailwind CSS** - Estilização
- **AWS S3** - Armazenamento de arquivos

## Funcionalidades

- ✅ Cadastro de usuários com validação de CPF e documentos
- ✅ Sistema de lances em tempo real
- ✅ Painel administrativo completo
- ✅ Upload de fotos e vídeos dos lotes
- ✅ Geração de banners com IA
- ✅ Integração com WhatsApp
- ✅ Termos de uso e política de privacidade (LGPD)

## Instalação

```bash
# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar cliente Prisma
yarn prisma generate

# Executar migrações
yarn prisma db push

# Popular banco com dados iniciais
yarn prisma db seed

# Iniciar servidor de desenvolvimento
yarn dev
```

## Credenciais de Admin

- **Email:** admin@reversa.com
- **Senha:** adm123

## Estrutura do Projeto

```
├── app/                    # Páginas e rotas da aplicação
│   ├── admin/             # Painel administrativo
│   ├── api/               # API routes
│   ├── lotes/             # Páginas de lotes
│   └── ...
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e configurações
├── prisma/                # Schema do banco de dados
└── public/                # Arquivos estáticos
```

## Deploy

Esta aplicação está hospedada na Abacus AI:
- **URL:** https://reversa-leiloes-qtw4c6.abacusai.app

## Contato

- **WhatsApp:** (15) 99648-0072
- **Instagram:** @reversaleiloes
- **Facebook:** Reversa Leilões
