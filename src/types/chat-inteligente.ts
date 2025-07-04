// Interfaces para o Sistema de Chat IA Inteligente

export interface RespostaInteligente {
  // Resposta direta em 1-2 linhas
  resumo: string;
  
  // Detalhes técnicos com citações
  detalhes: DetalheItem[];
  
  // Dica prática actionable
  dica: string;
  
  // ITs relacionadas
  relacionadas: string[];
  
  // Próximas perguntas sugeridas
  sugestoes: string[];
  
  // Chain-of-Thought - Raciocínio transparente
  raciocinio?: EtapaRaciocinio[];
  
  // Estimativas de custo, tempo e recursos
  estimativas?: {
    custo?: string;
    tempo?: string;
    manutencao?: string;
    [key: string]: string | undefined;
  };
  
  // Nível de certeza da resposta (95-100%)
  nivelCerteza?: string;
}

// Nova interface para o Chain-of-Thought
export interface EtapaRaciocinio {
  etapa: string;
  descricao: string;
}

export interface DetalheItem {
  item: string;
  referencia: string; // "IT-21, Art. 5.2"
  calculo?: string;
}

// Sistema de Contexto Avançado
export interface ContextoConversa {
  tipoEdificacao: TipoEdificacao | null;
  areaTotal: number | null;
  numeroAndares: number | null;
  itsJaMencionadas: string[];
  calculosRealizados: CalculoRealizado[];
  dadosColetados: Record<string, any>;
  ultimasPerguntas: string[];
}

export interface CalculoRealizado {
  tipo: string;
  resultado: string | number;
  timestamp: Date;
}

export type TipoEdificacao = 
  | 'comercial' 
  | 'residencial' 
  | 'industrial' 
  | 'hospitalar' 
  | 'educacional'
  | 'escritorio'
  | 'restaurante'
  | 'deposito'
  | 'posto-combustivel'
  | 'shopping';

// Tipos de Intenção
export type IntencaoPergunta = 
  | 'CALCULO'
  | 'DEFINICAO'
  | 'TUTORIAL'
  | 'VALIDACAO'
  | 'LISTAGEM'
  | 'COMPARACAO'
  | 'NORMATIVA';

// Formatação de Resposta
export interface FormatacaoResposta {
  usarEmojis: boolean;
  usarTabela: boolean;
  usarBullets: boolean;
  usarCitacoes: boolean;
  destacarValores: boolean;
}

// Base de Conhecimento
export interface InstrucaoTecnica {
  id: number;
  numero: string;
  titulo: string;
  categoria: string;
  palavrasChave: string[];
  conteudoPrincipal?: string;
  artigos?: ArtigoIT[];
}

export interface ArtigoIT {
  numero: string;
  titulo: string;
  conteudo: string;
  calculos?: FormulaCalculo[];
}

export interface FormulaCalculo {
  nome: string;
  formula: string;
  variaveis: VariavelCalculo[];
  exemplo?: string;
}

export interface VariavelCalculo {
  simbolo: string;
  descricao: string;
  unidade: string;
  valorPadrao?: number;
}

// Resposta Contextual
export interface RespostaContextual {
  tipo: IntencaoPergunta;
  contexto: ContextoConversa;
  resposta: RespostaInteligente;
  atualizacoesContexto?: Partial<ContextoConversa>;
}

// Validação
export interface ResultadoValidacao {
  valido: boolean;
  mensagem: string;
  correcao?: string;
  referenciaNormativa: string;
  riscos?: string[];
}

// Configuração do Sistema
export interface ConfiguracaoChatInteligente {
  modeloIA: string;
  temperatura: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  incluirCitacoes: boolean;
  nivelDetalhe: 'basico' | 'intermediario' | 'avancado';
  formatacao: FormatacaoResposta;
  // Novos campos para melhorias
  usarChainOfThought: boolean;
  incluirEstimativas: boolean;
  mostrarNivelCerteza: boolean;
  personaEspecialista: string;
}