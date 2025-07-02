import { ItemVerificacao, ComplianceAnalysisResult, Severity, VerificationResult } from '@/shared/types/analysis';

export class ComplianceEngine {

  async analyzeCompliance(text: string): Promise<ComplianceAnalysisResult> {
    try {
      const items: ItemVerificacao[] = [];
      let idCounter = 1;

      // Analyze different aspects of compliance
      items.push(...this.analyzeSafetyExits(text, idCounter));
      idCounter += items.length;

      items.push(...this.analyzeFireExtinguishers(text, idCounter));
      idCounter += items.length;

      items.push(...this.analyzeEmergencyLighting(text, idCounter));
      idCounter += items.length;

      items.push(...this.analyzeHydrantSystem(text, idCounter));
      idCounter += items.length;

      items.push(...this.analyzeGeneralRequirements(text, idCounter));

      // Calculate summary
      const summary = this.calculateSummary(items);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(items);
      
      // Identify critical issues
      const criticalIssues = items.filter(item => 
        item.severidade === 'CRITICAL' && item.resultado === 'NAO_CONFORME'
      );

      return {
        items,
        summary,
        recommendations,
        criticalIssues,
      };
    } catch (error) {
      console.error('Error in compliance analysis:', error);
      throw new Error('Erro na análise de conformidade');
    }
  }

  private analyzeSafetyExits(text: string, startId: number): ItemVerificacao[] {
    const items: ItemVerificacao[] = [];
    const lowerText = text.toLowerCase();

    // Check for emergency exits
    items.push({
      id: `item_${startId}`,
      item: 'Presença de saídas de emergência',
      resultado: lowerText.includes('saída') && lowerText.includes('emergência') 
        ? 'CONFORME' : 'NAO_CONFORME',
      observacao: lowerText.includes('saída') && lowerText.includes('emergência')
        ? 'Saídas de emergência identificadas no projeto'
        : 'Não foi possível identificar saídas de emergência no memorial',
      itReferencia: 'IT-008/2019',
      severidade: 'CRITICAL',
      sugestao: 'Verificar dimensionamento e quantidade adequada conforme IT-008',
      analiseId: 'current',
      createdAt: new Date().toISOString(),
    });

    // Check exit width
    const widthRegex = /largura.*?(\d+[\.,]?\d*)\s*m/gi;
    const widthMatches = text.match(widthRegex);
    
    items.push({
      id: `item_${startId + 1}`,
      item: 'Largura mínima das saídas',
      resultado: widthMatches && widthMatches.some(w => {
        const width = parseFloat(w.replace(/[^\d\.,]/g, '').replace(',', '.'));
        return width >= 1.2;
      }) ? 'CONFORME' : 'NAO_CONFORME',
      observacao: widthMatches 
        ? `Largura encontrada: ${widthMatches.join(', ')}`
        : 'Largura das saídas não especificada',
      itReferencia: 'IT-008/2019',
      severidade: 'HIGH',
      sugestao: 'Largura mínima de 1,20m para escadas de emergência',
      analiseId: 'current',
      createdAt: new Date().toISOString(),
    });

    return items;
  }

  private analyzeFireExtinguishers(text: string, startId: number): ItemVerificacao[] {
    const items: ItemVerificacao[] = [];
    const lowerText = text.toLowerCase();

    items.push({
      id: `item_${startId}`,
      item: 'Sistema de extintores portáteis',
      resultado: lowerText.includes('extintor') ? 'CONFORME' : 'NAO_CONFORME',
      observacao: lowerText.includes('extintor')
        ? 'Sistema de extintores previsto no projeto'
        : 'Sistema de extintores não identificado',
      itReferencia: 'IT-021/2019',
      severidade: 'HIGH',
      sugestao: 'Verificar tipos adequados e posicionamento conforme IT-021',
      analiseId: 'current',
      createdAt: new Date().toISOString(),
    });

    // Check distance between extinguishers
    const distanceRegex = /distância.*?(\d+)\s*m/gi;
    const distanceMatches = text.match(distanceRegex);
    
    items.push({
      id: `item_${startId + 1}`,
      item: 'Distância máxima entre extintores',
      resultado: distanceMatches && distanceMatches.some(d => {
        const distance = parseInt(d.replace(/[^\d]/g, ''));
        return distance <= 25;
      }) ? 'CONFORME' : 'PARCIAL',
      observacao: distanceMatches 
        ? `Distância encontrada: ${distanceMatches.join(', ')}`
        : 'Distância entre extintores não especificada claramente',
      itReferencia: 'IT-021/2019',
      severidade: 'MEDIUM',
      sugestao: 'Distância máxima de 25m entre extintores para área comercial',
      analiseId: 'current',
      createdAt: new Date().toISOString(),
    });

    return items;
  }

