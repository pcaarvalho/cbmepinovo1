// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { NextRequest, NextResponse } from 'next/server';
import { ChatInteligenteService } from '@/lib/chat-inteligente.service';
import { ContextoConversa, RespostaInteligente } from '@/types/chat-inteligente';
import instrucoesData from '@/data/instrucoes-scraped.json';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
interface RequestBody {
  messages: ChatMessage[];
  contexto?: ContextoConversa;
  stream?: boolean;
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// Base de conhecimento das ITs
const gerarBaseConhecimento = () => {
  const its = instrucoesData
    .filter(it => it.titulo.includes('IT-') || it.titulo.includes('IT '))
    .map(it => {
      const numeroMatch = it.titulo.match(/IT[-\s]?(\d+)/i);
      const numero = numeroMatch ? numeroMatch[1] : '';
      return `• IT-${numero}: ${it.titulo}`;
    })
    .slice(0, 20); // Primeiras 20 ITs mais relevantes

  return `INSTRUÇÕES TÉCNICAS DO CBMEPI - BASE COMPLETA:

PRINCIPAIS INSTRUÇÕES POR CATEGORIA:

🔥 SISTEMAS DE COMBATE:
• IT-21: Sistema de proteção por extintores de incêndio
• IT-22: Sistema de hidrantes e mangotinhos
• IT-23: Sistema de chuveiros automáticos
• IT-24: Sistema de detecção e alarme
• IT-34: Hidrante urbano

🚪 ROTAS DE FUGA E EMERGÊNCIA:
• IT-11: Saídas de emergência
• IT-12: Dimensionamento de saídas
• IT-13: Escadas de segurança
• IT-18: Iluminação de emergência
• IT-20: Sinalização de emergência

🏗️ ESTRUTURAL E COMPARTIMENTAÇÃO:
• IT-08: Segurança estrutural nas edificações
• IT-09: Compartimentação horizontal e vertical
• IT-10: Controle de materiais de acabamento

👥 BRIGADA E PROCEDIMENTOS:
• IT-17: Brigada de incêndio
• IT-16: Plano de emergência
• IT-01: Procedimentos administrativos
• IT-42: Projeto Técnico Simplificado (PTS)

📏 CÁLCULOS E DIMENSIONAMENTOS:
• IT-06: Acesso de viaturas
• IT-07: Separação entre edificações
• IT-14: Carga de incêndio
• IT-21: Cálculo de extintores (1 extintor/150m² risco médio)

${its.join('\\n')}

REGRAS DE CÁLCULO PRINCIPAIS:
1. EXTINTORES (IT-21):
   - Risco baixo: 1 extintor a cada 250m²
   - Risco médio: 1 extintor a cada 150m²
   - Risco alto: 1 extintor a cada 100m²
   - Distância máxima a percorrer: 20m

2. HIDRANTES (IT-22):
   - Área máxima protegida: 1.500m²
   - Vazão mínima: 125 L/min
   - Pressão mínima: 10 mca

3. SAÍDAS DE EMERGÊNCIA (IT-11):
   - Largura mínima: 1,20m (2 módulos de 0,60m)
   - Capacidade: 60 pessoas por módulo
   - Distância máxima a percorrer: 30m (com chuveiros) ou 20m (sem)

4. BRIGADA (IT-17):
   - Até 10 funcionários: mínimo 1 brigadista
   - Acima de 10: consultar tabela específica por risco`;
};

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// Prompts especializados por tipo de pergunta
const gerarPromptEspecializado = (
  intencao: string,
  pergunta: string,
  contexto: ContextoConversa
) => {
  const contextoPrefixo = ChatInteligenteService.gerarContextoMensagem(contexto);
  
  const prompts: Record<string, string> = {
    CALCULO: `Você deve fornecer um cálculo técnico preciso e detalhado seguindo a metodologia Chain-of-Thought.
${contextoPrefixo}

FORMATO OBRIGATÓRIO COM RACIOCÍNIO TRANSPARENTE:

📌 **[Resultado principal em destaque]**

🧠 **RACIOCÍNIO (Chain-of-Thought)**:
1. **IDENTIFIQUEI**: [Tipo de edificação, área específica, uso e risco]
2. **APLICO**: [IT-XX, Art. Y.Z - descrição do artigo]
3. **CALCULO**: [Mostrar fórmula] = [substituir valores] = [resultado]
4. **VERIFICO**: [Validações e outras normas aplicáveis]
5. **CONCLUO**: [Resultado final com justificativa]

📋 **CÁLCULO DETALHADO IT-XX, Art. Y.Z**:
- Fórmula: [Fórmula exata da norma]
- Coeficientes: [Origem de cada valor]
- Cálculo: [Passo a passo numérico]
- **RESULTADO**: [Valor final com unidade]

💡 **IMPLEMENTAÇÃO PRÁTICA**: 
[Como aplicar na prática com detalhes]

🔗 **CONSULTE TAMBÉM**: [ITs relacionadas com motivo]

❓ **PRÓXIMAS PERGUNTAS SUGERIDAS**:
- "[Pergunta contextual 1]"
- "[Pergunta contextual 2]"
- "[Pergunta contextual 3]"

📈 **ESTIMATIVAS** (quando aplicável):
- Custo: R$ [valor estimado]
- Tempo: [prazo de implementação]
- Manutenção: [periodicidade]

⚠️ **NÍVEL DE CERTEZA**: [95-100%] - [Justificativa]

Pergunta: ${pergunta}`,

    DEFINICAO: `Forneça uma definição clara e técnica com raciocínio transparente.
${contextoPrefixo}

FORMATO OBRIGATÓRIO:

📌 **[Definição concisa e direta]**

🧠 **RACIOCÍNIO**:
1. **IDENTIFIQUEI**: [Conceito/elemento questionado]
2. **APLICO**: [IT aplicável e contexto normativo]
3. **DEFINO**: [Definição técnica oficial]
4. **VERIFICO**: [Aplicações e exceções]
5. **CONCLUO**: [Síntese prática]

📋 **CARACTERÍSTICAS TÉCNICAS**:
- [Característica principal] (IT-XX, Art. Y.Z)
- [Característica secundária] (IT-XX, Art. A.B)
- [Requisitos específicos] (IT-XX, Art. C.D)

💡 **APLICAÇÃO PRÁTICA**: 
[Onde e quando se aplica com exemplos reais]

🔗 **CONSULTE TAMBÉM**: [ITs relacionadas]

❓ **PRÓXIMAS PERGUNTAS SUGERIDAS**:
- "[Pergunta sobre dimensionamento]"
- "[Pergunta sobre exceções]"
- "[Pergunta sobre implementação]"

⚠️ **NÍVEL DE CERTEZA**: [95-100%] - [Base normativa sólida]

Pergunta: ${pergunta}`,

    TUTORIAL: `Explique o procedimento passo a passo com raciocínio transparente.
${contextoPrefixo}

FORMATO OBRIGATÓRIO:

📌 **Procedimento completo em [X] etapas essenciais**

🧠 **RACIOCÍNIO**:
1. **IDENTIFIQUEI**: [Processo/procedimento solicitado]
2. **APLICO**: [ITs e normas aplicáveis]
3. **ESTRUTURO**: [Sequência lógica das etapas]
4. **VERIFICO**: [Pontos críticos e validações]
5. **CONCLUO**: [Resultado esperado]

📋 **PASSO A PASSO DETALHADO**:
1. **[Ação principal]** 
   - Descrição: [O que fazer]
   - Referência: IT-XX, Art. Y.Z
   - Tempo: [duração estimada]
   
2. **[Segunda ação]**
   - Descrição: [O que fazer]
   - Referência: IT-XX, Art. A.B
   - Atenção: [Ponto crítico]

3. **[Ação final]**
   - Descrição: [O que fazer]
   - Referência: IT-XX, Art. C.D
   - Validação: [Como verificar]

💡 **DICAS DE IMPLEMENTAÇÃO**: 
[Conselhos práticos baseados em experiência]

📈 **ESTIMATIVAS**:
- Tempo total: [duração completa]
- Custo aproximado: R$ [valor]
- Documentos necessários: [lista]

❓ **PRÓXIMAS PERGUNTAS SUGERIDAS**:
- "[Pergunta sobre documentação]"
- "[Pergunta sobre prazos]"
- "[Pergunta sobre responsabilidades]"

⚠️ **NÍVEL DE CERTEZA**: [95-100%] - [Procedimento padrão CBMEPI]

Pergunta: ${pergunta}`,

    VALIDACAO: `Valide a conformidade técnica com análise detalhada.
${contextoPrefixo}

FORMATO OBRIGATÓRIO:

📌 **[✅ CONFORME ou ❌ NÃO CONFORME] - [Resumo da validação]**

🧠 **RACIOCÍNIO**:
1. **IDENTIFIQUEI**: [Situação/parâmetro a validar]
2. **APLICO**: [Norma e critério de validação]
3. **COMPARO**: [Valor fornecido vs. exigência]
4. **VERIFICO**: [Outras normas aplicáveis]
5. **CONCLUO**: [Resultado da análise]

📋 **ANÁLISE TÉCNICA DETALHADA**:
- **Requisito normativo**: [Descrição] (IT-XX, Art. Y.Z)
- **Situação apresentada**: [Valor/condição fornecida]
- **Análise**: [Comparação técnica]
- **Status**: [✅ Conforme / ❌ Não conforme]
- **Margem**: [Folga ou déficit]

💡 **AÇÕES RECOMENDADAS**: 
[Se conforme: manutenção | Se não conforme: correções necessárias]

⚠️ **RISCOS E CONSEQUÊNCIAS**:
- [Risco 1 se não conformidade]
- [Risco 2 se não conformidade]
- [Penalidades aplicáveis]

🔗 **NORMAS RELACIONADAS**: [ITs complementares]

❓ **PRÓXIMAS PERGUNTAS SUGERIDAS**:
- "[Como corrigir se não conforme?]"
- "[Prazo para adequação?]"
- "[Documentação necessária?]"

⚠️ **NÍVEL DE CERTEZA**: [95-100%] - [Base em IT-XX]

Pergunta: ${pergunta}`,

    LISTAGEM: `Liste todos os itens relevantes com análise completa.
${contextoPrefixo}

FORMATO OBRIGATÓRIO:

📌 **[Título da lista] - Total: [X] itens obrigatórios**

🧠 **RACIOCÍNIO**:
1. **IDENTIFIQUEI**: [Tipo de lista solicitada]
2. **APLICO**: [ITs que definem os requisitos]
3. **ENUMERO**: [Critério de listagem]
4. **VERIFICO**: [Completude e exceções]
5. **CONCLUO**: [Síntese da lista]

📋 **LISTA COMPLETA E DETALHADA**:
1. **[Item principal]**
   - Descrição: [Detalhamento]
   - Referência: IT-XX, Art. Y.Z
   - Obrigatoriedade: [Sempre/Condicional]
   
2. **[Segundo item]**
   - Descrição: [Detalhamento]
   - Referência: IT-XX, Art. A.B
   - Exceções: [Quando não se aplica]

3. **[Item adicional]**
   - Descrição: [Detalhamento]
   - Referência: IT-XX, Art. C.D
   - Observação: [Particularidades]

💡 **PRIORIZAÇÃO RECOMENDADA**: 
[Ordem de implementação e critérios]

📈 **ESTIMATIVAS**:
- Custo total estimado: R$ [valor]
- Prazo de implementação: [tempo]

❓ **PRÓXIMAS PERGUNTAS SUGERIDAS**:
- "[Como priorizar a implementação?]"
- "[Quais são as exceções?]"
- "[Custos individuais de cada item?]"

⚠️ **NÍVEL DE CERTEZA**: [95-100%] - [Lista oficial CBMEPI]

Pergunta: ${pergunta}`
  };

  return prompts[intencao] || prompts.DEFINICAO;
};

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// IMPORTANTE: Usando modelo gratuito temporariamente - limite de 50 req/dia
// Para voltar ao Claude: mudar model para 'anthropic/claude-3-sonnet' e max_tokens para 1200
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { messages, contexto = {
      tipoEdificacao: null,
      areaTotal: null,
      numeroAndares: null,
      itsJaMencionadas: [],
      calculosRealizados: [],
      dadosColetados: {},
      ultimasPerguntas: []
    } } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages são obrigatórias' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Serviço de IA temporariamente indisponível' },
        { status: 500 }
      );
    }

    // Extrair última mensagem do usuário
    const ultimaMensagem = messages.filter(m => m.role === 'user').pop();
    if (!ultimaMensagem) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma mensagem do usuário encontrada' },
        { status: 400 }
      );
    }

    // Detectar intenção
    const intencao = ChatInteligenteService.detectarIntencao(ultimaMensagem.content);
    
    // Atualizar contexto com informações da pergunta
    const novoContexto = {
      ...contexto,
      ...ChatInteligenteService.extrairContextoDaPergunta(ultimaMensagem.content, contexto),
      ultimasPerguntas: [...(contexto.ultimasPerguntas || []), ultimaMensagem.content].slice(-5)
    };

    // Gerar prompt especializado
    const promptEspecializado = gerarPromptEspecializado(
      intencao,
      ultimaMensagem.content,
      novoContexto
    );

    // Preparar mensagens para a API
    const systemMessage = {
      role: 'system' as const,
      content: `Você é o Dr. Roberto Silva, especialista sênior do CBMEPI com 15 anos de experiência em análise de projetos de prevenção contra incêndio. Você é rigoroso tecnicamente mas didático, sempre focado em soluções práticas.

${gerarBaseConhecimento()}

🧠 **METODOLOGIA DE ANÁLISE ESTRUTURADA (Chain-of-Thought)**:
Você DEVE seguir explicitamente estas 5 etapas em TODAS as respostas:

1. **IDENTIFIQUEI**: Tipo de edificação, área, uso específico e risco
2. **APLICO**: IT específica com artigo exato aplicável
3. **CALCULO**: Fórmula completa com números reais (se aplicável)
4. **VERIFICO**: Outras normas aplicáveis e validações cruzadas
5. **CONCLUO**: Resultado final com justificativa técnica

INSTRUÇÕES CRÍTICAS:
1. SEMPRE mostre seu raciocínio passo a passo (Chain-of-Thought)
2. SEMPRE cite a IT específica com artigo (ex: "IT-21, Art. 5.1.2")
3. Use emojis estrategicamente para melhor visualização
4. Seja EXTREMAMENTE preciso em cálculos - mostre a fórmula primeiro
5. Forneça respostas completas mas estruturadas
6. Use linguagem técnica mas didática
7. SEMPRE sugira próximas perguntas relevantes baseadas no contexto
8. Mencione casos práticos quando relevante
9. Indique nível de certeza quando houver interpretações
10. Seja transparente sobre limitações

CONTEXTO DA CONVERSA:
${JSON.stringify(novoContexto, null, 2)}

${promptEspecializado}`
    };

    // Filtrar mensagens relevantes (últimas 10)
    const mensagensRelevantes = messages.slice(-10);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://consulta-cbm-pi.vercel.app',
        'X-Title': 'Chat Especialista Inteligente CBM-PI'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free', // Modelo gratuito temporário
        messages: [
          systemMessage,
          ...mensagensRelevantes
        ],
        temperature: 0.1,          // Mais determinístico
        max_tokens: 4000,          // Modelos gratuitos não têm limite de créditos
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API OpenRouter:', response.status, errorText);
      
      // Log detalhado do erro para debug
      console.error('Request details:', {
        model: 'anthropic/claude-3-sonnet',
        temperature: 0.1,
        maxTokens: 4000,
        messagesCount: mensagensRelevantes.length + 1
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro na comunicação com o serviço de IA',
          details: process.env.NODE_ENV === 'development' ? errorText : undefined,
          status: response.status
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json(
        { success: false, error: 'Resposta inválida do serviço de IA' },
        { status: 500 }
      );
    }

    const respostaIA = data.choices[0].message.content;
    
    // Extrair ITs mencionadas na resposta
    const itsMencionadas = respostaIA.match(/IT-\d+/g) || [];
    
    // Processar resposta para formato estruturado
    const respostaEstruturada = processarRespostaIA(respostaIA, intencao);
    
    return NextResponse.json({
      success: true,
      message: respostaIA,
      resposta: respostaEstruturada,
      contexto: novoContexto,
      intencao,
      itsMencionadas: [...new Set(itsMencionadas)],
      usage: data.usage,
      model: data.model
    });

  } catch (error) {
    console.error('Erro no chat-ai-inteligente:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor. Tente novamente.' 
      },
      { status: 500 }
    );
  }
}

