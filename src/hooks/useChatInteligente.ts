'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  ContextoConversa, 
  RespostaInteligente,
  IntencaoPergunta 
} from '@/types/chat-inteligente';

// Tipos para o sistema de chat inteligente
export interface ChatMessageInteligente {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  respostaEstruturada?: RespostaInteligente;
  intencao?: IntencaoPergunta;
  itsMencionadas?: string[];
  loading?: boolean;
}

interface ChatResponseInteligente {
  success: boolean;
  message?: string;
  resposta?: RespostaInteligente;
  contexto?: ContextoConversa;
  intencao?: IntencaoPergunta;
  itsMencionadas?: string[];
  usage?: any;
  error?: string;
}

export interface ChatInteligenteHookReturn {
  messages: ChatMessageInteligente[];
  contexto: ContextoConversa;
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  deleteMessage: (messageId: string) => void;
  retryLastMessage: () => Promise<void>;
  updateContexto: (updates: Partial<ContextoConversa>) => void;
}

// Chave para localStorage
const CHAT_STORAGE_KEY = 'cbpi-chat-inteligente-messages';
const CONTEXT_STORAGE_KEY = 'cbpi-chat-inteligente-context';

// Mensagem de boas-vindas melhorada
const WELCOME_MESSAGE: ChatMessageInteligente = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 **Olá! Sou seu assistente especializado em Instruções Técnicas do CB-PI.**

🎯 **Meu sistema inteligente pode:**
• 📊 **Calcular** dimensionamentos (extintores, hidrantes, saídas)
• 📚 **Definir** conceitos técnicos com citações precisas
• 📝 **Explicar** procedimentos passo a passo
• ✅ **Validar** conformidade com as normas
• 📋 **Listar** requisitos por tipo de edificação

💡 **Exemplos do que posso fazer:**
• "Quantos extintores para loja de 450m²?"
• "O que é brigada de incêndio?"
• "Como obter o AVCB?"
• "1 extintor é suficiente para 500m²?"
• "Quais ITs para restaurante?"

🤖 **Sistema conectado a 105+ Instruções Técnicas com IA avançada para respostas precisas e contextuais.**

❓ **Como posso ajudar você hoje?**`,
  timestamp: new Date(),
  respostaEstruturada: {
    resumo: "Sistema de chat inteligente pronto para ajudar",
    detalhes: [],
    dica: "Seja específico sobre área, tipo de edificação e número de andares para respostas mais precisas",
    relacionadas: ["IT-01", "IT-42"],
    sugestoes: [
      "Como dimensionar extintores?",
      "Quais documentos para vistoria?",
      "Requisitos para meu tipo de edificação"
    ]
  }
};

// Contexto inicial vazio
const INITIAL_CONTEXT: ContextoConversa = {
  tipoEdificacao: null,
  areaTotal: null,
  numeroAndares: null,
  itsJaMencionadas: [],
  calculosRealizados: [],
  dadosColetados: {},
  ultimasPerguntas: []
};

export function useChatInteligente(): ChatInteligenteHookReturn {
  const [messages, setMessages] = useState<ChatMessageInteligente[]>([WELCOME_MESSAGE]);
  const [contexto, setContexto] = useState<ContextoConversa>(INITIAL_CONTEXT);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    // Carregar mensagens
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (parsed.length > 1) {
          setMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    }

    // Carregar contexto
    const savedContext = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (savedContext) {
      try {
        const parsed = JSON.parse(savedContext);
        setContexto(parsed);
      } catch (error) {
        console.error('Erro ao carregar contexto:', error);
      }
    }
  }, []);

  // Salvar mensagens e contexto no localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(contexto));
  }, [contexto]);

  // Função para atualizar contexto
  const updateContexto = useCallback((updates: Partial<ContextoConversa>) => {
    setContexto(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Função para enviar mensagem
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const messageText = userMessage.trim();
    setLastUserMessage(messageText);

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now() + 1}`;

    // Adicionar mensagem do usuário
    const newUserMessage: ChatMessageInteligente = {
      id: userMsgId,
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    // Adicionar mensagem de loading do assistente
    const loadingMessage: ChatMessageInteligente = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, newUserMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-ai-inteligente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          })).concat([{
            role: 'user',
            content: messageText
          }]),
          contexto: contexto
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: ChatResponseInteligente = await response.json();

      if (data.success && data.message) {
        // Atualizar contexto se retornado
        if (data.contexto) {
          setContexto(data.contexto);
        }

        // Atualizar mensagem com resposta real
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId 
            ? {
                ...msg,
                content: data.message!,
                respostaEstruturada: data.resposta,
                intencao: data.intencao,
                itsMencionadas: data.itsMencionadas,
                loading: false
              }
            : msg
        ));
      } else {
        throw new Error(data.error || 'Erro desconhecido na API');
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message
        : 'Erro desconhecido';

      // Mensagem de erro estruturada
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId 
          ? {
              ...msg,
              content: `😔 **Desculpe, ocorreu um erro ao processar sua pergunta.**

**Detalhes:** ${errorMessage}

💡 **O que você pode fazer:**
• Verificar sua conexão com a internet
• Tentar reformular a pergunta
• Aguardar alguns segundos e tentar novamente

🤖 Enquanto isso, posso fornecer informações gerais sobre as ITs. Tente perguntar algo como:
• "O que é extintor ABC?"
• "Quantos extintores preciso?"
• "Como funciona a brigada de incêndio?"`,
              loading: false,
              respostaEstruturada: {
                resumo: "Erro ao processar solicitação",
                detalhes: [],
                dica: "Tente novamente em alguns instantes ou reformule sua pergunta",
                relacionadas: [],
                sugestoes: [
                  "O que são extintores?",
                  "Como calcular saídas de emergência?",
                  "Quais ITs são obrigatórias?"
                ]
              }
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [messages, contexto, isLoading]);

  // Função para tentar novamente a última mensagem
  const retryLastMessage = useCallback(async () => {
    if (lastUserMessage && !isLoading) {
      // Remover as duas últimas mensagens (user e assistant error)
      setMessages(prev => prev.slice(0, -2));
      await sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, sendMessage, isLoading]);

  // Função para limpar o chat
  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setContexto(INITIAL_CONTEXT);
    setLastUserMessage('');
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(CONTEXT_STORAGE_KEY);
  }, []);

  // Função para deletar uma mensagem específica
  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    messages,
    contexto,
    isLoading,
    sendMessage,
    clearChat,
    deleteMessage,
    retryLastMessage,
    updateContexto
  };
}

