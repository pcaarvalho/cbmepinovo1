import { InstructionsRepository } from '@/core/repositories/instructions.repository';
import { SearchRepository } from '@/core/repositories/search.repository';
import { InstrucaoTecnica, FiltrosPesquisa } from '@/shared/types/instructions';

export class InstructionsService {
  private instructionsRepo: InstructionsRepository;
  private searchRepo: SearchRepository;

  constructor() {
    this.instructionsRepo = new InstructionsRepository();
    this.searchRepo = new SearchRepository();
  }

  async searchInstructions(filters: FiltrosPesquisa) {
    try {
      // Aplicar filtros e buscar instruções
      const instructions = await this.instructionsRepo.search(filters);
      
      // Registrar busca para analytics
      await this.searchRepo.recordSearch({
        query: filters.termo || '',
        filters: {
          categoria: filters.categoria,
          tags: filters.tags,
        },
        resultsCount: instructions.length,
      });

      return {
        instructions,
        total: instructions.length,
        filters: {
          applied: filters,
          available: await this.getAvailableFilters(),
        },
      };
    } catch (error) {
      console.error('Error searching instructions:', error);
      throw new Error('Erro ao buscar instruções técnicas');
    }
  }

  async getInstructionById(id: string): Promise<InstrucaoTecnica | null> {
    try {
      const instruction = await this.instructionsRepo.findById(id);
      
      if (instruction) {
        // Incrementar contador de visualizações
        await this.instructionsRepo.incrementViews(id);
      }

      return instruction;
    } catch (error) {
      console.error('Error getting instruction by ID:', error);
      throw new Error('Erro ao buscar instrução técnica');
    }
  }

  async getPopularInstructions(limit: number = 10) {
    try {
      return await this.instructionsRepo.findPopular(limit);
    } catch (error) {
      console.error('Error getting popular instructions:', error);
      throw new Error('Erro ao buscar instruções populares');
    }
  }

  async getInstructionsByCategory(categoria: string) {
    try {
      return await this.instructionsRepo.findByCategory(categoria);
    } catch (error) {
      console.error('Error getting instructions by category:', error);
      throw new Error('Erro ao buscar instruções por categoria');
    }
  }

  private async getAvailableFilters() {
    return {
      categorias: await this.instructionsRepo.getUniqueCategories(),
      tags: await this.instructionsRepo.getUniqueTags(),
    };
  }
}