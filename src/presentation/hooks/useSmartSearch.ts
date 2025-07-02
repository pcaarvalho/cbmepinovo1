'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

// Dados específicos do CB-PI para sugestões inteligentes
export const CBPI_DATA = {
  // Instruções Técnicas mais consultadas
  popularITs: [
    { id: 'it-01', number: 'IT-01', title: 'Procedimentos Administrativos', category: 'procedimentos' },
    { id: 'it-02', number: 'IT-02', title: 'Conceitos básicos de segurança contra incêndio', category: 'conceitos' },
    { id: 'it-11', number: 'IT-11', title: 'Saídas de emergência', category: 'saidas' },
    { id: 'it-18', number: 'IT-18', title: 'Iluminação de emergência', category: 'sistemas' },
    { id: 'it-19', number: 'IT-19', title: 'Sistema de detecção e alarme de incêndio', category: 'sistemas' },
    { id: 'it-21', number: 'IT-21', title: 'Sistema de proteção por extintores de incêndio', category: 'sistemas' },
    { id: 'it-22', number: 'IT-22', title: 'Sistema de hidrantes e mangotinhos', category: 'sistemas' },
  ],

  // Categorias principais do CB-PI
  categories: [
    { id: 'procedimentos', name: 'Procedimentos Administrativos', its: ['IT-01'] },
    { id: 'conceitos', name: 'Conceitos e Terminologia', its: ['IT-02', 'IT-03', 'IT-04'] },
    { id: 'urbanistica', name: 'Urbanística e Acesso', its: ['IT-05', 'IT-06'] },
    { id: 'estrutural', name: 'Segurança Estrutural', its: ['IT-07', 'IT-08', 'IT-09'] },
    { id: 'materiais', name: 'Materiais e Revestimentos', its: ['IT-10'] },
    { id: 'saidas', name: 'Saídas de Emergência', its: ['IT-11', 'IT-13'] },
    { id: 'sistemas', name: 'Sistemas de Proteção', its: ['IT-18', 'IT-19', 'IT-20', 'IT-21', 'IT-22', 'IT-23'] },
    { id: 'especiais', name: 'Edificações Especiais', its: ['IT-12', 'IT-27', 'IT-31', 'IT-38'] },
  ],

  // Termos técnicos comuns
  technicalTerms: [
    { term: 'carga de incêndio', definition: 'Soma das energias caloríficas por unidade de área', relatedITs: ['IT-14'] },
    { term: 'compartimentação', definition: 'Divisão da edificação em células estanques ao fogo', relatedITs: ['IT-09'] },
    { term: 'rota de fuga', definition: 'Caminho contínuo, desobstruído e sinalizado', relatedITs: ['IT-11'] },
    { term: 'resistência ao fogo', definition: 'Tempo que um elemento resiste ao fogo', relatedITs: ['IT-08'] },
    { term: 'brigada de incêndio', definition: 'Grupo organizado para combate a princípios de incêndio', relatedITs: ['IT-17'] },
  ],

  // Procedimentos específicos do CB-PI
  procedures: [
    { id: 'avcb', name: 'Emissão de AVCB', description: 'Auto de Vistoria do Corpo de Bombeiros' },
    { id: 'projeto', name: 'Análise de Projeto', description: 'Análise técnica de projetos de segurança' },
    { id: 'vistoria', name: 'Vistoria Técnica', description: 'Inspeção in-loco das instalações' },
    { id: 'renovacao', name: 'Renovação de AVCB', description: 'Renovação do Auto de Vistoria' },
  ]
};

