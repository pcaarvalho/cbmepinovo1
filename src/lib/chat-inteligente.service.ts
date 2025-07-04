// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { 
  IntencaoPergunta, 
  ContextoConversa, 
  RespostaInteligente,
  TipoEdificacao,
  DetalheItem,
  ResultadoValidacao
} from '@/types/chat-inteligente';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export class ChatInteligenteService {
  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  // Detector de Intenção
  static detectarIntencao(pergunta: string): IntencaoPergunta {
    const perguntaLower = pergunta.toLowerCase();

    if (perguntaLower.match(/quantos?|calcular|dimensionar|quantidade|número/i)) {
      return 'CALCULO';
    }
    if (perguntaLower.match(/o que é|defini[çc]ão|significa|conceito/i)) {
      return 'DEFINICAO';
    }
    if (perguntaLower.match(/como fazer|procedimento|passo|etapa|processo/i)) {
      return 'TUTORIAL';
    }
    if (perguntaLower.match(/posso|preciso|obrigat[óo]rio|necess[áa]rio|deve/i)) {
      return 'VALIDACAO';
    }
    if (perguntaLower.match(/todas?|lista|quais|enumere|cite/i)) {
      return 'LISTAGEM';
    }
    if (perguntaLower.match(/diferen[çc]a|comparar|versus|melhor/i)) {
      return 'COMPARACAO';
    }
    if (perguntaLower.match(/norma|lei|regulamento|portaria|decreto/i)) {
      return 'NORMATIVA';
    }
    
    return 'DEFINICAO'; // Default
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  // Extrator de Contexto
  static extrairContextoDaPergunta(pergunta: string, contextoAtual: ContextoConversa): Partial<ContextoConversa> {
    const atualizacoes: Partial<ContextoConversa> = {};
    const perguntaLower = pergunta.toLowerCase();

    // Extrair área
    const areaMatch = pergunta.match(/(\d+)\s*m[²2]/i);
    if (areaMatch) {
      atualizacoes.areaTotal = parseInt(areaMatch[1]);
    }

    // Extrair tipo de edificação
    const tiposEdificacao: Record<string, TipoEdificacao> = {
      'comercial': 'comercial',
      'loja': 'comercial',
      'comércio': 'comercial',
      'residencial': 'residencial',
      'casa': 'residencial',
      'apartamento': 'residencial',
      'condomínio': 'residencial',
      'industrial': 'industrial',
      'fábrica': 'industrial',
      'indústria': 'industrial',
      'hospital': 'hospitalar',
      'clínica': 'hospitalar',
      'escola': 'educacional',
      'universidade': 'educacional',
      'faculdade': 'educacional',
      'escritório': 'escritorio',
      'restaurante': 'restaurante',
      'lanchonete': 'restaurante',
      'depósito': 'deposito',
      'armazém': 'deposito',
      'posto': 'posto-combustivel',
      'gasolina': 'posto-combustivel',
      'shopping': 'shopping'
    };

    for (const [palavra, tipo] of Object.entries(tiposEdificacao)) {
      if (perguntaLower.includes(palavra)) {
        atualizacoes.tipoEdificacao = tipo;
        break;
      }
    }

    // Extrair número de andares
    const andaresMatch = pergunta.match(/(\d+)\s*andar(?:es)?/i);
    if (andaresMatch) {
      atualizacoes.numeroAndares = parseInt(andaresMatch[1]);
    }

    // Extrair ITs mencionadas
    const itsMatch = pergunta.match(/IT[-\s]?(\d+)/gi);
    if (itsMatch) {
      const novasITs = itsMatch.map(it => it.replace(/\s/g, '-').toUpperCase());
      atualizacoes.itsJaMencionadas = [...new Set([...(contextoAtual.itsJaMencionadas || []), ...novasITs])];
    }

    return atualizacoes;
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  // Formatar Resposta por Tipo
  static formatarRespostaPorTipo(
    intencao: IntencaoPergunta,
    contexto: ContextoConversa,
    conteudo: any
  ): RespostaInteligente {
    switch (intencao) {
      case 'CALCULO':
        return this.formatarRespostaCalculo(contexto, conteudo);
      
      case 'DEFINICAO':
        return this.formatarRespostaDefinicao(conteudo);
      
      case 'TUTORIAL':
        return this.formatarRespostaTutorial(conteudo);
      
      case 'VALIDACAO':
        return this.formatarRespostaValidacao(conteudo);
      
      case 'LISTAGEM':
        return this.formatarRespostaListagem(conteudo);
      
      default:
        return this.formatarRespostaPadrao(conteudo);
    }
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  // Formatadores Específicos
  private static formatarRespostaCalculo(contexto: ContextoConversa, conteudo: any): RespostaInteligente {
    const { calculo, resultado, referencia } = conteudo;
    
    return {
      resumo: `📌 ${resultado}`,
      detalhes: [
        {
          item: "Cálculo conforme normativa",
          referencia: referencia,
          calculo: calculo
        }
      ],
      dica: `💡 ${conteudo.dica || 'Verifique sempre a classificação de risco da edificação antes de aplicar os cálculos.'}`,
      relacionadas: conteudo.relacionadas || [],
      sugestoes: [
        "Como posicionar os equipamentos calculados?",
        "Quais são os requisitos de sinalização?",
        "Preciso de brigada de incêndio?"
      ]
    };
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  private static formatarRespostaDefinicao(conteudo: any): RespostaInteligente {
    return {
      resumo: conteudo.definicao,
      detalhes: conteudo.detalhes?.map((d: any) => ({
        item: d.item,
        referencia: d.referencia
      })) || [],
      dica: `💡 ${conteudo.aplicacao || 'Consulte a IT completa para informações detalhadas.'}`,
      relacionadas: conteudo.relacionadas || [],
      sugestoes: conteudo.sugestoes || [
        "Onde isso se aplica?",
        "Quais são os requisitos técnicos?",
        "Como dimensionar?"
      ]
    };
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  private static formatarRespostaTutorial(conteudo: any): RespostaInteligente {
    const passos = conteudo.passos || [];
    return {
      resumo: `📋 Procedimento com ${passos.length} passos principais`,
      detalhes: passos.map((passo: any, index: number) => ({
        item: `Passo ${index + 1}: ${passo.descricao}`,
        referencia: passo.referencia || conteudo.referencia
      })),
      dica: `💡 ${conteudo.dica || 'Siga todos os passos na ordem indicada para garantir conformidade.'}`,
      relacionadas: conteudo.relacionadas || [],
      sugestoes: [
        "Quais documentos são necessários?",
        "Quanto tempo leva o processo?",
        "Quais são os custos envolvidos?"
      ]
    };
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  private static formatarRespostaValidacao(conteudo: any): RespostaInteligente {
    const validacao: ResultadoValidacao = conteudo;
    
    return {
      resumo: validacao.valido 
        ? `✅ ${validacao.mensagem}`
        : `⚠️ ${validacao.mensagem}`,
      detalhes: [
        {
          item: validacao.valido ? "Conformidade verificada" : "Não conformidade identificada",
          referencia: validacao.referenciaNormativa
        },
        ...(validacao.correcao ? [{
          item: `Correção necessária: ${validacao.correcao}`,
          referencia: validacao.referenciaNormativa
        }] : [])
      ],
      dica: validacao.valido
        ? "💡 Mantenha a documentação atualizada para facilitar fiscalizações."
        : `💡 ${validacao.correcao || 'Corrija as não conformidades antes da vistoria.'}`,
      relacionadas: conteudo.relacionadas || [],
      sugestoes: validacao.valido
        ? ["Quais outros requisitos devo verificar?", "Como manter a conformidade?"]
        : ["Como corrigir este problema?", "Qual o prazo para adequação?", "Há multas previstas?"]
    };
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  private static formatarRespostaListagem(conteudo: any): RespostaInteligente {
    const itens = conteudo.itens || [];
    return {
      resumo: `📋 ${conteudo.titulo || 'Lista completa com'} ${itens.length} itens`,
      detalhes: itens.map((item: any) => ({
        item: item.descricao,
        referencia: item.referencia || conteudo.referencia
      })),
      dica: `💡 ${conteudo.dica || 'Cada item pode ter requisitos específicos adicionais.'}`,
      relacionadas: conteudo.relacionadas || [],
      sugestoes: [
        "Qual item é mais importante?",
        "Como priorizar a implementação?",
        "Há exceções ou casos especiais?"
      ]
    };
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  private static formatarRespostaPadrao(conteudo: any): RespostaInteligente {
    return {
      resumo: conteudo.resumo || "Informação processada com sucesso",
      detalhes: conteudo.detalhes || [],
      dica: conteudo.dica || "💡 Consulte sempre as ITs específicas para seu caso.",
      relacionadas: conteudo.relacionadas || [],
      sugestoes: conteudo.sugestoes || [
        "Precisa de mais detalhes?",
        "Quer ver exemplos práticos?",
        "Tem dúvidas sobre aplicação?"
      ]
    };
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  // Gerar Contexto para Mensagem
  static gerarContextoMensagem(contexto: ContextoConversa): string {
    const partes: string[] = [];
    
    if (contexto.tipoEdificacao) {
      partes.push(`edificação ${contexto.tipoEdificacao}`);
    }
    if (contexto.areaTotal) {
      partes.push(`${contexto.areaTotal}m²`);
    }
    if (contexto.numeroAndares) {
      partes.push(`${contexto.numeroAndares} ${contexto.numeroAndares === 1 ? 'andar' : 'andares'}`);
    }
    
    if (partes.length > 0) {
      return `Considerando sua ${partes.join(' de ')}, `;
    }
    
    return '';
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  // Validar Conformidade
  static validarConformidade(
    valor: string | number,
    tipo: string,
    contexto: ContextoConversa
  ): ResultadoValidacao {
    // Implementação específica por tipo de validação
    // Este é um exemplo simplificado
    
    if (tipo === 'extintores') {
      const quantidade = typeof valor === 'string' ? parseInt(valor) : valor;
      const area = contexto.areaTotal || 0;
      const quantidadeMinima = Math.ceil(area / 150); // 1 extintor a cada 150m²
      
      if (quantidade < quantidadeMinima) {
        return {
          valido: false,
          mensagem: `NÃO! Para ${area}m² você precisa de NO MÍNIMO ${quantidadeMinima} extintores.`,
          correcao: `Instale ${quantidadeMinima - quantidade} extintor(es) adicional(is)`,
          referenciaNormativa: "IT-21, Seção 5.2.1",
          riscos: ["Multa", "Interdição", "Risco à segurança"]
        };
      }
      
      return {
        valido: true,
        mensagem: `SIM! ${quantidade} extintor(es) é adequado para ${area}m².`,
        referenciaNormativa: "IT-21, Seção 5.2.1"
      };
    }
    
    // Outras validações...
    return {
      valido: true,
      mensagem: "Validação não implementada para este tipo",
      referenciaNormativa: "N/A"
    };
  }
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// Exemplos de uso predefinidos
export const EXEMPLOS_PERGUNTAS = {
  CALCULO: [
    "quantos extintores para loja 450m²?",
    "como calcular hidrantes para prédio comercial?",
    "dimensionar saída de emergência para 200 pessoas"
  ],
  DEFINICAO: [
    "o que é extintor ABC?",
    "o que significa brigada de incêndio?",
    "definição de rota de fuga"
  ],
  TUTORIAL: [
    "como fazer vistoria do corpo de bombeiros?",
    "procedimento para obter AVCB",
    "passo a passo para projeto de incêndio"
  ],
  VALIDACAO: [
    "1 extintor é suficiente para 500m²?",
    "preciso de brigada para escritório pequeno?",
    "é obrigatório hidrante em prédio de 3 andares?"
  ],
  LISTAGEM: [
    "quais ITs para restaurante?",
    "lista de documentos para AVCB",
    "todos os tipos de extintores"
  ]
};

// ✔️ Protegido com AIDEV-PROTECTED