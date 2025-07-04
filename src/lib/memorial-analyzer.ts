// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { todasInstrucoes } from './data';
import { ItemVerificacao, VerificationResult, Severity, InstrucaoTecnica } from '@/types';
import { executeComplianceRules, getAnalysisStats } from './compliance-rules';
import { extractDocumentContent, ExtractedContent } from '@/infrastructure/storage/pdf-extractor';
import { performAdvancedSemanticAnalysis, analyzeDocumentContext } from './semantic-analyzer';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// Patterns regex para identificação de elementos técnicos
const PATTERNS = {
  responsavelTecnico: /(?:respons[aá]vel\s+t[eé]cnico|rt\s*:|engenheiro|arquiteto|crea\s*n[º°]?)\s*[:\-]?\s*([^\n\r]+)/gi,
  areaTotal: /(?:area|[aá]rea)\s+(?:total|construida|constru[íi]da|bruta)\s*[:\-]?\s*([0-9,.]+)\s*m[²2]/gi,
  alturaEdificacao: /(?:altura|gabarito)\s*[:\-]?\s*([0-9,.]+)\s*m(?:etros?)?/gi,
  ocupacao: /(?:ocupa[çc][aã]o|classifica[çc][aã]o|grupo|subgrupo)\s*[:\-]?\s*([A-Z]\d*(?:\-\d+)?)/gi,
  saidasEmergencia: /(?:sa[íi]da|exit)\s+(?:de\s+)?emerg[êe]ncia\s*[:\-]?\s*([^\n\r]+)/gi,
  extintores: /extintor(?:es)?\s*[:\-]?\s*([^\n\r]+)/gi,
  hidrantes: /hidrante(?:s)?\s*[:\-]?\s*([^\n\r]+)/gi,
  sprinklers: /(?:sprinkler|chuveiro|aspersores)\s*[:\-]?\s*([^\n\r]+)/gi,
  iluminacaoEmergencia: /ilumina[çc][aã]o\s+(?:de\s+)?emerg[êe]ncia\s*[:\-]?\s*([^\n\r]+)/gi,
  sinalizacao: /sinaliza[çc][aã]o\s*[:\-]?\s*([^\n\r]+)/gi,
  alarme: /(?:alarme|detec[çc][aã]o)\s*[:\-]?\s*([^\n\r]+)/gi,
  brigada: /brigada\s*[:\-]?\s*([^\n\r]+)/gi
};

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// Base de conhecimento de requisitos das ITs
const IT_REQUIREMENTS = {
  'IT-001': {
    name: 'Procedimentos Administrativos',
    rules: [
      {
        id: 'rt_identificacao',
        description: 'Identificação do responsável técnico',
        pattern: PATTERNS.responsavelTecnico,
        required: true,
        severity: 'HIGH' as Severity
      }
    ]
  },
  'IT-008': {
    name: 'Saídas de Emergência',
    rules: [
      {
        id: 'saidas_dimensionamento',
        description: 'Dimensionamento das saídas de emergência',
        pattern: PATTERNS.saidasEmergencia,
        required: true,
        severity: 'CRITICAL' as Severity,
        validation: (text: string) => {
          const areaMatch = text.match(/([0-9,.]+)\s*m[²2]/);
          const widthMatch = text.match(/largura[:\s]*([0-9,.]+)\s*m/i);
          
          if (areaMatch && widthMatch) {
            const area = parseFloat(areaMatch[1].replace(',', '.'));
            const width = parseFloat(widthMatch[1].replace(',', '.'));
            
            // Regra simplificada: largura mínima 1,2m para área > 100m²
            if (area > 100 && width < 1.2) {
              return { isValid: false, message: 'Largura mínima de 1,20m não atendida para área superior a 100m²' };
            }
          }
          
          return { isValid: true, message: 'Dimensionamento adequado' };
        }
      }
    ]
  },
  'IT-018': {
    name: 'Iluminação de Emergência',
    rules: [
      {
        id: 'iluminacao_autonomia',
        description: 'Autonomia da iluminação de emergência',
        pattern: PATTERNS.iluminacaoEmergencia,
        required: true,
        severity: 'HIGH' as Severity,
        validation: (text: string) => {
          const autonomiaMatch = text.match(/autonomia[:\s]*([0-9]+)\s*h(?:ora)?/i);
          
          if (autonomiaMatch) {
            const autonomia = parseInt(autonomiaMatch[1]);
            if (autonomia < 2) {
              return { isValid: false, message: 'Autonomia mínima de 2 horas não atendida' };
            }
          } else {
            return { isValid: false, message: 'Autonomia não especificada' };
          }
          
          return { isValid: true, message: 'Autonomia adequada' };
        }
      }
    ]
  },
  'IT-021': {
    name: 'Sistema de Extintores',
    rules: [
      {
        id: 'extintores_distribuicao',
        description: 'Distribuição e tipos de extintores',
        pattern: PATTERNS.extintores,
        required: true,
        severity: 'HIGH' as Severity
      }
    ]
  }
};

