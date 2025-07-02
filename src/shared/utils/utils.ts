import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InstrucaoTecnica, FiltrosPesquisa } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR');
}

export function formatarDataCompleta(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function filtrarInstrucoes(
  instrucoes: InstrucaoTecnica[],
  filtros: FiltrosPesquisa & { popular?: boolean }
): InstrucaoTecnica[] {
  return instrucoes.filter(it => {
    // Filtro por termo de busca
    if (filtros.termo) {
      const termo = filtros.termo.toLowerCase();
      const contemTermo = 
        it.titulo.toLowerCase().includes(termo) ||
        it.descricao.toLowerCase().includes(termo) ||
        it.numero.toLowerCase().includes(termo) ||
        it.tags.some(tag => tag.toLowerCase().includes(termo));
      
      if (!contemTermo) return false;
    }

    // Filtro por categoria
    if (filtros.categoria && it.categoria !== filtros.categoria) {
      return false;
    }

    // Filtro por tags
    if (filtros.tags && filtros.tags.length > 0) {
      const temTag = filtros.tags.some(tag => 
        it.tags.includes(tag.toLowerCase())
      );
      if (!temTag) return false;
    }

    // Filtro por popularidade
    if (filtros.popular && !it.popular) {
      return false;
    }

    // Filtro por data
    if (filtros.dataInicio) {
      const dataPublicacao = new Date(it.dataPublicacao);
      const inicio = new Date(filtros.dataInicio);
      if (dataPublicacao < inicio) return false;
    }

    if (filtros.dataFim) {
      const dataPublicacao = new Date(it.dataPublicacao);
      const fim = new Date(filtros.dataFim);
      if (dataPublicacao > fim) return false;
    }

    return true;
  });
}

export function buscarInstrucoes(
  instrucoes: InstrucaoTecnica[],
  consulta: string
): InstrucaoTecnica[] {
  if (!consulta.trim()) return instrucoes;

  const termos = consulta.toLowerCase().split(' ').filter(Boolean);
  
  return instrucoes
    .map(it => {
      let pontuacao = 0;

      termos.forEach(termo => {
        // Pontuação por título
        if (it.titulo.toLowerCase().includes(termo)) {
          pontuacao += 10;
        }
        
        // Pontuação por número da IT
        if (it.numero.toLowerCase().includes(termo)) {
          pontuacao += 8;
        }
        
        // Pontuação por descrição
        if (it.descricao.toLowerCase().includes(termo)) {
          pontuacao += 5;
        }
        
        // Pontuação por tags
        if (it.tags.some(tag => tag.toLowerCase().includes(termo))) {
          pontuacao += 3;
        }
      });

      return { ...it, pontuacao };
    })
    .filter(it => it.pontuacao > 0)
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .map(({ ...it }) => it);
}

export function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}