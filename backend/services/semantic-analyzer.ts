import { InstrucaoTecnica, ItemVerificacao, VerificationResult, Severity } from '@/types';
import { ExtractedContent } from './pdf-extractor';

// Sistema de embeddings simplificado para análise semântica
interface SemanticVector {
  terms: Record<string, number>;
  magnitude: number;
}

interface SemanticMatch {
  instruction: InstrucaoTecnica;
  similarity: number;
  matchedTerms: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  sections: string[];
}

// Termos técnicos relevantes para cada categoria de IT
const TECHNICAL_TERMS = {
  'procedimentos': [
    'responsável técnico', 'rt', 'crea', 'cau', 'registro profissional',
    'memorial descritivo', 'projeto', 'aprovação', 'vistoria',
    'licença', 'alvará', 'habite-se', 'avcb', 'clcb'
  ],
  'classificacao': [
    'ocupação', 'grupo', 'subgrupo', 'área construída', 'altura',
    'gabarito', 'população', 'lotação', 'carga de incêndio',
    'risco', 'classificação', 'categoria'
  ],
  'saidas': [
    'saída de emergência', 'escada', 'rampa', 'porta corta-fogo',
    'largura', 'distância máxima', 'rotas de fuga', 'sinalização',
    'barra antipânico', 'dobradiça', 'fechadura', 'sentido de abertura'
  ],
  'iluminacao': [
    'iluminação de emergência', 'luminária', 'autonomia', 'bateria',
    'blocos autônomos', 'central', 'lâmpada', 'led', 'sensor',
    'fotoluminescente', 'nível de iluminamento', 'lux'
  ],
  'extintores': [
    'extintor', 'pó químico', 'água', 'co2', 'espuma', 'classe a',
    'classe b', 'classe c', 'classe d', 'classe k', 'agente extintor',
    'alcance', 'eficiência', 'distribuição', 'sinalização', 'suporte'
  ],
  'hidrantes': [
    'hidrante', 'mangueira', 'esguicho', 'conexão', 'storz',
    'bomba de incêndio', 'reservatório', 'casa de bombas',
    'pressão', 'vazão', 'teste hidrostático', 'rede', 'tubulação'
  ],
  'sprinklers': [
    'sprinkler', 'chuveiro automático', 'aspersor', 'bico',
    'resposta rápida', 'resposta padrão', 'temperatura de acionamento',
    'área de cobertura', 'densidade', 'reserva técnica', 'bomba jockey'
  ],
  'deteccao': [
    'detector', 'fumaça', 'temperatura', 'chama', 'gás',
    'central de alarme', 'acionador manual', 'sirene', 'strobe',
    'sensor', 'laço', 'endereçável', 'convencional', 'zona'
  ],
  'materiais': [
    'material de acabamento', 'revestimento', 'propagação de chamas',
    'densidade óptica', 'toxicidade', 'classe', 'índice',
    'ensaio', 'certificação', 'inmetro', 'norma', 'abnt'
  ],
  'ventilacao': [
    'ventilação', 'exaustão', 'insuflamento', 'pressurização',
    'antecâmara', 'escada pressurizada', 'damper', 'veneziana',
    'ventilador', 'duto', 'grelha', 'difusor'
  ]
};

// Pesos para diferentes tipos de correspondência (disponível para expansões futuras)
// const MATCHING_WEIGHTS = {
//   exactMatch: 1.0,      // Correspondência exata
//   stemMatch: 0.8,       // Correspondência por radical
//   synonymMatch: 0.7,    // Sinônimos
//   contextMatch: 0.6,    // Contexto semelhante
//   categoryMatch: 0.4    // Mesma categoria
// };

/**
 * Cria um vetor semântico a partir de um texto
 */
function createSemanticVector(text: string): SemanticVector {
  const normalizedText = text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, ' '); // Remove pontuação
  
  const words = normalizedText.split(/\s+/).filter(word => word.length > 2);
  const terms: Record<string, number> = {};
  
  // Contagem de termos com peso baseado na relevância técnica
  for (const word of words) {
    const weight = getTermWeight(word);
    terms[word] = (terms[word] || 0) + weight;
  }
  
  // Calcular magnitude do vetor
  const magnitude = Math.sqrt(Object.values(terms).reduce((sum, val) => sum + val * val, 0));
  
  return { terms, magnitude };
}

/**
 * Calcula o peso de um termo baseado na sua relevância técnica
 */
function getTermWeight(term: string): number {
  // Verificar se é um termo técnico específico
  for (const category of Object.values(TECHNICAL_TERMS)) {
    for (const techTerm of category) {
      if (techTerm.toLowerCase().includes(term) || term.includes(techTerm.toLowerCase())) {
        return 2.0; // Peso maior para termos técnicos
      }
    }
  }
  
  // Termos comuns recebem peso normal
  return 1.0;
}

/**
 * Calcula similaridade cosseno entre dois vetores semânticos
 */
