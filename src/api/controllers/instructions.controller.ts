import { NextRequest, NextResponse } from 'next/server';
import { InstructionsService } from '@/backend/services/instructions.service';

export class InstructionsController {
  private instructionsService: InstructionsService;

  constructor() {
    this.instructionsService = new InstructionsService();
  }

  async getInstructions(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const filters = {
        q: searchParams.get('q'),
        categoria: searchParams.get('categoria'),
        tags: searchParams.get('tags')?.split(','),
        limit: parseInt(searchParams.get('limit') || '10'),
        offset: parseInt(searchParams.get('offset') || '0'),
      };

      const result = await this.instructionsService.searchInstructions(filters);
      
      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error in getInstructions:', error);
      return NextResponse.json(
        { success: false, error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }
  }

  async getInstructionById(request: NextRequest, id: string) {
    try {
      const instruction = await this.instructionsService.getInstructionById(id);
      
      if (!instruction) {
        return NextResponse.json(
          { success: false, error: 'Instrução não encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: instruction,
      });
    } catch (error) {
      console.error('Error in getInstructionById:', error);
      return NextResponse.json(
        { success: false, error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }
  }
}