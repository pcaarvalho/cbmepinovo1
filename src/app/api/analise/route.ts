// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { NextRequest } from 'next/server';
import { AnalysisController } from '@/backend/api/controllers/analysis.controller';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
const controller = new AnalysisController();

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export async function POST(request: NextRequest) {
  return controller.analyzeDocument(request);
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export async function GET(request: NextRequest) {
  return controller.getAnalysisHistory(request);
}

// ✔️ Protegido com AIDEV-PROTECTED