// Esta função foi movida para ./pdf-extractor.ts e agora é real, não mais mockada

// Função de análise semântica usando similaridade de texto
function calculateTextSimilarity(text1: string, text2: string): number {
  // Implementação simplificada de similaridade textual
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const allWords = [...new Set([...words1, ...words2])];
  const vector1 = allWords.map(word => words1.filter(w => w === word).length);
  const vector2 = allWords.map(word => words2.filter(w => w === word).length);
  
  // Cosseno da similaridade
  const dotProduct = vector1.reduce((sum, val, i) => sum + (val * vector2[i]), 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + (val * val), 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + (val * val), 0));
  
  return dotProduct / (magnitude1 * magnitude2) || 0;
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// Função principal de análise - VERSÃO ULTRATHINK AVANÇADA
export async function analyzeMemorial(file: File): Promise<{
  conformidade: number;
  itensVerificados: ItemVerificacao[];
  observacoes: string;
  contexto?: {
    documentType: string;
    completeness: number;
    missingElements: string[];
    qualityScore: number;
  };
}> {
  try {
    console.log('🔍 Iniciando análise ULTRATHINK do memorial:', file.name);
    
    // 1. Extrair conteúdo real do arquivo usando PDF.js
    const extractedContent = await extractDocumentContent(file);
    console.log(`📄 Documento processado: ${extractedContent.metadata.pages} páginas, ${extractedContent.sections.length} seções identificadas`);
    
    // 2. Análise contextual do documento
    const documentContext = analyzeDocumentContext(extractedContent);
    console.log(`📊 Análise contextual: ${documentContext.documentType}, Qualidade: ${documentContext.qualityScore}%`);
    
    const itensVerificados: ItemVerificacao[] = [];
    
    // 3. Verificações avançadas baseadas nas regras de conformidade
    console.log('🔧 Executando verificações avançadas de conformidade...');
    const complianceResults = executeComplianceRules(extractedContent.text);
    itensVerificados.push(...complianceResults);
    console.log(`✅ Compliance: ${complianceResults.length} verificações executadas`);
    
    // 4. Verificar ITs legadas com regras simples (manter compatibilidade)
    console.log('📋 Executando verificações legadas...');
    for (const [itNumber, itData] of Object.entries(IT_REQUIREMENTS)) {
      for (const rule of itData.rules) {
        const matches = extractedContent.text.match(rule.pattern);
        
        let resultado: VerificationResult;
        let observacao = '';
        
        if (matches && matches.length > 0) {
          // Se há validation function, usar ela
          if ('validation' in rule && rule.validation) {
            const validationResult = rule.validation(extractedContent.text);
            resultado = validationResult.isValid ? VerificationResult.CONFORME : VerificationResult.NAO_CONFORME;
            observacao = validationResult.message;
          } else {
            resultado = VerificationResult.CONFORME;
            observacao = `${rule.description} identificado: ${matches[0].substring(0, 100)}...`;
          }
        } else {
          resultado = rule.required ? VerificationResult.NAO_CONFORME : VerificationResult.NAO_APLICAVEL;
          observacao = rule.required 
            ? `${rule.description} não encontrado no memorial` 
            : `${rule.description} não aplicável`;
        }
        
        // Verificar se já não foi analisado pelas regras avançadas
        const jaAnalisado = complianceResults.some(item => 
          item.id === `${itNumber}-${rule.id}` || 
          item.item.toLowerCase().includes(rule.description.toLowerCase())
        );
        
        if (!jaAnalisado) {
          itensVerificados.push({
            id: `legacy-${itNumber}-${rule.id}`,
            item: rule.description,
            resultado,
            observacao,
            itReferencia: `${itNumber}/${new Date().getFullYear()}`,
            severidade: rule.severity,
            analiseId: '', // será preenchido pela API
            createdAt: new Date().toISOString()
          });
        }
      }
    }
    
    // 5. Análise semântica AVANÇADA com algoritmo UltraThink
    console.log('🧠 Executando análise semântica avançada...');
    const semanticAnalysis = await performAdvancedSemanticAnalysis(extractedContent, todasInstrucoes);
    itensVerificados.push(...semanticAnalysis);
    console.log(`🎯 Semântica: ${semanticAnalysis.length} correspondências encontradas`);
    
    // 6. Análise semântica legada (mantida para compatibilidade)
    const legacySemanticAnalysis = await performSemanticAnalysis(extractedContent, todasInstrucoes.slice(0, 3));
    
    // Filtrar duplicatas da análise legada
    const uniqueLegacyItems = legacySemanticAnalysis.filter(legacyItem => 
      !semanticAnalysis.some(advancedItem => 
        advancedItem.itReferencia === legacyItem.itReferencia
      )
    );
    itensVerificados.push(...uniqueLegacyItems);
    
    // 7. Calcular estatísticas e conformidade geral
    const stats = getAnalysisStats(itensVerificados);
    
    const observacoes = `
📊 ANÁLISE ULTRATHINK CONCLUÍDA

📄 DOCUMENTO: ${extractedContent.metadata.title || file.name}
📏 PROCESSAMENTO: ${extractedContent.metadata.pages} páginas, ${extractedContent.sections.length} seções, ${extractedContent.text.length} caracteres

🔍 VERIFICAÇÕES EXECUTADAS:
• ${complianceResults.length} verificações avançadas de conformidade
• ${Object.keys(IT_REQUIREMENTS).length} verificações legadas  
• ${semanticAnalysis.length} análises semânticas avançadas
• ${uniqueLegacyItems.length} análises semânticas legadas

📈 RESULTADOS:
• ${stats.total} itens verificados total
• ${stats.conforme} conformes (${Math.round(stats.conforme/stats.total*100)}%)
• ${stats.naoConforme} não conformes (${Math.round(stats.naoConforme/stats.total*100)}%)
• ${stats.parcial} parciais (${Math.round(stats.parcial/stats.total*100)}%)

⚠️ CRITICIDADE:
• ${stats.critical} itens críticos
• ${stats.high} itens de prioridade alta
• ${stats.medium} itens de prioridade média
• ${stats.low} itens de prioridade baixa

🎯 QUALIDADE DO DOCUMENTO: ${documentContext.qualityScore}%
📊 COMPLETUDE: ${documentContext.completeness}%
🔍 TIPO DETECTADO: ${documentContext.documentType}

💡 CONFORMIDADE GERAL: ${stats.conformidade}%
    `.trim();
    
    return {
      conformidade: stats.conformidade,
      itensVerificados,
      observacoes,
      contexto: documentContext
    };
    
  } catch (error) {
    console.error('❌ Erro na análise ULTRATHINK do memorial:', error);
    throw new Error(`Falha na análise avançada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// Análise semântica com as ITs disponíveis
async function performSemanticAnalysis(
  content: ExtractedContent, 
  instructions: InstrucaoTecnica[]
): Promise<ItemVerificacao[]> {
  const semanticItems: ItemVerificacao[] = [];
  
  // Buscar por termos chave em cada IT
  for (const instruction of instructions.slice(0, 5)) { // Aumentar para 5 ITs
    const similarity = calculateTextSimilarity(content.text, instruction.descricao);
    
    if (similarity > 0.15) { // Threshold mínimo ajustado
      let resultado: VerificationResult;
      let observacao: string;
      let severidade: Severity = Severity.MEDIUM;
      
      if (similarity > 0.6) {
        resultado = VerificationResult.CONFORME;
        observacao = `Alta correspondência com ${instruction.titulo} (${Math.round(similarity * 100)}% similaridade)`;
        severidade = Severity.LOW;
      } else if (similarity > 0.4) {
        resultado = VerificationResult.PARCIAL;
        observacao = `Correspondência parcial com ${instruction.titulo} (${Math.round(similarity * 100)}% similaridade) - requer revisão`;
        severidade = Severity.MEDIUM;
      } else {
        resultado = VerificationResult.NAO_CONFORME;
        observacao = `Baixa correspondência com ${instruction.titulo} (${Math.round(similarity * 100)}% similaridade) - requer adequação`;
        severidade = Severity.HIGH;
      }
      
      semanticItems.push({
        id: `semantic-${instruction.id}`,
        item: `Análise semântica: ${instruction.titulo}`,
        resultado,
        observacao,
        itReferencia: instruction.numero,
        severidade,
        analiseId: '',
        createdAt: new Date().toISOString()
      });
    }
  }
  
  return semanticItems;
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// Função auxiliar para melhorar a análise com regras específicas
export function addCustomRules(customRules: Record<string, unknown>) {
  // Permitir adicionar regras customizadas em runtime
  Object.assign(IT_REQUIREMENTS, customRules);
}

// ✔️ Protegido com AIDEV-PROTECTED