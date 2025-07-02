// ==============================================================================
// TYPES - INSTRUCTIONS DOMAIN
// ==============================================================================

export interface InstrucaoTecnica {
  id: string;
  numero: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  conteudo: string;
  versao: string;
  dataPublicacao: string;
  ultimaRevisao: string;
  proximaRevisao?: string;
  arquivo: string;
  tamanhoArquivo?: number;
  hashArquivo?: string;
  tags: string[];
  palavrasChave: string[];
  popular: boolean;
  visualizacoes: number;
  downloads: number;
  isActive: boolean;
  metadata: Record<string, unknown>;
  organizationId: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriaIT {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  count: number;
  subcategorias?: SubcategoriaIT[];
}

export interface SubcategoriaIT {
  id: string;
  nome: string;
  descricao: string;
  count: number;
}

export interface FiltrosPesquisa {
  categoria?: string;
  subcategoria?: string;
  dataInicio?: string;
  dataFim?: string;
  tags?: string[];
  palavrasChave?: string[];
  termo?: string;
  popular?: boolean;
  status?: string;
  autor?: string;
  organizacao?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InstructionsSearchResult {
  instructions: InstrucaoTecnica[];
  total: number;
  filters: {
    applied: FiltrosPesquisa;
    available: {
      categorias: string[];
      tags: string[];
    };
  };
}