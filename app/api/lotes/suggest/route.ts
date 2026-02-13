import { NextRequest, NextResponse } from 'next/server';

const LLM_API_KEY = process.env.ABACUSAI_API_KEY;
const LLM_API_URL = 'https://api.abacus.ai/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { titulo } = await request.json();

    if (!titulo || titulo.length < 3) {
      return NextResponse.json({ error: 'Título muito curto' }, { status: 400 });
    }

    if (!LLM_API_KEY) {
      return NextResponse.json({ error: 'API não configurada' }, { status: 500 });
    }

    const categorias = [
      'Devolução Marketplace',
      'Caixa Amassada',
      'Open Box',
      'Avaria Cosmética',
      'Avaria Funcional',
      'Mostruário',
      'Excesso de Estoque',
      'Retorno de Cliente',
      'Produto de Vitrine',
      'Embalagem Danificada',
      'Recall/Recolhimento',
      'Prazo de Validade Próximo',
      'Sinistro/Salvado',
      'Peça de Showroom',
      'Outlet/Fim de Linha'
    ];

    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.1',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em leilões de logística reversa no Brasil. 
Analisando títulos de lotes, você sugere:
1. Uma descrição detalhada do produto (2-3 frases)
2. A categoria de origem mais adequada
3. Um valor sugerido de lance inicial em reais

Categorias disponíveis: ${categorias.join(', ')}

Responda APENAS em JSON válido, sem markdown, no formato:
{"descricao": "texto", "origem": "categoria", "lanceInicial": numero}`
          },
          {
            role: 'user',
            content: `Título do lote: "${titulo}"

Analise e sugira descrição, origem e lance inicial.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('LLM API error:', await response.text());
      return NextResponse.json({ error: 'Erro na API de IA' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Tentar extrair JSON da resposta
    let suggestion;
    try {
      // Remover possíveis marcadores de código
      const jsonStr = content.replace(/```json\n?|```\n?/g, '').trim();
      suggestion = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Erro ao parsear JSON:', content);
      return NextResponse.json({ 
        descricao: '',
        origem: '',
        lanceInicial: 0
      });
    }

    return NextResponse.json({
      descricao: suggestion.descricao || '',
      origem: suggestion.origem || '',
      lanceInicial: suggestion.lanceInicial || 0,
    });

  } catch (error) {
    console.error('Erro na sugestão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
