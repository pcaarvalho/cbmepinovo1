import { InstrucaoTecnica, FiltrosPesquisa } from '@/shared/types/instructions';

export class InstructionsRepository {
  
  async search(filters: FiltrosPesquisa): Promise<InstrucaoTecnica[]> {
    // Mock implementation - replace with real database queries
    const mockInstructions: InstrucaoTecnica[] = [
      {
        id: '1',
        numero: 'IT-001/2019',
        titulo: 'Procedimentos Administrativos',
        descricao: 'Estabelece critérios para tramitação de processos',
        categoria: 'Geral',
        conteudo: 'Conteúdo da instrução técnica...',
        versao: '1.0',
        dataPublicacao: '2019-01-01',
        ultimaRevisao: '2019-01-01',
        arquivo: 'IT-001-2019.pdf',
        tags: ['procedimentos', 'administrativo'],
        palavrasChave: ['tramitação', 'processos'],
        popular: true,
        visualizacoes: 1250,
        downloads: 340,
        isActive: true,
        metadata: {},
        organizationId: 'org-1',
        slug: 'procedimentos-administrativos',
        createdAt: '2019-01-01T00:00:00Z',
        updatedAt: '2019-01-01T00:00:00Z',
      },
      // Add more mock data as needed
    ];

    // Apply filters
    let filteredInstructions = mockInstructions;

    if (filters.termo) {
      const searchTerm = filters.termo.toLowerCase();
      filteredInstructions = filteredInstructions.filter(
        instruction =>
          instruction.titulo.toLowerCase().includes(searchTerm) ||
          instruction.descricao.toLowerCase().includes(searchTerm) ||
          instruction.palavrasChave.some(keyword => 
            keyword.toLowerCase().includes(searchTerm)
          )
      );
    }

    if (filters.categoria) {
      filteredInstructions = filteredInstructions.filter(
        instruction => instruction.categoria === filters.categoria
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredInstructions = filteredInstructions.filter(
        instruction => instruction.tags.some(tag => filters.tags!.includes(tag))
      );
    }

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 10;
    
    return filteredInstructions.slice(offset, offset + limit);
  }

  async findById(id: string): Promise<InstrucaoTecnica | null> {
    // Mock implementation
    const instruction = await this.search({ termo: '', limit: 1000 });
    return instruction.find(inst => inst.id === id) || null;
  }

  async findPopular(limit: number = 10): Promise<InstrucaoTecnica[]> {
    const instructions = await this.search({ popular: true, limit });
    return instructions.sort((a, b) => b.visualizacoes - a.visualizacoes);
  }

  async findByCategory(categoria: string): Promise<InstrucaoTecnica[]> {
    return this.search({ categoria, limit: 100 });
  }

  async incrementViews(id: string): Promise<void> {
    // Mock implementation - in real app, update database
    console.log(`Incrementing views for instruction ${id}`);
  }

  async getUniqueCategories(): Promise<string[]> {
    // Mock implementation
    return ['Geral', 'Saídas de Emergência', 'Iluminação', 'Extintores', 'Hidrantes'];
  }

  async getUniqueTags(): Promise<string[]> {
    // Mock implementation
    return ['procedimentos', 'segurança', 'emergência', 'iluminação', 'extintores'];
  }
}