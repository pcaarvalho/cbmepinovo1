// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { NextRequest } from 'next/server';
import { InstructionsController } from '@/backend/api/controllers/instructions.controller';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
const controller = new InstructionsController();

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export async function GET(request: NextRequest) {
  return controller.getInstructions(request);
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export async function POST(request: NextRequest) {
  return controller.getInstructions(request);
}

// ✔️ Protegido com AIDEV-PROTECTED