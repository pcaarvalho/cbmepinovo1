// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { PrismaClient } from '@prisma/client';
import { ItemVerificacao, AnalysisStatus, VerificationResult, Severity } from '@/types';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// Instância global do Prisma (padrão Next.js)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface AnalysisResultData {
  id: string;
  nomeArquivo: string;
  tamanhoArquivo: number;
  hashArquivo: string;
  conformidade: number;
  status: AnalysisStatus;
  observacoes: string;
  tempoProcessamento: number;
  versaoAlgoritmo: string;
  itensVerificados: ItemVerificacao[];
  metadata?: Record<string, unknown>;
  userId?: string;
  organizationId?: string;
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
/**
 * Salva resultado de análise no banco de dados
 */
export async function saveAnalysisResult(data: AnalysisResultData): Promise<string> {
  try {
    // Para desenvolvimento, vamos usar valores padrão para user e organization
    const defaultUserId = 'dev-user-001';
    const defaultOrgId = 'dev-org-001';
    
    console.log('💾 Salvando análise no banco de dados...');
    
    // 1. Criar/verificar organização padrão de desenvolvimento
    const organization = await prisma.organization.upsert({
      where: { id: defaultOrgId },
      update: {},
      create: {
        id: defaultOrgId,
        name: 'CB-PI Desenvolvimento',
        slug: 'cbpi-dev',
        domain: 'dev.cbm.pi.gov.br',
        isActive: true
      }
    });
    
    // 2. Criar/verificar usuário padrão de desenvolvimento
    const user = await prisma.user.upsert({
      where: { id: defaultUserId },
      update: {},
      create: {
        id: defaultUserId,
        email: 'dev@cbm.pi.gov.br',
        name: 'Desenvolvedor Sistema',
        organizationId: organization.id,
        isActive: true
      }
    });
    
    // 3. Criar registro de análise principal
    const analysis = await prisma.resultadoAnalise.create({
      data: {
        id: data.id,
        nomeArquivo: data.nomeArquivo,
        tamanhoArquivo: data.tamanhoArquivo,
        hashArquivo: data.hashArquivo,
        conformidade: data.conformidade,
        status: data.status,
        observacoes: data.observacoes,
        tempoProcessamento: data.tempoProcessamento,
        versaoAlgoritmo: data.versaoAlgoritmo,
        metadados: JSON.parse(JSON.stringify(data.metadata || {})),
        userId: user.id,
        organizationId: organization.id
      }
    });
    
    console.log(`✅ Análise principal criada: ${analysis.id}`);
    
    // 4. Criar itens de verificação
    const itensData = data.itensVerificados.map(item => ({
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      item: item.item,
      resultado: item.resultado as VerificationResult,
      observacao: item.observacao || '',
      itReferencia: item.itReferencia || '',
      severidade: item.severidade as Severity,
      linha: item.linha || null,
      coluna: item.coluna || null,
      contexto: item.contexto || null,
      sugestao: item.sugestao || null,
      analiseId: analysis.id
    }));
    
    if (itensData.length > 0) {
      await prisma.itemVerificacao.createMany({
        data: itensData
      });
      
      console.log(`✅ ${itensData.length} itens de verificação salvos`);
    }
    
    // 5. Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_ANALYSIS',
        resource: 'ResultadoAnalise',
        resourceId: analysis.id,
        newValues: {
          nomeArquivo: data.nomeArquivo,
          conformidade: data.conformidade,
          itensCount: data.itensVerificados.length
        },
        metadata: {
          tempoProcessamento: data.tempoProcessamento,
          versaoAlgoritmo: data.versaoAlgoritmo
        },
        userId: user.id,
        organizationId: organization.id
      }
    });
    
    console.log('📊 Log de auditoria criado');
    
    return analysis.id;
    
  } catch (error) {
    console.error('❌ Erro ao salvar análise no banco:', error);
    throw new Error(`Falha na persistência: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
/**
 * Recupera resultado de análise do banco de dados
 */
export async function getAnalysisResult(analysisId: string): Promise<AnalysisResultData | null> {
  try {
    const analysis = await prisma.resultadoAnalise.findUnique({
      where: { id: analysisId },
      include: {
        itensVerificados: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    
    if (!analysis) {
      return null;
    }
    
    return {
      id: analysis.id,
      nomeArquivo: analysis.nomeArquivo,
      tamanhoArquivo: analysis.tamanhoArquivo || 0,
      hashArquivo: analysis.hashArquivo || '',
      conformidade: analysis.conformidade,
      status: analysis.status as AnalysisStatus,
      observacoes: analysis.observacoes || '',
      tempoProcessamento: analysis.tempoProcessamento || 0,
      versaoAlgoritmo: analysis.versaoAlgoritmo || '2.0.0',
      metadata: analysis.metadados as Record<string, unknown>,
      userId: analysis.userId,
      organizationId: analysis.organizationId,
      itensVerificados: analysis.itensVerificados.map((item: { 
        id: string; 
        item: string; 
        resultado: string; 
        observacao: string | null; 
        itReferencia: string | null; 
        severidade: string; 
        linha: number | null; 
        coluna: number | null; 
        contexto: string | null; 
        sugestao: string | null; 
        analiseId: string; 
        createdAt: Date 
      }) => ({
        id: item.id,
        item: item.item,
        resultado: item.resultado as VerificationResult,
        observacao: item.observacao || '',
        itReferencia: item.itReferencia || '',
        severidade: item.severidade as Severity,
        linha: item.linha || undefined,
        coluna: item.coluna || undefined,
        contexto: item.contexto || undefined,
        sugestao: item.sugestao || undefined,
        analiseId: item.analiseId,
        createdAt: item.createdAt.toISOString()
      }))
    };
    
  } catch (error) {
    console.error('❌ Erro ao recuperar análise do banco:', error);
    throw new Error(`Falha na recuperação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Lista análises de um usuário com paginação
 */
export async function listUserAnalyses(
  userId?: string,
  organizationId?: string,
  options: {
    page?: number;
    limit?: number;
    orderBy?: 'recent' | 'conformidade' | 'nome';
  } = {}
) {
  try {
    const { page = 1, limit = 10, orderBy = 'recent' } = options;
    const skip = (page - 1) * limit;
    
    // Para desenvolvimento, usar valores padrão se não especificados
    const finalUserId = userId || 'dev-user-001';
    const finalOrgId = organizationId || 'dev-org-001';
    
    let orderByClause: { createdAt?: 'desc' | 'asc'; conformidade?: 'desc' | 'asc'; nomeArquivo?: 'desc' | 'asc' } = { createdAt: 'desc' };
    
    if (orderBy === 'conformidade') {
      orderByClause = { conformidade: 'desc' };
    } else if (orderBy === 'nome') {
      orderByClause = { nomeArquivo: 'asc' };
    }
    
    const [analyses, total] = await Promise.all([
      prisma.resultadoAnalise.findMany({
        where: {
          userId: finalUserId,
          organizationId: finalOrgId
        },
        orderBy: orderByClause,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              itensVerificados: true
            }
          }
        }
      }),
      prisma.resultadoAnalise.count({
        where: {
          userId: finalUserId,
          organizationId: finalOrgId
        }
      })
    ]);
    
    return {
      analyses: analyses.map((analysis: { 
        id: string; 
        nomeArquivo: string; 
        conformidade: number; 
        status: string; 
        dataAnalise: Date; 
        tempoProcessamento: number | null; 
        _count: { itensVerificados: number } 
      }) => ({
        id: analysis.id,
        nomeArquivo: analysis.nomeArquivo,
        conformidade: analysis.conformidade,
        status: analysis.status,
        dataAnalise: analysis.dataAnalise,
        tempoProcessamento: analysis.tempoProcessamento,
        itensCount: analysis._count.itensVerificados
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    
  } catch (error) {
    console.error('❌ Erro ao listar análises:', error);
    throw new Error(`Falha na listagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Atualiza status de uma análise
 */
export async function updateAnalysisStatus(
  analysisId: string,
  status: AnalysisStatus,
  observacoes?: string
): Promise<void> {
  try {
    await prisma.resultadoAnalise.update({
      where: { id: analysisId },
      data: {
        status,
        observacoes: observacoes || undefined,
        updatedAt: new Date()
      }
    });
    
    console.log(`✅ Status da análise ${analysisId} atualizado para ${status}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status da análise:', error);
    throw new Error(`Falha na atualização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Obtém estatísticas de análises
 */
export async function getAnalysisStatistics(
  organizationId?: string,
  period: 'day' | 'week' | 'month' | 'year' = 'month'
) {
  try {
    const finalOrgId = organizationId || 'dev-org-001';
    
    // Calcular data de início baseada no período
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const [totalAnalyses, avgConformidade, statusDistribution] = await Promise.all([
      // Total de análises no período
      prisma.resultadoAnalise.count({
        where: {
          organizationId: finalOrgId,
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Conformidade média
      prisma.resultadoAnalise.aggregate({
        where: {
          organizationId: finalOrgId,
          createdAt: {
            gte: startDate
          }
        },
        _avg: {
          conformidade: true
        }
      }),
      
      // Distribuição por status
      prisma.resultadoAnalise.groupBy({
        by: ['status'],
        where: {
          organizationId: finalOrgId,
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          status: true
        }
      })
    ]);
    
    return {
      period,
      totalAnalyses,
      avgConformidade: Math.round(avgConformidade._avg.conformidade || 0),
      statusDistribution: statusDistribution.reduce((acc: Record<string, number>, item: { status: string; _count: { status: number } }) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>)
    };
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    throw new Error(`Falha nas estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// Cleanup de conexões (importante para Next.js)
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

// ✔️ Protegido com AIDEV-PROTECTED