// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/backend/services/search.service';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  async search(request: NextRequest) {
    try {
      const body = await request.json();
      const { query, filters, options } = body;

      const result = await this.searchService.performSearch({
        query,
        filters,
        options,
      });

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error in search:', error);
      return NextResponse.json(
        { success: false, error: 'Erro na busca' },
        { status: 500 }
      );
    }
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  async getSuggestions(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const query = searchParams.get('q') || '';

      const suggestions = await this.searchService.getSuggestions(query);

      return NextResponse.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      console.error('Error in getSuggestions:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar sugestões' },
        { status: 500 }
      );
    }
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  async aiSearch(request: NextRequest) {
    try {
      const body = await request.json();
      const { prompt, searchTerm, filters, options } = body;

      const result = await this.searchService.performAISearch({
        query: searchTerm,
        prompt,
        searchTerm,
        filters,
        options,
      });

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error in aiSearch:', error);
      return NextResponse.json(
        { success: false, error: 'Erro na busca inteligente' },
        { status: 500 }
      );
    }
  }
}

// ✔️ Protegido com AIDEV-PROTECTED