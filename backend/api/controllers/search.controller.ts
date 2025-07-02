import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/core/services/search.service';

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

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

  async aiSearch(request: NextRequest) {
    try {
      const body = await request.json();
      const { prompt, searchTerm, filters, options } = body;

      const result = await this.searchService.performAISearch({
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