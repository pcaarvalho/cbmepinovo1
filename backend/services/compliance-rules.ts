import { VerificationResult, Severity, ItemVerificacao } from '@/types';

// Padrões regex avançados para extração de dados técnicos
export const ADVANCED_PATTERNS = {
  // Responsável Técnico - captura nome, profissão e registro
  responsavelTecnico: {
    pattern: /(?:respons[aá]vel\s+t[eé]cnico|rt\s*[:.]?)\s*([^\n\r]*?)(?:(?:crea|cau|corem)\s*(?:n[º°]?)?\s*[:\-]?\s*([0-9\.\-\/]+))?/gi,
    extract: (match: RegExpMatchArray) => ({
      nome: match[1]?.trim(),
      registro: match[2]?.trim()
    })
  },

  // Área - diferentes formatos numéricos
  area: {
    pattern: /(?:[aá]rea|superfície)(?:\s+(?:total|constru[íi]da|bruta|[úu]til))?\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)\s*m[²2]?/gi,
    extract: (match: RegExpMatchArray) => parseFloat(match[1].replace(',', '.'))
  },

  // Altura da edificação
  altura: {
    pattern: /(?:altura|gabarito|p[ée]\-direito)(?:\s+(?:total|da\s+edifica[çc][aã]o|m[aá]xima))?\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)\s*m(?:etros?)?/gi,
    extract: (match: RegExpMatchArray) => parseFloat(match[1].replace(',', '.'))
  },

  // Ocupação - grupos e subgrupos
  ocupacao: {
    pattern: /(?:ocupa[çc][aã]o|classifica[çc][aã]o|grupo|subgrupo)\s*[:\-]?\s*([A-Z]\d*(?:\-\d+)?)/gi,
    extract: (match: RegExpMatchArray) => match[1]?.trim().toUpperCase()
  },

  // Saídas de emergência - largura e quantidade
  saidasEmergencia: {
    pattern: /(?:sa[íi]da|exit)(?:s)?\s+(?:de\s+)?emerg[êe]ncia[^.]*?(?:largura|width)\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)\s*m/gi,
    extract: (match: RegExpMatchArray) => parseFloat(match[1].replace(',', '.'))
  },

  // População/Lotação
  populacao: {
    pattern: /(?:popula[çc][aã]o|lota[çc][aã]o|capacidade|n[úu]mero\s+de\s+pessoas)\s*[:\-]?\s*([0-9]+)\s*(?:pessoas?)?/gi,
    extract: (match: RegExpMatchArray) => parseInt(match[1])
  },

  // Extintores - tipo e quantidade
  extintores: {
    pattern: /(?:extintor(?:es)?|extintores?)\s*[:\-]?\s*([0-9]+)?\s*(?:(?:de\s+)?(?:p[oó]\s+qu[íi]mico|[aá]gua|co2|espuma))?/gi,
    extract: (match: RegExpMatchArray) => ({
      quantidade: match[1] ? parseInt(match[1]) : null,
      tipo: match[0].toLowerCase()
    })
  },

  // Hidrantes
  hidrantes: {
    pattern: /hidrante(?:s)?\s*(?:interno|externo|tipo\s+[12])?\s*[:\-]?\s*([0-9]+)?/gi,
    extract: (match: RegExpMatchArray) => ({
      quantidade: match[1] ? parseInt(match[1]) : null,
      tipo: match[0].toLowerCase()
    })
  },

  // Iluminação de emergência - autonomia
  iluminacao: {
    pattern: /ilumina[çc][aã]o\s+(?:de\s+)?emerg[êe]ncia[^.]*?autonomia\s*[:\-]?\s*([0-9]+)\s*h(?:ora)?/gi,
    extract: (match: RegExpMatchArray) => parseInt(match[1])
  },

  // Reserva técnica de incêndio
  reservaIncendio: {
    pattern: /reserva\s+(?:t[eé]cnica\s+(?:de\s+)?)?inc[êe]ndio\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)\s*(?:litros?|l|m[³3])/gi,
    extract: (match: RegExpMatchArray) => parseFloat(match[1].replace(',', '.'))
  },

  // Materiais de acabamento
  materiais: {
    pattern: /(?:material|revestimento|acabamento)[^.]*?(?:classe|[íi]ndice)\s*[:\-]?\s*([ABC][012]?)/gi,
    extract: (match: RegExpMatchArray) => match[1]?.trim().toUpperCase()
  }
};

