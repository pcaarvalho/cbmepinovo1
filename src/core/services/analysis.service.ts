// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { PDFService } from '@/backend/external/storage/pdf.service';
import { AnalysisRepository } from '@/backend/repositories/analysis.repository';
import { ComplianceEngine } from '@/backend/services/analysis/compliance.engine';
import { ResultadoAnalise, ItemVerificacao, AnalysisStatus } from '@/shared/types/analysis';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export class AnalysisService {
  private pdfService: PDFService;
  private analysisRepo: AnalysisRepository;
  private complianceEngine: ComplianceEngine;

  constructor() {
    this.pdfService = new PDFService();
    this.analysisRepo = new AnalysisRepository();
    this.complianceEngine = new ComplianceEngine();
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  async analyzeDocument(file: File): Promise<ResultadoAnalise> {
    try {
      const startTime = Date.now();

      // Extrair texto do PDF
      const extractedText = await this.pdfService.extractText(file);
      
      if (!extractedText || extractedText.length < 100) {
        throw new Error('Documento não contém texto suficiente para análise');
      }

      // Analisar conformidade
      const complianceResults = await this.complianceEngine.analyzeCompliance(extractedText);

      // Calcular percentual de conformidade
      const conformidade = this.calculateCompliancePercentage(complianceResults.items);

      // Gerar observações
      const observacoes = this.generateObservations(complianceResults.items);

      // Criar resultado da análise
      const resultado: ResultadoAnalise = {
        id: this.generateAnalysisId(),
        nomeArquivo: file.name,
        tamanhoArquivo: file.size,
        hashArquivo: await this.generateFileHash(file),
        dataAnalise: new Date().toISOString(),
        conformidade,
        status: AnalysisStatus.COMPLETED,
        observacoes,
        tempoProcessamento: Date.now() - startTime,
        versaoAlgoritmo: '1.0.0',
        metadados: {
          extractedTextLength: extractedText.length,
          totalItemsChecked: complianceResults.items.length,
          criticalIssues: complianceResults.items.filter(item => 
            item.severidade === 'CRITICAL' && item.resultado === 'NAO_CONFORME'
          ).length,
        },
        userId: '', // Será preenchido pela camada de apresentação
        organizationId: '', // Será preenchido pela camada de apresentação
        itensVerificados: complianceResults.items,
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Salvar resultado
      await this.analysisRepo.save(resultado);

      return resultado;
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw new Error(`Erro na análise do documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  async getAnalysisById(id: string): Promise<ResultadoAnalise | null> {
    try {
      return await this.analysisRepo.findById(id);
    } catch (error) {
      console.error('Error getting analysis by ID:', error);
      throw new Error('Erro ao buscar análise');
    }
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  async getAnalysisHistory(params: {
    userId?: string | null;
    limit: number;
    offset: number;
  }): Promise<{ analyses: ResultadoAnalise[]; total: number }> {
    try {
      return await this.analysisRepo.findByUser(params);
    } catch (error) {
      console.error('Error getting analysis history:', error);
      throw new Error('Erro ao buscar histórico de análises');
    }
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  async deleteAnalysis(id: string, userId: string): Promise<void> {
    try {
      const analysis = await this.analysisRepo.findById(id);
      
      if (!analysis) {
        throw new Error('Análise não encontrada');
      }

      if (analysis.userId !== userId) {
        throw new Error('Acesso negado');
      }

      await this.analysisRepo.delete(id);
    } catch (error) {
      console.error('Error deleting analysis:', error);
      throw error;
    }
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  private calculateCompliancePercentage(items: ItemVerificacao[]): number {
    if (items.length === 0) return 0;

    const conformeItems = items.filter(item => 
      item.resultado === 'CONFORME' || item.resultado === 'NAO_APLICAVEL'
    ).length;

    return Math.round((conformeItems / items.length) * 100);
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  private generateObservations(items: ItemVerificacao[]): string {
    const naoConformes = items.filter(item => item.resultado === 'NAO_CONFORME');
    const criticos = naoConformes.filter(item => item.severidade === 'CRITICAL');

    let observacoes = `Análise realizada em ${items.length} itens.\n\n`;

    if (criticos.length > 0) {
      observacoes += `⚠️ ITENS CRÍTICOS (${criticos.length}):\n`;
      criticos.forEach(item => {
        observacoes += `- ${item.item}\n`;
        if (item.sugestao) {
          observacoes += `  Sugestão: ${item.sugestao}\n`;
        }
      });
      observacoes += '\n';
    }

    if (naoConformes.length > criticos.length) {
      const outros = naoConformes.filter(item => item.severidade !== 'CRITICAL');
      observacoes += `📋 OUTROS ITENS NÃO CONFORMES (${outros.length}):\n`;
      outros.slice(0, 5).forEach(item => {
        observacoes += `- ${item.item}\n`;
      });
      
      if (outros.length > 5) {
        observacoes += `... e mais ${outros.length - 5} itens.\n`;
      }
    }

    return observacoes;
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  private async generateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// ✔️ Protegido com AIDEV-PROTECTED