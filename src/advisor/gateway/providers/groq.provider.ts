import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Groq from 'groq-sdk';

import { ModelProvider } from '../model-provider.interface';
import { ModelRequest, ModelResponse } from '../model-gateway.types';

/**
 * Wraps the Groq SDK behind the shared ModelProvider contract.
 *
 * Responsibility boundary: this class only translates between the
 * unified Gateway format and Groq's own request/response shape.
 * It does NOT execute tool calls — that's business logic that
 * belongs to whatever orchestrates the conversation (AdvisorService
 * today, the Gateway itself later). Keeping that logic out of here
 * is what lets a ClaudeProvider or MistralProvider exist later
 * without duplicating banking logic in every adapter.
 */
@Injectable()
export class GroqProvider implements ModelProvider {
  readonly name = 'groq';

  private readonly groq: Groq;
  private readonly model = 'qwen/qwen3.6-27b';

  constructor(private readonly configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get('GROQ_API_KEY'),
    });
  }

  async execute(request: ModelRequest): Promise<ModelResponse> {
    const { messages, tools } = request;

    const completion = await this.groq.chat.completions.create({
      model: this.model,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      messages: messages as any[],
      tools: tools as any[],
      tool_choice: 'auto',
    });

    const choice = completion.choices[0];

    const toolCalls =
      choice.finish_reason === 'tool_calls' && choice.message.tool_calls
        ? choice.message.tool_calls.map((tc) => ({
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments) as Record<string, any>,
          }))
        : null;

    return {
      content: choice.message.content,
      toolCalls,
      providerName: this.name,
      raw: completion,
    };
  }
}