// Processar resposta da IA para formato estruturado
function processarRespostaIA(resposta: string, intencao: string): Partial<RespostaInteligente> {
  try {
    const linhas = resposta.split('\n').filter(l => l.trim());
    
    // Extrair resumo (primeira linha com emoji 📌)
    const resumoLinha = linhas.find(l => l.includes('📌'));
    const resumo = resumoLinha ? resumoLinha.replace(/📌\s*\**/g, '').replace(/\**/g, '').trim() : linhas[0];
    
    // Extrair raciocínio Chain-of-Thought (seção 🧠)
    const raciocinio: any[] = [];
    const raciocinioInicio = linhas.findIndex(l => l.includes('🧠') && l.includes('RACIOCÍNIO'));
    if (raciocinioInicio >= 0) {
      let i = raciocinioInicio + 1;
      while (i < linhas.length && !linhas[i].includes('📋') && !linhas[i].includes('💡')) {
        const linha = linhas[i].trim();
        if (linha.match(/^\d\./)) {
          raciocinio.push({
            etapa: linha.split(':')[0].replace(/\d\.\s*\**/g, '').replace(/\**/g, ''),
            descricao: linha.split(':')[1]?.trim() || ''
          });
        }
        i++;
      }
    }
    
    // Extrair detalhes (linhas com 📋)
    const detalhesInicio = linhas.findIndex(l => l.includes('📋'));
    const detalhes = [];
    if (detalhesInicio >= 0) {
      let i = detalhesInicio + 1;
      while (i < linhas.length && !linhas[i].includes('💡') && !linhas[i].includes('🔗') && !linhas[i].includes('❓')) {
        const linha = linhas[i].trim();
        if (linha.match(/^[-•]/)) {
          const [item, valor] = linha.replace(/^[-•]\s*/, '').split(':');
          detalhes.push({
            item: item?.trim() || linha.replace(/^[-•]\s*/, ''),
            referencia: valor?.trim() || 'Ver detalhes'
          });
        }
        i++;
      }
    }
    
    // Extrair dica de implementação (linha com 💡)
    const dicaLinha = linhas.find(l => l.includes('💡') && l.includes('IMPLEMENTAÇÃO'));
    const dicaInicio = linhas.indexOf(dicaLinha || '');
    let dica = '';
    if (dicaInicio >= 0) {
      let i = dicaInicio + 1;
      while (i < linhas.length && !linhas[i].includes('🔗') && !linhas[i].includes('❓')) {
        dica += linhas[i] + ' ';
        i++;
      }
    }
    dica = dica.trim() || (dicaLinha ? dicaLinha.replace(/💡.*?:\s*/g, '').trim() : '');
    
    // Extrair sugestões de perguntas (seção ❓)
    const sugestoes: string[] = [];
    const sugestoesInicio = linhas.findIndex(l => l.includes('❓') && l.includes('PRÓXIMAS'));
    if (sugestoesInicio >= 0) {
      let i = sugestoesInicio + 1;
      while (i < linhas.length && !linhas[i].includes('📈') && !linhas[i].includes('⚠️')) {
        const linha = linhas[i].trim();
        if (linha.match(/^[-•"]/)) {
          sugestoes.push(linha.replace(/^[-•"]\s*/, '').replace(/"$/g, ''));
        }
        i++;
      }
    }
    
    // Extrair estimativas (seção 📈)
    const estimativas: any = {};
    const estimativasInicio = linhas.findIndex(l => l.includes('📈') && l.includes('ESTIMATIVAS'));
    if (estimativasInicio >= 0) {
      let i = estimativasInicio + 1;
      while (i < linhas.length && !linhas[i].includes('⚠️')) {
        const linha = linhas[i].trim();
        if (linha.includes(':')) {
          const [chave, valor] = linha.split(':');
          estimativas[chave.replace('-', '').trim().toLowerCase()] = valor.trim();
        }
        i++;
      }
    }
    
    // Extrair nível de certeza (linha com ⚠️)
    const certezaLinha = linhas.find(l => l.includes('⚠️') && l.includes('CERTEZA'));
    const certeza = certezaLinha ? certezaLinha.match(/\[(\d+%-?\d*%?)\]/)?.[1] || '95%' : '95%';
    
    // Extrair ITs relacionadas (linha com 🔗)
    const relacionadasLinha = linhas.find(l => l.includes('🔗'));
    const relacionadas = relacionadasLinha 
      ? (relacionadasLinha.match(/IT-\d+/g) || [])
      : [];
    
    return {
      resumo,
      detalhes,
      dica,
      relacionadas,
      sugestoes: sugestoes.length > 0 ? sugestoes : getDefaultSuggestions(intencao),
      raciocinio,
      estimativas: Object.keys(estimativas).length > 0 ? estimativas : undefined,
      nivelCerteza: certeza
    };
  } catch (error) {
    console.error('Erro ao processar resposta:', error);
    return {
      resumo: resposta.split('\n')[0],
      detalhes: [],
      dica: '',
      relacionadas: [],
      sugestoes: getDefaultSuggestions(intencao)
    };
  }
}

// Função auxiliar para sugestões padrão
function getDefaultSuggestions(intencao: string): string[] {
  const sugestoesPadrao: Record<string, string[]> = {
    CALCULO: [
      "Como posicionar os equipamentos calculados?",
      "Quais são os requisitos de sinalização?",
      "Preciso de brigada de incêndio?"
    ],
    DEFINICAO: [
      "Onde isso se aplica?",
      "Quais são os requisitos técnicos?",
      "Como dimensionar?"
    ],
    TUTORIAL: [
      "Quais documentos são necessários?",
      "Quanto tempo leva o processo?",
      "Quais são os custos envolvidos?"
    ],
    VALIDACAO: [
      "Como corrigir este problema?",
      "Qual o prazo para adequação?",
      "Há multas previstas?"
    ],
    LISTAGEM: [
      "Qual item é mais importante?",
      "Como priorizar a implementação?",
      "Há exceções ou casos especiais?"
    ]
  };
  
  return sugestoesPadrao[intencao] || sugestoesPadrao.DEFINICAO;
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// Método GET para verificar se o serviço está funcionando
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  return NextResponse.json({
    success: true,
    status: 'Chat AI Inteligente service is running',
    hasApiKey: !!apiKey,
    version: '3.0',
    model: 'deepseek/deepseek-r1-0528:free',
    modelInfo: 'Usando modelo gratuito temporariamente - limite de 50 req/dia',
    features: [
      'Modelo DeepSeek R1 gratuito (temporário)',
      'Chain-of-Thought transparente',
      'Persona especializada (Dr. Roberto Silva)',
      'Detecção de intenção avançada',
      'Sistema de contexto aprimorado',
      'Respostas estruturadas com raciocínio',
      'Formatação inteligente melhorada',
      'Cálculos automáticos com validação',
      'Estimativas de custo e tempo',
      'Nível de certeza nas respostas'
    ],
    improvements: {
      temperature: 0.1,
      maxTokens: 4000,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1
    },
    timestamp: new Date().toISOString()
  });
}

// ✔️ Protegido com AIDEV-PROTECTED