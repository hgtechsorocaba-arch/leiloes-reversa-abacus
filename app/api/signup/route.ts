import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { validarCPF } from '@/lib/utils-extra';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      nome,
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
    } = body;

    // Validações
    if (!email || !password || !nome || !cpf || !telefone || !cep || !endereco || !numero || !bairro || !cidade || !estado) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      );
    }

    // Validar CPF
    if (!validarCPF(cpf)) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 });
    }

    // Verificar se já existe usuário com o mesmo email ou CPF
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { cpf: cpf.replace(/[^\d]/g, '') },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário cadastrado com este email ou CPF' },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: nome,
        cpf: cpf.replace(/[^\d]/g, ''),
        telefone,
        cep,
        endereco,
        numero,
        complemento: complemento || '',
        bairro,
        cidade,
        estado,
        statusAprovacao: 'pendente',
        docFrenteUrl: docFrenteUrl || null,
        docVersoUrl: docVersoUrl || null,
        selfieUrl: selfieUrl || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Cadastro realizado com sucesso! Aguarde aprovação.',
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return NextResponse.json({ error: 'Erro ao realizar cadastro' }, { status: 500 });
  }
}
