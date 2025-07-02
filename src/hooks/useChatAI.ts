'use client';

import { useState, useCallback, useEffect } from 'react';

// Tipos para o sistema de chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: ChatSource[];
  loading?: boolean;
}

export interface ChatSource {
  id: string;
  titulo: string;
  numero?: string;
  categoria: string;
  relevancia: number;
  url?: string;
}

interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
    sources: ChatSource[];
    confidence: number;
    metadata: {
      processingTime: number;
      modelUsed: string;
      tokenUsage: {
        prompt: number;
        completion: number;
        total: number;
      };
    };
  };
  error?: string;
}

export interface ChatAIHookReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  deleteMessage: (messageId: string) => void;
  retryLastMessage: () => Promise<void>;
}

// Chave para localStorage
const CHAT_STORAGE_KEY = 'cbpi-chat-messages';

// Mensagem de boas-vindas padrão
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Olá! 👋 Sou seu assistente especializado em **Instruções Técnicas do CB-PI**. 

Posso ajudar você com:
🔥 **Normas de segurança contra incêndio**
📐 **Dimensionamentos e cálculos técnicos**
📋 **Procedimentos administrativos**
🏢 **Requisitos para diferentes tipos de edificação**

💡 **Experimente perguntar:**
• "Como dimensionar hidrantes para um prédio comercial?"
• "Quais são os requisitos para saídas de emergência?"
• "O que diz a IT-22 sobre sistemas de combate a incêndio?"
• "Como calcular carga de incêndio?"

🤖 Estou conectado a **105+ Instruções Técnicas** do CB-PI e uso IA para fornecer respostas precisas e contextuais.`,
  timestamp: new Date()
};

export function useChatAI(): ChatAIHookReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');

  // Carregar mensagens do localStorage ao inicializar
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Verificar se há mensagens salvas (além da de boas-vindas)
        if (parsed.length > 1) {
          setMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens do localStorage:', error);
      }
    }
  }, []);

  // Salvar mensagens no localStorage sempre que mudarem
  useEffect(() => {
    if (messages.length > 1) { // Só salva se houver mais que a mensagem de boas-vindas
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Função para enviar mensagem
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const messageText = userMessage.trim();
    setLastUserMessage(messageText);

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now() + 1}`;

    // Adicionar mensagem do usuário
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    // Adicionar mensagem de loading do assistente
    const loadingMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, newUserMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          context: messages.slice(-6) // Últimas 6 mensagens para contexto
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      if (data.success && data.data) {
        // Atualizar mensagem com resposta real
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId 
            ? {
                ...msg,
                content: data.data!.response,
                sources: data.data!.sources,
                loading: false
              }
            : msg
        ));
      } else {
        throw new Error(data.error || 'Erro desconhecido na API');
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Mensagem de erro personalizada
      const errorMessage = error instanceof Error 
        ? `Erro: ${error.message}`
        : 'Erro desconhecido';

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

🤖 O sistema pode estar temporariamente indisponível, mas ainda posso ajudar com informações gerais sobre ITs.`,
              loading: false
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  // Função para tentar novamente a última mensagem
  const retryLastMessage = useCallback(async () => {
    if (lastUserMessage) {
      // Remover as duas últimas mensagens (user e assistant error)
      setMessages(prev => prev.slice(0, -2));
      await sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, sendMessage]);

  // Função para limpar o chat
  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setLastUserMessage('');
    localStorage.removeItem(CHAT_STORAGE_KEY);
  }, []);

  // Função para deletar uma mensagem específica
  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    deleteMessage,
    retryLastMessage
  };
}

// Hook para estatísticas do chat
export function useChatStats() {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalSessions: 0,
    averageResponseTime: 0,
    topQuestions: [] as string[]
  });

  useEffect(() => {
    // Carregar estatísticas do localStorage
    const savedStats = localStorage.getItem('cbpi-chat-stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    }
  }, []);

  const updateStats = useCallback((newMessage: ChatMessage, responseTime?: number) => {
    setStats(prev => {
      const updated = {
        ...prev,
        totalMessages: prev.totalMessages + 1,
        averageResponseTime: responseTime 
          ? Math.round((prev.averageResponseTime + responseTime) / 2)
          : prev.averageResponseTime
      };

      // Salvar no localStorage
      localStorage.setItem('cbpi-chat-stats', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { stats, updateStats };
}