function calculateCosineSimilarity(vector1: SemanticVector, vector2: SemanticVector): number {
  if (vector1.magnitude === 0 || vector2.magnitude === 0) return 0;
  
  let dotProduct = 0;
  const allTerms = new Set([...Object.keys(vector1.terms), ...Object.keys(vector2.terms)]);
  
  for (const term of allTerms) {
    const val1 = vector1.terms[term] || 0;
    const val2 = vector2.terms[term] || 0;
    dotProduct += val1 * val2;
  }
  
  return dotProduct / (vector1.magnitude * vector2.magnitude);
}

/**
 * Identifica termos correspondentes entre dois textos
 */
function findMatchingTerms(text1: string, text2: string): string[] {
  const vector1 = createSemanticVector(text1);
  const vector2 = createSemanticVector(text2);
  
  const matchingTerms: string[] = [];
  const threshold = 0.1; // Threshold mínimo para considerar correspondência
  
  for (const term of Object.keys(vector1.terms)) {
    if (vector2.terms[term] && vector1.terms[term] * vector2.terms[term] > threshold) {
      matchingTerms.push(term);
    }
  }
  
  return matchingTerms;
}

/**
 * Determina a confiança da correspondência baseada na similaridade
 */
function determineConfidence(similarity: number, matchedTermsCount: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (similarity > 0.7 && matchedTermsCount > 5) return 'HIGH';
  if (similarity > 0.5 && matchedTermsCount > 3) return 'MEDIUM';
  return 'LOW';
}

/**
 * Analisa correspondência semântica entre o memorial e uma IT específica
 */
function analyzeSemanticMatch(
  content: ExtractedContent, 
  instruction: InstrucaoTecnica
): SemanticMatch | null {
  const memorialVector = createSemanticVector(content.text);
  const instructionVector = createSemanticVector(instruction.descricao + ' ' + instruction.conteudo);
  
  const similarity = calculateCosineSimilarity(memorialVector, instructionVector);
  const matchedTerms = findMatchingTerms(content.text, instruction.descricao + ' ' + instruction.conteudo);
  
  // Threshold mínimo para considerar uma correspondência válida
  if (similarity < 0.15 && matchedTerms.length < 2) {
    return null;
  }
  
  const confidence = determineConfidence(similarity, matchedTerms.length);
  
  // Identificar seções relevantes do memorial
  const relevantSections = content.sections
    .filter(section => {
      const sectionVector = createSemanticVector(section.content);
      const sectionSimilarity = calculateCosineSimilarity(sectionVector, instructionVector);
      return sectionSimilarity > 0.2;
    })
    .map(section => section.title);
  
  return {
    instruction,
    similarity,
    matchedTerms,
    confidence,
    sections: relevantSections
  };
}

/**
 * Converte uma correspondência semântica em item de verificação
 */
function convertMatchToVerificationItem(match: SemanticMatch): ItemVerificacao {
  let resultado: VerificationResult;
  let observacao: string;
  let severidade: Severity;
  
  // Determinar resultado baseado na confiança e similaridade
  if (match.confidence === 'HIGH' && match.similarity > 0.6) {
    resultado = VerificationResult.CONFORME;
    observacao = `Alta correspondência com ${match.instruction.titulo}. ` +
               `Similaridade: ${Math.round(match.similarity * 100)}%. ` +
               `Termos encontrados: ${match.matchedTerms.slice(0, 3).join(', ')}${match.matchedTerms.length > 3 ? '...' : ''}.`;
    severidade = Severity.LOW;
  } else if (match.confidence === 'MEDIUM' && match.similarity > 0.4) {
    resultado = VerificationResult.PARCIAL;
    observacao = `Correspondência parcial com ${match.instruction.titulo}. ` +
               `Similaridade: ${Math.round(match.similarity * 100)}%. ` +
               `Requer revisão para garantir conformidade completa.`;
    severidade = Severity.MEDIUM;
  } else {
    resultado = VerificationResult.NAO_CONFORME;
    observacao = `Baixa correspondência com ${match.instruction.titulo}. ` +
               `Similaridade: ${Math.round(match.similarity * 100)}%. ` +
               `Memorial pode não atender aos requisitos desta IT.`;
    severidade = Severity.HIGH;
  }
  
  // Adicionar informações sobre seções relevantes
  if (match.sections.length > 0) {
    observacao += ` Seções analisadas: ${match.sections.join(', ')}.`;
  }
  
  return {
    id: `semantic-${match.instruction.id}`,
    item: `Análise semântica: ${match.instruction.titulo}`,
    resultado,
    observacao,
    itReferencia: match.instruction.numero,
    severidade,
    analiseId: '',
    createdAt: new Date().toISOString(),
    contexto: match.matchedTerms.join(', '),
    sugestao: generateSuggestion(match, resultado)
  };
}

/**
 * Gera sugestão específica baseada na correspondência
 */
