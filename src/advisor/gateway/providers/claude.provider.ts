import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ModelProvider } from '../model-provider.interface';

import Anthropic from '@anthropic-ai/sdk';
import { ModelRequest, ModelResponse } from '../model-gateway.types';

@Injectable()
export class ClaudeProvider implements ModelProvider {
  readonly name = 'claude';

  private readonly anthropic: Anthropic;
  private readonly model = 'claude-opus-4-6';

  constructor(private readonly configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get('ANTHROPIC_API_KEY'), // This is the default and can be omitted
    });
  }

  async execute(request: ModelRequest): Promise<ModelResponse> {
    // const { messages, tools } = request;

    // console.log(999, request.messages);

    const systemMessage = request.messages.find((msg) => msg.role === 'system');
    const otherMessages = request.messages
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content ?? '',
      }));
    // console.log(8888888, systemMessage);
    console.log(665544, otherMessages);

    const completion = await this.anthropic.messages.create({
      max_tokens: 1024,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      messages: otherMessages,
      system: systemMessage?.content ?? undefined,
      model: this.model,
    });

    console.log(3333, completion);

    return {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      raw: request.messages as any[],
      content: '',
      toolCalls: [],
      providerName: this.name,
    };
  }
}
