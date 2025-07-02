// Exemplo de uso dos dados extraídos
// Arquivo: src/lib/instrucoes-scraped.ts

import { instrucoesTecnicas } from './instrucoes-scraped';

// Total: 105 instruções técnicas
export const totalInstrucoes = instrucoesTecnicas.length;

// Função para buscar instruções
export function buscarInstrucoes(termo: string) {
  return instrucoesTecnicas.filter(instrucao =>
    instrucao.titulo.toLowerCase().includes(termo.toLowerCase())
  );
}

// Usar no componente:
// import { instrucoesTecnicas, totalInstrucoes } from '@/lib/instrucoes-scraped';
