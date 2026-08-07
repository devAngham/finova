import { Injectable } from '@nestjs/common';

import { ModelProvider } from './model-provider.interface';
import { ModelRequest, ModelResponse } from './model-gateway.types';

import { MistralProvider } from './providers/mistral.provider';
import { GroqProvider } from './providers/groq.provider';

/**
 * Single entry point for executing a model request. Callers (AiService)
 * depend on this instead of any specific provider, so adding or
 * swapping providers never requires changing AiService or anything
 * above it.
 */
@Injectable()
export class ModelGatewayService {
  constructor(
    private readonly mistralProvider: MistralProvider,
    private readonly groqProvider: GroqProvider,
  ) {}

  async execute(request: ModelRequest): Promise<ModelResponse> {
    const provider = this.selectProvider(request);
    return provider.execute(request); // default — Mistral is registered and available, real routing lands in a future PR
  }

  /**
   * Chooses which provider handles this request based on risk level.
   *
   * 'high' risk (currently: internal/external transfers) routes to
   * Mistral — not because it's necessarily the most accurate model,
   * but because it's the only non-Groq provider available today.
   * When Claude becomes available, this is the one line that changes.
   *
   * 'low' risk continues to use Groq for speed/cost.
   */

  private selectProvider(request: ModelRequest): ModelProvider {
    return request.riskLevel === 'high'
      ? this.mistralProvider
      : this.groqProvider;
  }
}
