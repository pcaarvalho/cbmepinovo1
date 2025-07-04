// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { NextRequest, NextResponse } from 'next/server';
import { InstructionsService } from '@/backend/services/instructions.service';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export class InstructionsController {
  private instructionsService: InstructionsService;

  constructor() {
    this.instructionsService = new InstructionsService();
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  async getInstructions(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const filters = {
        q: searchParams.get('q'),
        categoria: searchParams.get('categoria') || undefined,
        tags: searchParams.get('tags')?.split(','),
        limit: parseInt(searchParams.get('limit') || '10'),
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

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
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

// ✔️ Protegido com AIDEV-PROTECTED