export const useSmartSearch = () => {
  const router = useRouter();

  // Executar comandos rápidos
  const executeCommand = useCallback((command: string, param?: string) => {
    const normalizedCommand = command.toLowerCase().replace('/', '');
    
    switch (normalizedCommand) {
      case 'buscar':
        if (param) {
          router.push(`/pesquisar?q=${encodeURIComponent(param)}`);
        } else {
          router.push('/pesquisar');
        }
        break;
        
      case 'analisar':
        router.push('/memorial');
        break;
        
      case 'calcular':
        // Futuramente pode ser uma página específica para cálculos
        router.push('/pesquisar?q=carga+de+incendio');
        break;
        
      case 'verificar':
        router.push('/memorial');
        break;
        
      case 'biblioteca':
        router.push('/biblioteca');
        break;
        
      case 'ajuda':
        router.push('/ajuda');
        break;
        
      default:
        // Comando não reconhecido, fazer busca normal
        router.push(`/pesquisar?q=${encodeURIComponent(command + (param ? ' ' + param : ''))}`);
    }
  }, [router]);

  // Processar menções de recursos
  const processMention = useCallback((mention: string) => {
    const mentionId = mention.replace('@', '').toLowerCase();
    
    // Verificar se é uma IT específica
    const itMatch = mentionId.match(/^it-?(\d+)$/);
    if (itMatch) {
      const itNumber = itMatch[1].padStart(2, '0');
      router.push(`/pesquisar?q=IT-${itNumber}`);
      return;
    }
    
    // Verificar se é uma categoria
    const category = CBPI_DATA.categories.find(cat => 
      cat.id === mentionId || cat.name.toLowerCase().includes(mentionId)
    );
    if (category) {
      router.push(`/pesquisar?categoria=${category.id}`);
      return;
    }
    
    // Fazer busca geral
    router.push(`/pesquisar?q=${encodeURIComponent(mention)}`);
  }, [router]);

  // Gerar sugestões contextuais baseadas na entrada do usuário
  const generateContextualSuggestions = useCallback((query: string) => {
    const suggestions: any[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Sugestões de ITs populares
    CBPI_DATA.popularITs.forEach(it => {
      if (it.title.toLowerCase().includes(lowerQuery) || 
          it.number.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'it',
          title: `${it.number} - ${it.title}`,
          subtitle: 'Instrução Técnica',
          action: () => router.push(`/pesquisar?q=${it.number}`)
        });
      }
    });
    
    // Sugestões de categorias
    CBPI_DATA.categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'category',
          title: cat.name,
          subtitle: `${cat.its.length} ITs relacionadas`,
          action: () => router.push(`/pesquisar?categoria=${cat.id}`)
        });
      }
    });
    
    // Sugestões de termos técnicos
    CBPI_DATA.technicalTerms.forEach(term => {
      if (term.term.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          type: 'term',
          title: term.term,
          subtitle: term.definition,
          action: () => router.push(`/pesquisar?q=${encodeURIComponent(term.term)}`)
        });
      }
    });
    
    return suggestions.slice(0, 8); // Limitar a 8 sugestões
  }, [router]);

  // Analisar intenção da busca e sugerir ações
  const analyzeSearchIntent = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    const suggestions: any[] = [];
    
    // Detectar intenções específicas
    if (lowerQuery.includes('como') || lowerQuery.includes('calcular')) {
      suggestions.push({
        type: 'action',
        title: 'Usar calculadora de carga de incêndio',
        subtitle: 'Ferramenta para cálculos técnicos',
        action: () => executeCommand('/calcular')
      });
    }
    
    if (lowerQuery.includes('analisar') || lowerQuery.includes('memorial')) {
      suggestions.push({
        type: 'action',
        title: 'Analisar memorial descritivo',
        subtitle: 'Upload e análise automática de conformidade',
        action: () => executeCommand('/analisar')
      });
    }
    
    if (lowerQuery.includes('it-') || lowerQuery.match(/\d+/)) {
      const itNumber = lowerQuery.match(/\d+/)?.[0];
      if (itNumber) {
        suggestions.push({
          type: 'action',
          title: `Buscar IT-${itNumber.padStart(2, '0')}`,
          subtitle: 'Abrir instrução técnica específica',
          action: () => router.push(`/pesquisar?q=IT-${itNumber.padStart(2, '0')}`)
        });
      }
    }
    
    return suggestions;
  }, [executeCommand, router]);

  return {
    executeCommand,
    processMention,
    generateContextualSuggestions,
    analyzeSearchIntent,
    CBPI_DATA
  };
};