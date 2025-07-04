// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { NextRequest } from 'next/server';
import { SearchController } from '@/api/controllers/search.controller';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
const controller = new SearchController();

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export async function POST(request: NextRequest) {
  return controller.aiSearch(request);
}

// ✔️ Protegido com AIDEV-PROTECTED