// Hook para sugestões inteligentes baseadas no contexto
export function useSugestoesInteligentes(contexto: ContextoConversa) {
  const [sugestoes, setSugestoes] = useState<string[]>([]);

  useEffect(() => {
    const gerarSugestoes = () => {
      const novasSugestoes: string[] = [];

      // Sugestões baseadas no tipo de edificação
      if (contexto.tipoEdificacao) {
        switch (contexto.tipoEdificacao) {
          case 'comercial':
          case 'loja':
            novasSugestoes.push(
              "Quantos extintores preciso?",
              "Preciso de saída de emergência?",
              "É obrigatório alarme de incêndio?"
            );
            break;
          case 'restaurante':
            novasSugestoes.push(
              "Requisitos para cozinha industrial",
              "Sistema de exaustão obrigatório?",
              "Quantos extintores na cozinha?"
            );
            break;
          case 'industrial':
            novasSugestoes.push(
              "Como calcular carga de incêndio?",
              "Preciso de brigada de incêndio?",
              "Requisitos para depósito de inflamáveis"
            );
            break;
        }
      }

      // Sugestões baseadas na área
      if (contexto.areaTotal) {
        if (contexto.areaTotal > 750) {
          novasSugestoes.push("É obrigatório ter brigada de incêndio?");
        }
        if (contexto.areaTotal > 1500) {
          novasSugestoes.push("Quantos hidrantes são necessários?");
        }
      }

      // Sugestões baseadas no número de andares
      if (contexto.numeroAndares && contexto.numeroAndares > 2) {
        novasSugestoes.push(
          "Requisitos para escada de emergência",
          "É necessário elevador de emergência?"
        );
      }

      // Sugestões baseadas em cálculos realizados
      if (contexto.calculosRealizados.some(c => c.tipo === 'extintores')) {
        novasSugestoes.push(
          "Como distribuir os extintores?",
          "Qual tipo de extintor usar?"
        );
      }

      // Limitar a 5 sugestões
      setSugestoes(novasSugestoes.slice(0, 5));
    };

    gerarSugestoes();
  }, [contexto]);

  return sugestoes;
}

// Hook para análise de conformidade
export function useAnaliseConformidade() {
  const analisarConformidade = useCallback((
    tipo: string,
    valor: any,
    contexto: ContextoConversa
  ) => {
    // Implementação simplificada de análise
    const analises: Record<string, () => { conforme: boolean; mensagem: string }> = {
      extintores: () => {
        const quantidade = Number(valor);
        const area = contexto.areaTotal || 0;
        const quantidadeMinima = Math.ceil(area / 150);
        
        return {
          conforme: quantidade >= quantidadeMinima,
          mensagem: quantidade >= quantidadeMinima
            ? `✅ Quantidade adequada para ${area}m²`
            : `⚠️ Necessário no mínimo ${quantidadeMinima} extintores para ${area}m²`
        };
      },
      brigada: () => {
        const area = contexto.areaTotal || 0;
        const necessaria = area > 750;
        
        return {
          conforme: !necessaria || valor === true,
          mensagem: necessaria
            ? "✅ Brigada de incêndio obrigatória para área > 750m²"
            : "ℹ️ Brigada não obrigatória, mas recomendada"
        };
      }
    };

    const analise = analises[tipo];
    return analise ? analise() : { conforme: true, mensagem: "Análise não disponível" };
  }, []);

  return { analisarConformidade };
}