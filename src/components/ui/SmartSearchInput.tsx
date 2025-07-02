'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Hash, AtSign, HelpCircle, ChevronDown, FileText, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para comandos rápidos
interface QuickCommand {
  id: string;
  trigger: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'action' | 'resource' | 'help';
  keywords: string[];
  execute: (param?: string) => void;
}

// Tipos para sugestões contextuais
interface ContextualSuggestion {
  id: string;
  type: 'it' | 'category' | 'procedure' | 'term';
  title: string;
  subtitle?: string;
  description?: string;
  icon: React.ReactNode;
  relevance: number;
}

interface SmartSearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onCommandExecute?: (command: string, param?: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  showSuggestions?: boolean;
}

export default function SmartSearchInput({
  placeholder = 'Pesquisar ITs, usar comandos (/) ou mencionar recursos (@)...',
  value = '',
  onChange,
  onSearch,
  onCommandExecute,
  className,
  size = 'md',
  autoFocus = false,
  showSuggestions = true
}: SmartSearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<(QuickCommand | ContextualSuggestion)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [isMentionMode, setIsMentionMode] = useState(false);
  const [isHelpMode, setIsHelpMode] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Comandos rápidos específicos para CB-PI
  const quickCommands: QuickCommand[] = [
    {
      id: 'buscar-it',
      trigger: '/buscar',
      name: 'Buscar Instrução Técnica',
      description: 'Pesquisar ITs por número, título ou conteúdo',
      icon: <Search className="w-4 h-4" />,
      category: 'action',
      keywords: ['buscar', 'pesquisar', 'procurar', 'it', 'instrucao'],
      execute: (param) => onCommandExecute?.('/buscar', param)
    },
    {
      id: 'analisar-memorial',
      trigger: '/analisar',
      name: 'Analisar Memorial Descritivo',
      description: 'Fazer análise de conformidade de memorial',
      icon: <FileText className="w-4 h-4" />,
      category: 'action',
      keywords: ['analisar', 'memorial', 'descritivo', 'conformidade', 'compliance'],
      execute: (param) => onCommandExecute?.('/analisar', param)
    },
    {
      id: 'calcular-carga',
      trigger: '/calcular',
      name: 'Calcular Carga de Incêndio',
      description: 'Ferramenta para cálculo de carga de incêndio',
      icon: <Zap className="w-4 h-4" />,
      category: 'action',
      keywords: ['calcular', 'carga', 'incendio', 'MJ/m2', 'calculo'],
      execute: (param) => onCommandExecute?.('/calcular', param)
    },
    {
      id: 'verificar-conformidade',
      trigger: '/verificar',
      name: 'Verificar Conformidade',
      description: 'Verificar se projeto atende às ITs aplicáveis',
      icon: <AlertTriangle className="w-4 h-4" />,
      category: 'action',
      keywords: ['verificar', 'conformidade', 'projeto', 'its', 'requisitos'],
      execute: (param) => onCommandExecute?.('/verificar', param)
    }
  ];

  // Recursos mencionáveis específicos do CB-PI
  const mentionableResources = [
    { id: 'it-01', name: 'IT-01 Procedimentos Administrativos', type: 'it' },
    { id: 'it-02', name: 'IT-02 Conceitos básicos de segurança contra incêndio', type: 'it' },
    { id: 'it-03', name: 'IT-03 Terminologia de incêndio', type: 'it' },
    { id: 'it-04', name: 'IT-04 Símbolos gráficos', type: 'it' },
    { id: 'it-05', name: 'IT-05 Urbanística', type: 'it' },
    { id: 'it-06', name: 'IT-06 Acesso de viatura', type: 'it' },
    { id: 'it-07', name: 'IT-07 Isolamento de risco', type: 'it' },
    { id: 'it-08', name: 'IT-08 Segurança estrutural', type: 'it' },
    { id: 'it-09', name: 'IT-09 Compartimentação horizontal e vertical', type: 'it' },
    { id: 'it-10', name: 'IT-10 Controle de materiais de acabamento', type: 'it' },
    { id: 'it-11', name: 'IT-11 Saídas de emergência', type: 'it' },
    { id: 'it-18', name: 'IT-18 Iluminação de emergência', type: 'it' },
    { id: 'it-19', name: 'IT-19 Sistema de detecção e alarme', type: 'it' },
    { id: 'it-20', name: 'IT-20 Sinalização de emergência', type: 'it' },
    { id: 'it-21', name: 'IT-21 Sistema de extintores', type: 'it' },
    { id: 'it-22', name: 'IT-22 Sistema de hidrantes e mangotinhos', type: 'it' },
    { id: 'cat-procedimentos', name: 'Procedimentos Administrativos', type: 'category' },
    { id: 'cat-estrutural', name: 'Segurança Estrutural', type: 'category' },
    { id: 'cat-saidas', name: 'Saídas de Emergência', type: 'category' },
    { id: 'cat-sistemas', name: 'Sistemas de Proteção', type: 'category' },
    { id: 'cat-prevencao', name: 'Prevenção de Incêndio', type: 'category' }
  ];

  // Sugestões de ajuda contextuais
  const helpSuggestions = [
    {
      id: 'help-its',
      question: 'Como encontrar IT específica?',
      answer: 'Use "/buscar IT-XX" ou digite o número da IT diretamente'
    },
    {
      id: 'help-memorial',
      question: 'Como analisar memorial descritivo?',
      answer: 'Use "/analisar" e faça upload do seu memorial em PDF'
    },
    {
      id: 'help-comandos',
      question: 'Quais comandos estão disponíveis?',
      answer: 'Digite "/" para ver todos os comandos rápidos disponíveis'
    },
    {
      id: 'help-mencoes',
      question: 'Como mencionar recursos específicos?',
      answer: 'Use "@" seguido do nome da IT ou categoria (ex: @IT-01)'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    
    // Detectar modo de comando
    const lastChar = newValue[newValue.length - 1];
    const lastWord = newValue.split(' ').pop() || '';
    
    setIsCommandMode(lastWord.startsWith('/'));
    setIsMentionMode(lastWord.startsWith('@'));
    setIsHelpMode(lastWord.startsWith('?'));
    
    // Gerar sugestões baseadas no contexto
    if (showSuggestions && (isCommandMode || isMentionMode || isHelpMode || newValue.length > 1)) {
      generateSuggestions(newValue);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
    
    setSelectedIndex(0);
  };

  const generateSuggestions = (query: string) => {
    const suggestions: (QuickCommand | ContextualSuggestion)[] = [];
    const lowerQuery = query.toLowerCase();
    const lastWord = query.split(' ').pop()?.toLowerCase() || '';

    if (isCommandMode && lastWord.startsWith('/')) {
      // Filtrar comandos
      const commandQuery = lastWord.substring(1);
      quickCommands
        .filter(cmd => 
          cmd.trigger.toLowerCase().includes(commandQuery) ||
          cmd.keywords.some(k => k.includes(commandQuery))
        )
        .forEach(cmd => suggestions.push(cmd));
    } else if (isMentionMode && lastWord.startsWith('@')) {
      // Filtrar recursos mencionáveis
      const mentionQuery = lastWord.substring(1);
      mentionableResources
        .filter(resource => 
          resource.name.toLowerCase().includes(mentionQuery) ||
          resource.id.toLowerCase().includes(mentionQuery)
        )
        .slice(0, 8)
        .forEach(resource => {
          suggestions.push({
            id: resource.id,
            type: resource.type as 'it' | 'category',
            title: resource.name,
            subtitle: resource.type === 'it' ? 'Instrução Técnica' : 'Categoria',
            icon: resource.type === 'it' ? <FileText className="w-4 h-4" /> : <Hash className="w-4 h-4" />,
            relevance: resource.name.toLowerCase().indexOf(mentionQuery) === 0 ? 10 : 5
          });
        });
    } else if (isHelpMode && lastWord.startsWith('?')) {
      // Sugestões de ajuda
      const helpQuery = lastWord.substring(1);
      helpSuggestions
        .filter(help => 
          help.question.toLowerCase().includes(helpQuery) ||
          help.answer.toLowerCase().includes(helpQuery)
        )
        .forEach(help => {
          suggestions.push({
            id: help.id,
            type: 'term',
            title: help.question,
            subtitle: help.answer,
            icon: <HelpCircle className="w-4 h-4" />,
            relevance: 8
          });
        });
    } else {
      // Sugestões contextuais baseadas em ITs
      mentionableResources
        .filter(resource => 
          resource.name.toLowerCase().includes(lowerQuery) ||
          resource.id.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 6)
        .forEach(resource => {
          suggestions.push({
            id: resource.id,
            type: resource.type as 'it' | 'category',
            title: resource.name,
            subtitle: `Clique para pesquisar ${resource.type === 'it' ? 'esta IT' : 'nesta categoria'}`,
            icon: resource.type === 'it' ? <FileText className="w-4 h-4" /> : <Hash className="w-4 h-4" />,
            relevance: resource.name.toLowerCase().indexOf(lowerQuery) === 0 ? 10 : 5
          });
        });
    }

    // Ordenar por relevância
    suggestions.sort((a, b) => {
      if ('relevance' in a && 'relevance' in b) {
        return b.relevance - a.relevance;
      }
      return 0;
    });

    setFilteredSuggestions(suggestions.slice(0, 8));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch?.(inputValue);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        selectSuggestion(filteredSuggestions[selectedIndex]);
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(0);
        break;
    }
  };

  const selectSuggestion = (suggestion: QuickCommand | ContextualSuggestion) => {
    if ('trigger' in suggestion) {
      // É um comando rápido
      const words = inputValue.split(' ');
      words[words.length - 1] = suggestion.trigger + ' ';
      const newValue = words.join(' ');
      setInputValue(newValue);
      onChange?.(newValue);
      inputRef.current?.focus();
    } else {
      // É uma sugestão contextual
      if (isMentionMode) {
        const words = inputValue.split(' ');
        words[words.length - 1] = `@${suggestion.id} `;
        const newValue = words.join(' ');
        setInputValue(newValue);
        onChange?.(newValue);
      } else {
        // Executar busca diretamente
        onSearch?.(suggestion.title);
      }
    }
    setShowDropdown(false);
    setSelectedIndex(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se é um comando
    const trimmed = inputValue.trim();
    if (trimmed.startsWith('/')) {
      const [command, ...params] = trimmed.split(' ');
      const param = params.join(' ');
      onCommandExecute?.(command, param || undefined);
    } else {
      onSearch?.(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizes = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base',
    lg: 'h-14 text-lg'
  };

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className={cn(
            'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-5 h-5',
            size === 'lg' && 'w-6 h-6'
          )} />
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              'w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500',
              sizes[size],
              showDropdown && 'rounded-b-none'
            )}
          />
          
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600',
                size === 'sm' && 'w-4 h-4',
                size === 'md' && 'w-5 h-5',
                size === 'lg' && 'w-6 h-6'
              )}
            >
              <X className="w-full h-full" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown de sugestões */}
      {showDropdown && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => selectSuggestion(suggestion)}
              className={cn(
                'px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50',
                index === selectedIndex && 'bg-red-50 border-red-200'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-gray-400">
                  {suggestion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {'trigger' in suggestion ? suggestion.trigger : suggestion.title}
                    </p>
                    {'category' in suggestion && (
                      <span className={cn(
                        'px-2 py-1 text-xs rounded-full',
                        'category' in suggestion && suggestion.category === 'action' && 'bg-green-100 text-green-700',
                        'category' in suggestion && suggestion.category === 'resource' && 'bg-blue-100 text-blue-700',
                        'category' in suggestion && suggestion.category === 'help' && 'bg-purple-100 text-purple-700'
                      )}>
                        {'name' in suggestion ? (suggestion as QuickCommand).name : (suggestion as QuickCommand).category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {'description' in suggestion ? suggestion.description : suggestion.subtitle}
                  </p>
                </div>
                {index === selectedIndex && (
                  <ChevronDown className="w-4 h-4 text-red-500 rotate-270" />
                )}
              </div>
            </div>
          ))}
          
          {/* Dica de uso */}
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t">
            <div className="flex items-center justify-between">
              <span>Use ↑↓ para navegar, Enter para selecionar</span>
              <div className="flex space-x-3">
                <span><kbd className="px-1 py-0.5 bg-white border rounded">/</kbd> comandos</span>
                <span><kbd className="px-1 py-0.5 bg-white border rounded">@</kbd> recursos</span>
                <span><kbd className="px-1 py-0.5 bg-white border rounded">?</kbd> ajuda</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}