function generateSuggestion(match: SemanticMatch, resultado: VerificationResult): string {
  const itTitle = match.instruction.titulo;
  
  switch (resultado) {
    case VerificationResult.CONFORME:
      return `Memorial atende aos requisitos da ${itTitle}. Continue mantendo este padrão de qualidade.`;
    
    case VerificationResult.PARCIAL:
      return `Revise o memorial para incluir mais detalhes técnicos relacionados à ${itTitle}. ` +
             `Considere detalhar melhor: ${match.matchedTerms.slice(0, 2).join(' e ')}.`;
    
    case VerificationResult.NAO_CONFORME:
      return `Memorial precisa ser adequado conforme ${itTitle}. ` +
             `Inclua informações sobre: ${getTechnicalRequirements(match.instruction.categoria)}.`;
    
    default:
      return `Verifique se os requisitos da ${itTitle} se aplicam ao seu projeto.`;
  }
}

/**
 * Retorna requisitos técnicos por categoria
 */
function getTechnicalRequirements(categoria: string): string {
  const requirements: Record<string, string> = {
    'procedimentos': 'identificação do RT, memorial descritivo detalhado, documentação técnica',
    'saidas': 'dimensionamento, larguras mínimas, rotas de fuga, sinalização',
    'iluminacao': 'autonomia mínima, distribuição, níveis de iluminamento',
    'extintores': 'tipos adequados, distribuição, sinalização, manutenção',
    'hidrantes': 'pressão, vazão, distribuição, reserva técnica',
    'deteccao': 'tipos de detectores, central de alarme, cobertura adequada'
  };
  
  return requirements[categoria.toLowerCase()] || 'requisitos técnicos específicos';
}

/**
 * Função principal de análise semântica avançada
 */
export async function performAdvancedSemanticAnalysis(
  content: ExtractedContent,
  instructions: InstrucaoTecnica[]
): Promise<ItemVerificacao[]> {
  const semanticItems: ItemVerificacao[] = [];
  
  console.log(`🧠 Iniciando análise semântica avançada com ${instructions.length} ITs...`);
  
  // Analisar correspondência com cada IT
  for (const instruction of instructions) {
    try {
      const match = analyzeSemanticMatch(content, instruction);
      
      if (match) {
        const verificationItem = convertMatchToVerificationItem(match);
        semanticItems.push(verificationItem);
        
        console.log(`✅ Correspondência encontrada: ${instruction.titulo} (${Math.round(match.similarity * 100)}%)`);
      }
    } catch (error) {
      console.error(`Erro na análise semântica da ${instruction.titulo}:`, error);
      
      // Adicionar item de erro
      semanticItems.push({
        id: `semantic-error-${instruction.id}`,
        item: `Análise semântica: ${instruction.titulo}`,
        resultado: VerificationResult.NAO_CONFORME,
        observacao: `Erro na análise semântica: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        itReferencia: instruction.numero,
        severidade: Severity.MEDIUM,
        analiseId: '',
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Ordenar por relevância (similaridade decrescente)
  semanticItems.sort((a, b) => {
    const similarityA = parseFloat(a.observacao?.match(/(\d+)%/)?.[1] || '0');
    const similarityB = parseFloat(b.observacao?.match(/(\d+)%/)?.[1] || '0');
    return similarityB - similarityA;
  });
  
  console.log(`🎯 Análise semântica concluída: ${semanticItems.length} correspondências encontradas`);
  
  return semanticItems;
}

/**
 * Análise contextual específica por tipo de documento
 */
export function analyzeDocumentContext(content: ExtractedContent): {
  documentType: string;
  completeness: number;
  missingElements: string[];
  qualityScore: number;
} {
  const text = content.text.toLowerCase();
  
  // Detectar tipo de documento
  let documentType = 'unknown';
  if (text.includes('memorial descritivo')) documentType = 'memorial_descritivo';
  else if (text.includes('projeto técnico')) documentType = 'projeto_tecnico';
  else if (text.includes('laudo técnico')) documentType = 'laudo_tecnico';
  
  // Verificar elementos obrigatórios
  const requiredElements = [
    'responsável técnico',
    'área construída',
    'altura',
    'ocupação',
    'sistema de segurança'
  ];
  
  const foundElements = requiredElements.filter(element => 
    text.includes(element.toLowerCase())
  );
  
  const completeness = (foundElements.length / requiredElements.length) * 100;
  const missingElements = requiredElements.filter(element => 
    !text.includes(element.toLowerCase())
  );
  
  // Calcular score de qualidade baseado em vários fatores
  let qualityScore = 0;
  
  // Pontuação por completude
  qualityScore += completeness * 0.4;
  
  // Pontuação por quantidade de seções identificadas
  qualityScore += Math.min((content.sections.length / 8) * 100, 100) * 0.3;
  
  // Pontuação por presença de dados técnicos específicos
  const technicalTermsFound = Object.values(TECHNICAL_TERMS)
    .flat()
    .filter(term => text.includes(term.toLowerCase())).length;
  
  qualityScore += Math.min((technicalTermsFound / 20) * 100, 100) * 0.3;
  
  return {
    documentType,
    completeness: Math.round(completeness),
    missingElements,
    qualityScore: Math.round(qualityScore)
  };
}