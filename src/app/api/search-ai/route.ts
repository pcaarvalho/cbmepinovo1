import { NextRequest } from 'next/server';
import { SearchController } from '@/api/controllers/search.controller';

const controller = new SearchController();

export async function POST(request: NextRequest) {
  return controller.aiSearch(request);
}