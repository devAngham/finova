/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
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
   * Chooses which provider handles this request.
   *
   * Today: always returns MistralProvider — there is only one provider
   * registered, so no real routing decision exists yet.
   *
   * Intended future logic once a second provider (e.g. Groq, Claude) is
   * added: inspect request.riskLevel (and later request.routingContext)
   * to route 'high' risk requests to a more careful/accurate provider,
   * while 'low' risk requests continue to use the faster one.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private selectProvider(request: ModelRequest): ModelProvider {
    return this.groqProvider;
  }
}
