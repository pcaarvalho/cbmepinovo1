import { NextRequest } from 'next/server';
import { AnalysisController } from '@/api/controllers/analysis.controller';

const controller = new AnalysisController();

export async function POST(request: NextRequest) {
  return controller.analyzeDocument(request);
}

export async function GET(request: NextRequest) {
  return controller.getAnalysisHistory(request);
}