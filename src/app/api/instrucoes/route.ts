import { NextRequest } from 'next/server';
import { InstructionsController } from '@/backend/api/controllers/instructions.controller';

const controller = new InstructionsController();

export async function GET(request: NextRequest) {
  return controller.getInstructions(request);
}

export async function POST(request: NextRequest) {
  return controller.getInstructions(request);
}