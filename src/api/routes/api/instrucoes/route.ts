import { NextRequest, NextResponse } from 'next/server';
import { todasInstrucoes } from '@/lib/data';
import { filtrarInstrucoes, buscarInstrucoes } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const termo = searchParams.get('q');
    const categoria = searchParams.get('categoria');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const tags = searchParams.get('tags')?.split(',');
    const popular = searchParams.get('popular') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let instrucoes = todasInstrucoes;

    // Aplicar busca por termo
    if (termo) {
      instrucoes = buscarInstrucoes(instrucoes, termo);
    }

    // Aplicar filtros
    const filtros = {
      ...(categoria && { categoria }),
      ...(dataInicio && { dataInicio }),
      ...(dataFim && { dataFim }),
      ...(tags && { tags }),
      ...(popular && { popular })
    };

    if (Object.keys(filtros).length > 0) {
      instrucoes = filtrarInstrucoes(instrucoes, filtros);
    }

    // Aplicar paginação
    const total = instrucoes.length;
    const instrucoesPage = instrucoes.slice(offset, offset + limit);

    return NextResponse.json({
      instrucoes: instrucoesPage,
      total,
      offset,
      limit,
      hasMore: offset + limit < total
    });
  } catch (error) {
    console.error('Erro na API de instruções:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await request.json();
    
    // Aqui seria implementada a lógica para criar uma nova IT
    // Por enquanto, retorna erro de não implementado
    
    return NextResponse.json(
      { error: 'Funcionalidade não implementada' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Erro ao criar instrução:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}