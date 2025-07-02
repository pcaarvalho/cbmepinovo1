'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Command, Hash, HelpCircle, Sparkles, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'instruction' | 'category' | 'command' | 'recent';
  description?: string;
  numero?: string;
  category?: string;
  icon?: React.ReactNode;
}

interface IntelligentSearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  showCommands?: boolean;
  maxSuggestions?: number;
}

// Comandos disponíveis no sistema
const SYSTEM_COMMANDS = [
  {
    trigger: '/',
    name: 'Busca Rápida',
    description: 'Buscar por instruções técnicas',
    icon: <Search className="w-4 h-4" />
  },
  {
    trigger: '@',
    name: 'Categoria',
    description: 'Buscar por categoria específica',
    icon: <Hash className="w-4 h-4" />
  },
  {
    trigger: '?',
    name: 'Ajuda',
    description: 'Mostrar comandos disponíveis',
    icon: <HelpCircle className="w-4 h-4" />
  }
];

export default function IntelligentSearchBar({
  placeholder = 'Pesquisar instruções técnicas... (/ para comandos)',
  value = '',
  onChange,
  onSearch,
  onSuggestionSelect,
  className,
  size = 'md',
  autoFocus = false,
  showCommands = true,
  maxSuggestions = 8
}: IntelligentSearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Função para buscar sugestões inteligentes via API
  const searchWithAI = useCallback(async (query: string): Promise<SearchSuggestion[]> => {
    if (!query.trim()) return [];

    try {
      const response = await fetch('/api/pesquisa/sugestoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query.trim(),
          maxResults: maxSuggestions 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data.map((item: any) => ({
          id: item.id || `suggestion-${Date.now()}-${Math.random()}`,
          title: item.titulo || item.title || item.name,
          type: item.type || 'instruction',
          description: item.descricao || item.description,
          numero: item.numero,
          category: item.categoria || item.category,
          icon: getIconForType(item.type || 'instruction')
        }));
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      return [];
    }
  }, [maxSuggestions]);

  // Função para obter ícone baseado no tipo
  const getIconForType = (type: string): React.ReactNode => {
    switch (type) {
      case 'instruction':
        return <FileText className="w-4 h-4" />;
      case 'category':
        return <Hash className="w-4 h-4" />;
      case 'command':
        return <Command className="w-4 h-4" />;
      case 'recent':
        return <Clock className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  // Função para processar comandos especiais
  const processCommand = (query: string): SearchSuggestion[] => {
    if (!showCommands) return [];

    const trimmedQuery = query.trim();
    
    // Mostrar comandos disponíveis
    if (trimmedQuery === '?') {
      return SYSTEM_COMMANDS.map(cmd => ({
        id: `command-${cmd.trigger}`,
        title: `${cmd.trigger} - ${cmd.name}`,
        type: 'command' as const,
        description: cmd.description,
        icon: cmd.icon
      }));
    }

    // Filtrar comandos baseado no input
    if (trimmedQuery.startsWith('/') || trimmedQuery.startsWith('@') || trimmedQuery.startsWith('?')) {
      const trigger = trimmedQuery[0];
      const searchTerm = trimmedQuery.slice(1).toLowerCase();
      
      return SYSTEM_COMMANDS
        .filter(cmd => cmd.trigger === trigger && cmd.name.toLowerCase().includes(searchTerm))
        .map(cmd => ({
          id: `command-${cmd.trigger}`,
          title: `${cmd.trigger} - ${cmd.name}`,
          type: 'command' as const,
          description: cmd.description,
          icon: cmd.icon
        }));
    }

    return [];
  };

  // Função para adicionar buscas recentes
  const addToRecentSearches = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== query.trim());
      return [query.trim(), ...filtered].slice(0, 5);
    });
  }, []);

  // Função para obter sugestões de buscas recentes
  const getRecentSuggestions = (query: string): SearchSuggestion[] => {
    if (query.trim()) return [];
    
    return recentSearches.map((search, index) => ({
      id: `recent-${index}`,
      title: search,
      type: 'recent' as const,
      description: 'Busca recente',
      icon: <Clock className="w-4 h-4" />
    }));
  };

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!query.trim()) {
        const recentSuggestions = getRecentSuggestions('');
        setSuggestions(recentSuggestions);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Primeiro verificar comandos
      const commandSuggestions = processCommand(query);
      if (commandSuggestions.length > 0) {
        setSuggestions(commandSuggestions);
        setIsLoading(false);
        return;
      }

      // Buscar sugestões inteligentes
      const aiSuggestions = await searchWithAI(query);
      setSuggestions(aiSuggestions);
      setIsLoading(false);
    }, 300);
  }, [searchWithAI, getRecentSuggestions, processCommand]);

  // Handler para mudança no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    
    setSelectedIndex(-1);
    setShowSuggestions(true);
    debouncedSearch(newValue);
  };

  // Handler para submit do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addToRecentSearches(inputValue);
      onSearch?.(inputValue);
      setShowSuggestions(false);
    }
  };

  // Handler para limpar input
  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handler para selecionar sugestão
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'command') {
      setInputValue(suggestion.title.split(' - ')[0]);
      onChange?.(suggestion.title.split(' - ')[0]);
      inputRef.current?.focus();
    } else {
      setInputValue(suggestion.title);
      onChange?.(suggestion.title);
      addToRecentSearches(suggestion.title);
      onSuggestionSelect?.(suggestion);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  };

  // Handler para teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handler para foco/blur
  const handleFocus = () => {
    setShowSuggestions(true);
    if (!inputValue.trim()) {
      const recentSuggestions = getRecentSuggestions(inputValue);
      setSuggestions(recentSuggestions);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay para permitir clique nas sugestões
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  // Cleanup do debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const sizes = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base',
    lg: 'h-14 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
            {isLoading ? (
              <Sparkles className={cn('text-red-500 animate-pulse', iconSizes[size])} />
            ) : (
              <Search className={cn('text-gray-400', iconSizes[size])} />
            )}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              'w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 transition-all duration-200',
              'text-gray-900 placeholder-gray-500',
              'focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20',
              'hover:border-gray-400',
              sizes[size]
            )}
            autoComplete="off"
          />
          
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors',
                iconSizes[size]
              )}
            >
              <X className="w-full h-full" />
            </button>
          )}
        </div>
      </form>

      {/* Sugestões */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className={cn(
                'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0',
                'flex items-start gap-3',
                selectedIndex === index && 'bg-red-50 border-red-100'
              )}
            >
              <div className="flex-shrink-0 mt-0.5 text-gray-400">
                {suggestion.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">
                    {suggestion.title}
                  </span>
                  {suggestion.numero && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {suggestion.numero}
                    </span>
                  )}
                </div>
                {suggestion.description && (
                  <p className="text-sm text-gray-500 mt-0.5 truncate">
                    {suggestion.description}
                  </p>
                )}
                {suggestion.category && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {suggestion.category}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && showSuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Buscando sugestões inteligentes...</span>
          </div>
        </div>
      )}
    </div>
  );
}