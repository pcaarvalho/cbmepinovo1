import { NextRequest } from 'next/server';
import { SearchController } from '@/api/controllers/search.controller';

const controller = new SearchController();

export async function GET(request: NextRequest) {
  return controller.getSuggestions(request);
}

export async function POST(request: NextRequest) {
  return controller.search(request);
}