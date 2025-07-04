// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { NextRequest } from 'next/server';
import { SearchController } from '@/backend/api/controllers/search.controller';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
const controller = new SearchController();

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export async function GET(request: NextRequest) {
  return controller.getSuggestions(request);
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export async function POST(request: NextRequest) {
  return controller.search(request);
}

// ✔️ Protegido com AIDEV-PROTECTED