// Regras de conformidade específicas por IT
export const COMPLIANCE_RULES = {
  'IT-001': {
    name: 'Procedimentos Administrativos',
    verificacoes: [
      {
        id: 'rt_identificacao',
        descricao: 'Identificação do responsável técnico',
        verificar: (texto: string): ItemVerificacao => {
          const pattern = ADVANCED_PATTERNS.responsavelTecnico;
          const matches = Array.from(texto.matchAll(pattern.pattern));
          
          if (matches.length > 0) {
            const data = pattern.extract(matches[0]);
            
            if (data.nome && data.registro) {
              return criarItem('rt_identificacao', 'Identificação do responsável técnico', 
                VerificationResult.CONFORME, `RT identificado: ${data.nome}, Registro: ${data.registro}`, 'IT-001/2024', Severity.MEDIUM);
            } else if (data.nome) {
              return criarItem('rt_identificacao', 'Identificação do responsável técnico', 
                VerificationResult.PARCIAL, `RT identificado: ${data.nome}, mas registro profissional não informado`, 'IT-001/2024', Severity.HIGH);
            }
          }
          
          return criarItem('rt_identificacao', 'Identificação do responsável técnico', 
            VerificationResult.NAO_CONFORME, 'Responsável técnico não identificado no memorial', 'IT-001/2024', Severity.CRITICAL);
        }
      }
    ]
  },

  'IT-004': {
    name: 'Classificação das Edificações',
    verificacoes: [
      {
        id: 'classificacao_ocupacao',
        descricao: 'Classificação quanto à ocupação',
        verificar: (texto: string): ItemVerificacao => {
          const pattern = ADVANCED_PATTERNS.ocupacao;
          const matches = Array.from(texto.matchAll(pattern.pattern));
          
          if (matches.length > 0) {
            const ocupacao = pattern.extract(matches[0]);
            
            // Validar se é uma classificação válida
            const classificacoesValidas = ['A-1', 'A-2', 'A-3', 'B-1', 'B-2', 'C-1', 'C-2', 'C-3', 'D', 'E', 'F-1', 'F-2', 'F-3', 'F-4', 'F-5', 'F-6', 'F-7', 'F-8', 'F-9', 'F-10', 'G', 'H-1', 'H-2', 'H-3', 'H-4', 'H-5', 'H-6', 'I-1', 'I-2', 'I-3', 'J-1', 'J-2', 'J-3', 'J-4', 'L', 'M-1', 'M-2', 'M-3', 'M-4'];
            
            if (classificacoesValidas.includes(ocupacao)) {
              return criarItem('classificacao_ocupacao', 'Classificação quanto à ocupação', 
                VerificationResult.CONFORME, `Ocupação classificada como ${ocupacao}`, 'IT-004/2024', Severity.HIGH);
            } else {
              return criarItem('classificacao_ocupacao', 'Classificação quanto à ocupação', 
                VerificationResult.NAO_CONFORME, `Classificação ${ocupacao} não reconhecida ou inválida`, 'IT-004/2024', Severity.HIGH);
            }
          }
          
          return criarItem('classificacao_ocupacao', 'Classificação quanto à ocupação', 
            VerificationResult.NAO_CONFORME, 'Classificação da ocupação não informada', 'IT-004/2024', Severity.HIGH);
        }
      }
    ]
  },

  'IT-008': {
    name: 'Saídas de Emergência',
    verificacoes: [
      {
        id: 'largura_saidas',
        descricao: 'Largura mínima das saídas de emergência',
        verificar: (texto: string): ItemVerificacao => {
          const patternSaidas = ADVANCED_PATTERNS.saidasEmergencia;
          const patternArea = ADVANCED_PATTERNS.area;
          const patternPopulacao = ADVANCED_PATTERNS.populacao;
          
          const matchesSaidas = Array.from(texto.matchAll(patternSaidas.pattern));
          const matchesArea = Array.from(texto.matchAll(patternArea.pattern));
          const matchesPopulacao = Array.from(texto.matchAll(patternPopulacao.pattern));
          
          if (matchesSaidas.length > 0) {
            const largura = patternSaidas.extract(matchesSaidas[0]);
            let area = 0;
            let populacao = 0;
            
            if (matchesArea.length > 0) {
              area = patternArea.extract(matchesArea[0]);
            }
            
            if (matchesPopulacao.length > 0) {
              populacao = patternPopulacao.extract(matchesPopulacao[0]);
            }
            
            // Regra simplificada: largura mínima baseada na área ou população
            let larguraMinima = 1.2; // Padrão
            
            if (area > 750 || populacao > 200) {
              larguraMinima = 1.2;
            } else if (area > 300 || populacao > 100) {
              larguraMinima = 1.1;
            } else {
              larguraMinima = 0.9;
            }
            
            if (largura >= larguraMinima) {
              return criarItem('largura_saidas', 'Largura mínima das saídas de emergência', 
                VerificationResult.CONFORME, `Largura de ${largura}m atende o mínimo de ${larguraMinima}m`, 'IT-008/2024', Severity.CRITICAL);
            } else {
              return criarItem('largura_saidas', 'Largura mínima das saídas de emergência', 
                VerificationResult.NAO_CONFORME, `Largura de ${largura}m inferior ao mínimo de ${larguraMinima}m`, 'IT-008/2024', Severity.CRITICAL);
            }
          }
          
          return criarItem('largura_saidas', 'Largura mínima das saídas de emergência', 
            VerificationResult.NAO_CONFORME, 'Largura das saídas de emergência não especificada', 'IT-008/2024', Severity.CRITICAL);
        }
      }
    ]
  },

  'IT-018': {
    name: 'Iluminação de Emergência',
    verificacoes: [
      {
        id: 'autonomia_iluminacao',
        descricao: 'Autonomia mínima da iluminação de emergência',
        verificar: (texto: string): ItemVerificacao => {
          const pattern = ADVANCED_PATTERNS.iluminacao;
          const matches = Array.from(texto.matchAll(pattern.pattern));
          
          if (matches.length > 0) {
            const autonomia = pattern.extract(matches[0]);
            
            if (autonomia >= 2) {
              return criarItem('autonomia_iluminacao', 'Autonomia mínima da iluminação de emergência', 
                VerificationResult.CONFORME, `Autonomia de ${autonomia}h atende o mínimo de 2h`, 'IT-018/2024', Severity.HIGH);
            } else {
              return criarItem('autonomia_iluminacao', 'Autonomia mínima da iluminação de emergência', 
                VerificationResult.NAO_CONFORME, `Autonomia de ${autonomia}h inferior ao mínimo de 2h`, 'IT-018/2024', Severity.HIGH);
            }
          }
          
          return criarItem('autonomia_iluminacao', 'Autonomia mínima da iluminação de emergência', 
            VerificationResult.NAO_CONFORME, 'Autonomia da iluminação de emergência não especificada', 'IT-018/2024', Severity.HIGH);
        }
      }
    ]
  },

  'IT-021': {
    name: 'Sistema de Extintores',
    verificacoes: [
      {
        id: 'distribuicao_extintores',
        descricao: 'Distribuição adequada de extintores',
        verificar: (texto: string): ItemVerificacao => {
          const patternExtintores = ADVANCED_PATTERNS.extintores;
          const patternArea = ADVANCED_PATTERNS.area;
          
          const matchesExtintores = Array.from(texto.matchAll(patternExtintores.pattern));
          const matchesArea = Array.from(texto.matchAll(patternArea.pattern));
          
          if (matchesExtintores.length > 0 && matchesArea.length > 0) {
            const area = patternArea.extract(matchesArea[0]);
            
            // Contar total de extintores mencionados
            let totalExtintores = 0;
            matchesExtintores.forEach(match => {
              const data = patternExtintores.extract(match);
              if (data.quantidade) {
                totalExtintores += data.quantidade;
              } else {
                totalExtintores += 1; // Assumir 1 se não especificado
              }
            });
            
            // Regra simplificada: 1 extintor por 150m² de área
            const extintoresNecessarios = Math.ceil(area / 150);
            
            if (totalExtintores >= extintoresNecessarios) {
              return criarItem('distribuicao_extintores', 'Distribuição adequada de extintores', 
                VerificationResult.CONFORME, `${totalExtintores} extintores para ${area}m² (mínimo: ${extintoresNecessarios})`, 'IT-021/2024', Severity.HIGH);
            } else {
              return criarItem('distribuicao_extintores', 'Distribuição adequada de extintores', 
                VerificationResult.NAO_CONFORME, `${totalExtintores} extintores insuficientes para ${area}m² (mínimo: ${extintoresNecessarios})`, 'IT-021/2024', Severity.HIGH);
            }
          }
          
          return criarItem('distribuicao_extintores', 'Distribuição adequada de extintores', 
            VerificationResult.NAO_CONFORME, 'Informações sobre extintores ou área insuficientes para verificação', 'IT-021/2024', Severity.HIGH);
        }
      }
    ]
  },

  'IT-022': {
    name: 'Sistema de Hidrantes',
    verificacoes: [
      {
        id: 'reserva_incendio',
        descricao: 'Reserva técnica de incêndio adequada',
        verificar: (texto: string): ItemVerificacao => {
          const patternReserva = ADVANCED_PATTERNS.reservaIncendio;
          const patternArea = ADVANCED_PATTERNS.area;
          
          const matchesReserva = Array.from(texto.matchAll(patternReserva.pattern));
          const matchesArea = Array.from(texto.matchAll(patternArea.pattern));
          
          if (matchesReserva.length > 0 && matchesArea.length > 0) {
            const reserva = patternReserva.extract(matchesReserva[0]);
            const area = patternArea.extract(matchesArea[0]);
            
            // Regra simplificada: 15L/m² para edificações comuns
            const reservaMinima = area * 15;
            
            if (reserva >= reservaMinima) {
              return criarItem('reserva_incendio', 'Reserva técnica de incêndio adequada', 
                VerificationResult.CONFORME, `Reserva de ${reserva}L atende o mínimo de ${reservaMinima}L para ${area}m²`, 'IT-022/2024', Severity.HIGH);
            } else {
              return criarItem('reserva_incendio', 'Reserva técnica de incêndio adequada', 
                VerificationResult.NAO_CONFORME, `Reserva de ${reserva}L inferior ao mínimo de ${reservaMinima}L para ${area}m²`, 'IT-022/2024', Severity.HIGH);
            }
          }
          
          return criarItem('reserva_incendio', 'Reserva técnica de incêndio adequada', 
            VerificationResult.NAO_CONFORME, 'Informações sobre reserva de incêndio ou área insuficientes', 'IT-022/2024', Severity.HIGH);
        }
      }
    ]
  }
};

