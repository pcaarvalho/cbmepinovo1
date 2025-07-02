import { NextRequest, NextResponse } from 'next/server';
import { analyzeMemorial } from '@/lib/memorial-analyzer';
import { ItemVerificacao, AnalysisStatus } from '@/types';
import { saveAnalysisResult, getAnalysisResult } from '@/lib/analysis-persistence';

// Função auxiliar para calcular hash do arquivo
async function calcularHashArquivo(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Função para gerar sugestões de melhorias
function gerarSugestoesMelhorias(itens: ItemVerificacao[]): string[] {
  const sugestoes: string[] = [];
  const naoConformes = itens.filter(i => i.resultado === 'NAO_CONFORME');
  const criticos = itens.filter(i => i.severidade === 'CRITICAL');
  
  // Sugestões críticas
  if (criticos.length > 0) {
    sugestoes.push('⚠️ Resolva imediatamente os itens críticos identificados antes de submeter o projeto');
  }
  
  if (naoConformes.length > 5) {
    sugestoes.push('📋 Revise o memorial descritivo para incluir informações técnicas mais detalhadas');
  }
  
  // Sugestões específicas por tipo de problema
  const sugestoesPorTipo = [
    { filtro: 'responsável técnico', sugestao: '👨‍💼 Inclua identificação completa do responsável técnico com nome e registro profissional' },
    { filtro: 'saída', sugestao: '🚪 Verifique o dimensionamento das saídas de emergência conforme IT-008' },
    { filtro: 'iluminação', sugestao: '💡 Especifique a autonomia da iluminação de emergência (mínimo 2 horas)' }
  ];
  
  sugestoesPorTipo.forEach(({ filtro, sugestao }) => {
    if (naoConformes.some(i => i.item.toLowerCase().includes(filtro))) {
      sugestoes.push(sugestao);
    }
  });
  
  if (sugestoes.length === 0) {
    sugestoes.push('✅ Memorial descritivo bem estruturado. Mantenha a qualidade das informações técnicas');
  }
  
  return sugestoes;
}

// Função para gerar sugestão específica por item
function gerarSugestaoItem(item: ItemVerificacao): string {
  const sugestoesPorResultado = {
    CONFORME: 'Item em conformidade com a norma',
    PARCIAL: 'Informação incompleta - complemente com mais detalhes técnicos',
    NAO_APLICAVEL: 'Verifique se este item se aplica ao seu projeto',
    PENDENTE: 'Item pendente de verificação'
  };

  if (item.resultado === 'NAO_CONFORME') {
    const sugestoesPorSeveridade = {
      CRITICAL: 'URGENTE: Corrija este item antes de submeter o projeto',
      HIGH: 'Importante: Inclua esta informação no memorial descritivo',
      MEDIUM: 'Recomendado: Detalhe melhor esta informação',
      LOW: 'Recomendado: Detalhe melhor esta informação'
    };
    return sugestoesPorSeveridade[item.severidade] || 'Recomendado: Detalhe melhor esta informação';
  }
  
  return sugestoesPorResultado[item.resultado] || 'Verifique se este item se aplica ao seu projeto';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File;
    
    if (!arquivo) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const tiposPermitidos = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!tiposPermitidos.includes(arquivo.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use PDF, DOCX ou DOC.' },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const tamanhoMaximo = 10 * 1024 * 1024; // 10MB
    if (arquivo.size > tamanhoMaximo) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 10MB.' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    console.log('🚀 Iniciando análise ULTRATHINK...');
    
    // Executar análise real do memorial descritivo com algoritmo ULTRATHINK
    const analiseResult = await analyzeMemorial(arquivo);
    
    const endTime = Date.now();
    const tempoProcessamento = endTime - startTime;
    
    console.log(`⏱️ Análise concluída em ${tempoProcessamento}ms`);
    
    // Calcular estatísticas detalhadas
    const itens = analiseResult.itensVerificados;
    const stats = {
      total: itens.length,
      conforme: itens.filter(i => i.resultado === 'CONFORME').length,
      naoConforme: itens.filter(i => i.resultado === 'NAO_CONFORME').length,
      parcial: itens.filter(i => i.resultado === 'PARCIAL').length,
      naoAplicavel: itens.filter(i => i.resultado === 'NAO_APLICAVEL').length,
      porSeveridade: {
        critical: itens.filter(i => i.severidade === 'CRITICAL').length,
        high: itens.filter(i => i.severidade === 'HIGH').length,
        medium: itens.filter(i => i.severidade === 'MEDIUM').length,
        low: itens.filter(i => i.severidade === 'LOW').length
      }
    };
    
    // Gerar sugestões de melhorias
    const sugestoes = gerarSugestoesMelhorias(itens);
    
    // Classificar status geral
    let statusGeral: 'APROVADO' | 'APROVADO_COM_RESSALVAS' | 'REPROVADO';
    if (analiseResult.conformidade >= 85 && stats.porSeveridade.critical === 0) {
      statusGeral = 'APROVADO';
    } else if (analiseResult.conformidade >= 70 && stats.porSeveridade.critical <= 1) {
      statusGeral = 'APROVADO_COM_RESSALVAS';
    } else {
      statusGeral = 'REPROVADO';
    }
    
    const analysisId = `analise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const hashArquivo = await calcularHashArquivo(arquivo);
    
    // Preparar resposta estruturada
    const analise = {
      id: analysisId,
      nomeArquivo: arquivo.name,
      tamanhoArquivo: arquivo.size,
      hashArquivo,
      dataAnalise: new Date().toISOString(),
      conformidade: analiseResult.conformidade,
      status: 'COMPLETED' as AnalysisStatus,
      statusGeral,
      observacoes: analiseResult.observacoes,
      tempoProcessamento,
      versaoAlgoritmo: '2.0.0-ULTRATHINK',
      estatisticas: stats,
      sugestoes,
      contexto: analiseResult.contexto, // Novo campo do ULTRATHINK
      dashboard: {
        resumo: {
          conformidade: analiseResult.conformidade,
          status: statusGeral,
          prioridade: stats.porSeveridade.critical > 0 ? 'CRITICA' : 
                     stats.porSeveridade.high > 2 ? 'ALTA' : 'NORMAL'
        },
        distribuicao: {
          conforme: Math.round((stats.conforme / stats.total) * 100),
          naoConforme: Math.round((stats.naoConforme / stats.total) * 100),
          parcial: Math.round((stats.parcial / stats.total) * 100),
          naoAplicavel: Math.round((stats.naoAplicavel / stats.total) * 100)
        },
        criticidade: {
          criticos: stats.porSeveridade.critical,
          altos: stats.porSeveridade.high,
          medios: stats.porSeveridade.medium,
          baixos: stats.porSeveridade.low
        }
      },
      itensVerificados: analiseResult.itensVerificados.map(item => ({
        id: item.id,
        item: item.item,
        resultado: item.resultado,
        observacao: item.observacao,
        itReferencia: item.itReferencia,
        severidade: item.severidade,
        linha: item.linha,
        coluna: item.coluna,
        contexto: item.contexto,
        sugestao: item.sugestao || gerarSugestaoItem(item)
      }))
    };
    
    // 💾 PERSISTIR ANÁLISE NO BANCO DE DADOS
    try {
      console.log('💾 Salvando análise no banco de dados...');
      
      await saveAnalysisResult({
        id: analysisId,
        nomeArquivo: arquivo.name,
        tamanhoArquivo: arquivo.size,
        hashArquivo,
        conformidade: analiseResult.conformidade,
        status: 'COMPLETED' as AnalysisStatus,
        observacoes: analiseResult.observacoes,
        tempoProcessamento,
        versaoAlgoritmo: '2.0.0-ULTRATHINK',
        itensVerificados: analiseResult.itensVerificados,
        metadata: {
          statusGeral,
          estatisticas: stats,
          sugestoes,
          contexto: analiseResult.contexto,
          dashboard: analise.dashboard
        }
      });
      
      console.log(`✅ Análise ${analysisId} salva com sucesso no banco`);
      
    } catch (persistenceError) {
      console.error('⚠️ Erro ao salvar no banco (continuando com resposta):', persistenceError);
      // Não falhamos a requisição se houver erro de persistência
    }

    return NextResponse.json({
      success: true,
      analise
    });
  } catch (error) {
    console.error('Erro na análise de memorial:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analiseId = searchParams.get('id');

    if (!analiseId) {
      return NextResponse.json(
        { error: 'ID da análise não fornecido' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando análise: ${analiseId}`);
    
    // Buscar análise no banco de dados
    const analysisData = await getAnalysisResult(analiseId);
    
    if (!analysisData) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Análise não encontrada' 
        },
        { status: 404 }
      );
    }
    
    console.log(`✅ Análise encontrada: ${analysisData.nomeArquivo}`);
    
    return NextResponse.json({
      success: true,
      analise: analysisData
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar análise:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}