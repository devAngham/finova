/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';

import { ModelProvider } from '../model-provider.interface';
import { ModelRequest, ModelResponse } from '../model-gateway.types';

@Injectable()
export class GroqProvider implements ModelProvider {
  readonly name = 'groq';

  async execute(request: ModelRequest): Promise<ModelResponse> {
    throw new Error('Not implemented yet');
  }
}
