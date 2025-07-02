import { NextRequest, NextResponse } from 'next/server';
import { AnalysisService } from '@/core/services/analysis.service';

export class AnalysisController {
  private analysisService: AnalysisService;

  constructor() {
    this.analysisService = new AnalysisService();
  }

  async analyzeDocument(request: NextRequest) {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'Arquivo não fornecido' },
          { status: 400 }
        );
      }

      const result = await this.analysisService.analyzeDocument(file);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error in analyzeDocument:', error);
      return NextResponse.json(
        { success: false, error: 'Erro na análise do documento' },
        { status: 500 }
      );
    }
  }

  async getAnalysisHistory(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const userId = searchParams.get('userId');
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = parseInt(searchParams.get('offset') || '0');

      const history = await this.analysisService.getAnalysisHistory({
        userId,
        limit,
        offset,
      });

      return NextResponse.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error('Error in getAnalysisHistory:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar histórico' },
        { status: 500 }
      );
    }
  }

  async getAnalysisById(request: NextRequest, id: string) {
    try {
      const analysis = await this.analysisService.getAnalysisById(id);
      
      if (!analysis) {
        return NextResponse.json(
          { success: false, error: 'Análise não encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error('Error in getAnalysisById:', error);
      return NextResponse.json(
        { success: false, error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }
  }
}