// Função auxiliar para criar ItemVerificacao
function criarItem(
  id: string, 
  item: string, 
  resultado: VerificationResult, 
  observacao: string, 
  itReferencia: string, 
  severidade: Severity
): ItemVerificacao {
  return {
    id,
    item,
    resultado,
    observacao,
    itReferencia,
    severidade,
    analiseId: '',
    createdAt: new Date().toISOString()
  };
}

// Função principal para executar todas as verificações
export function executeComplianceRules(texto: string): ItemVerificacao[] {
  const resultados: ItemVerificacao[] = [];
  
  // Executar verificações de cada IT
  for (const [itCode, itData] of Object.entries(COMPLIANCE_RULES)) {
    for (const verificacao of itData.verificacoes) {
      try {
        const resultado = verificacao.verificar(texto);
        resultados.push(resultado);
      } catch (error) {
        console.error(`Erro na verificação ${verificacao.id} da ${itCode}:`, error);
        // Adicionar item de erro
        resultados.push(criarItem(
          verificacao.id,
          verificacao.descricao,
          VerificationResult.NAO_CONFORME,
          `Erro na verificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          itCode,
          Severity.HIGH
        ));
      }
    }
  }
  
  return resultados;
}

// Função para estatísticas da análise
export function getAnalysisStats(itens: ItemVerificacao[]) {
  const stats = {
    total: itens.length,
    conforme: itens.filter(i => i.resultado === 'CONFORME').length,
    naoConforme: itens.filter(i => i.resultado === 'NAO_CONFORME').length,
    parcial: itens.filter(i => i.resultado === 'PARCIAL').length,
    naoAplicavel: itens.filter(i => i.resultado === 'NAO_APLICAVEL').length,
    critical: itens.filter(i => i.severidade === 'CRITICAL').length,
    high: itens.filter(i => i.severidade === 'HIGH').length,
    medium: itens.filter(i => i.severidade === 'MEDIUM').length,
    low: itens.filter(i => i.severidade === 'LOW').length
  };
  
  const aplicaveis = stats.total - stats.naoAplicavel;
  const conformidade = aplicaveis > 0 ? Math.round((stats.conforme / aplicaveis) * 100) : 0;
  
  return {
    ...stats,
    aplicaveis,
    conformidade
  };
}