  private analyzeEmergencyLighting(text: string, startId: number): ItemVerificacao[] {
    const items: ItemVerificacao[] = [];
    const lowerText = text.toLowerCase();

    items.push({
      id: `item_${startId}`,
      item: 'Iluminação de emergência',
      resultado: (lowerText.includes('iluminação') && lowerText.includes('emergência')) 
        ? 'CONFORME' : 'NAO_CONFORME',
      observacao: (lowerText.includes('iluminação') && lowerText.includes('emergência'))
        ? 'Sistema de iluminação de emergência previsto'
        : 'Sistema de iluminação de emergência não identificado',
      itReferencia: 'IT-018/2019',
      severidade: 'HIGH',
      sugestao: 'Verificar autonomia mínima e níveis de iluminamento conforme IT-018',
      analiseId: 'current',
      createdAt: new Date().toISOString(),
    });

    // Check autonomy
    const autonomyRegex = /autonomia.*?(\d+)\s*hora/gi;
    const autonomyMatches = text.match(autonomyRegex);
    
    items.push({
      id: `item_${startId + 1}`,
      item: 'Autonomia da iluminação de emergência',
      resultado: autonomyMatches && autonomyMatches.some(a => {
        const hours = parseInt(a.replace(/[^\d]/g, ''));
        return hours >= 1;
      }) ? 'CONFORME' : 'NAO_CONFORME',
      observacao: autonomyMatches 
        ? `Autonomia especificada: ${autonomyMatches.join(', ')}`
        : 'Autonomia da iluminação não especificada',
      itReferencia: 'IT-018/2019',
      severidade: 'MEDIUM',
      sugestao: 'Autonomia mínima de 1 hora conforme IT-018',
      analiseId: 'current',
      createdAt: new Date().toISOString(),
    });

    return items;
  }

  private analyzeHydrantSystem(text: string, startId: number): ItemVerificacao[] {
    const items: ItemVerificacao[] = [];
    const lowerText = text.toLowerCase();

    items.push({
      id: `item_${startId}`,
      item: 'Sistema de hidrantes',
      resultado: lowerText.includes('hidrante') ? 'CONFORME' : 'NAO_APLICAVEL',
      observacao: lowerText.includes('hidrante')
        ? 'Sistema de hidrantes previsto no projeto'
        : 'Sistema de hidrantes não aplicável ou não especificado',
      itReferencia: 'IT-022/2019',
      severidade: 'MEDIUM',
      sugestao: 'Verificar pressão e vazão adequadas conforme IT-022',
      analiseId: 'current',
      createdAt: new Date().toISOString(),
    });

    return items;
  }

  private analyzeGeneralRequirements(text: string, startId: number): ItemVerificacao[] {
    const items: ItemVerificacao[] = [];
    const lowerText = text.toLowerCase();

    items.push({
      id: `item_${startId}`,
      item: 'Identificação dos dados do projeto',
      resultado: (lowerText.includes('área') && lowerText.includes('pavimento')) 
        ? 'CONFORME' : 'PARCIAL',
      observacao: 'Dados básicos do projeto identificados no memorial',
      itReferencia: 'IT-001/2019',
      severidade: 'LOW',
      sugestao: 'Incluir todos os dados técnicos conforme IT-001',
      analiseId: 'current',
      createdAt: new Date().toISOString(),
    });

    items.push({
      id: `item_${startId + 1}`,
      item: 'Referência às normas técnicas',
      resultado: lowerText.includes('it-') || lowerText.includes('cb-pi') 
        ? 'CONFORME' : 'NAO_CONFORME',
      observacao: lowerText.includes('it-') || lowerText.includes('cb-pi')
        ? 'Referências às normas do CB-PI identificadas'
        : 'Faltam referências às instruções técnicas do CB-PI',
      itReferencia: 'IT-001/2019',
      severidade: 'MEDIUM',
      sugestao: 'Citar todas as ITs aplicáveis ao projeto',
      analiseId: 'current',
      createdAt: new Date().toISOString(),
    });

    return items;
  }

  private calculateSummary(items: ItemVerificacao[]) {
    const total = items.length;
    const conforme = items.filter(i => i.resultado === 'CONFORME').length;
    const naoConforme = items.filter(i => i.resultado === 'NAO_CONFORME').length;
    const naoAplicavel = items.filter(i => i.resultado === 'NAO_APLICAVEL').length;
    const parcial = items.filter(i => i.resultado === 'PARCIAL').length;
    const pendente = items.filter(i => i.resultado === 'PENDENTE').length;

    return {
      total,
      conforme,
      naoConforme,
      naoAplicavel,
      parcial,
      pendente,
    };
  }

  private generateRecommendations(items: ItemVerificacao[]): string[] {
    const recommendations: string[] = [];
    
    const criticalIssues = items.filter(i => 
      i.severidade === 'CRITICAL' && i.resultado === 'NAO_CONFORME'
    );
    
    if (criticalIssues.length > 0) {
      recommendations.push(
        'URGENTE: Corrigir itens críticos antes da submissão do projeto'
      );
    }

    const nonCompliantItems = items.filter(i => i.resultado === 'NAO_CONFORME');
    if (nonCompliantItems.length > 0) {
      recommendations.push(
        `Revisar ${nonCompliantItems.length} item(ns) não conforme(s) identificado(s)`
      );
    }

    const partialItems = items.filter(i => i.resultado === 'PARCIAL');
    if (partialItems.length > 0) {
      recommendations.push(
        `Complementar informações de ${partialItems.length} item(ns) parcialmente conforme(s)`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Projeto apresenta boa conformidade com as normas do CB-PI'
      );
    }

    return recommendations;
  }
}