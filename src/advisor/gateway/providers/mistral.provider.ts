/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';

import { ModelProvider } from '../model-provider.interface';

import { Mistral } from '@mistralai/mistralai';
import { ConfigService } from '@nestjs/config';
import { ModelRequest, ModelResponse } from '../model-gateway.types';

import * as fs from 'fs';

@Injectable()
export class MistralProvider implements ModelProvider {
  readonly name = 'mistral';

  private readonly mistral: Mistral;
  private readonly model = 'mistral-large-latest';
  private readonly debugMode: boolean;

  constructor(private readonly configService: ConfigService) {
    this.mistral = new Mistral({
      apiKey: this.configService.get('MISTRAL_API_KEY'),
    });
    this.debugMode = this.configService.get('FINOVA_MISTRAL_DEBUG') === 'true';
  }

  async execute(request: ModelRequest): Promise<ModelResponse> {
    const { messages, tools } = request;

    let completion;
    try {
      this.logDebug('REQUEST', { model: this.model, messages, tools });

      completion = await this.mistral.chat.complete({
        model: this.model,
        messages: this.translateMessages(messages),
        tools: tools as any[],
      });

      const choice = completion.choices[0];

      const parseArguments = (
        args: string | Record<string, any>,
      ): Record<string, any> => {
        return typeof args === 'string'
          ? (JSON.parse(args) as Record<string, any>)
          : args;
      };

      const toolCalls =
        choice.finishReason === 'tool_calls' && choice.message?.toolCalls
          ? choice.message.toolCalls.map((toolCall) => ({
              id: toolCall.id ?? '',
              name: toolCall.function.name,
              arguments: parseArguments(toolCall.function.arguments),
            }))
          : null;

      return {
        raw: completion,
        content:
          typeof choice.message?.content === 'string'
            ? choice.message.content
            : null,
        toolCalls,
        providerName: this.name,
      };
    } catch (err) {
      this.logDebug('ERROR', err);
      throw err;
    }
  }

  private translateMessages(messages: any[]): any[] {
    const translated = messages.map((msg) => {
      if (msg.role === 'assistant' && msg.tool_calls) {
        return {
          role: 'assistant',
          content: msg.content,
          toolCalls: msg.tool_calls.map((tc: any) => ({
            id: tc.id,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          })),
        };
      }

      if (msg.role === 'tool') {
        return {
          role: 'tool',
          content: msg.content,
          toolCallId: msg.tool_call_id,
        };
      }

      return msg;
    });
    this.logDebug('TRANSLATED MESSAGES', translated);
    return translated;
  }

  private logDebug(label: string, data: unknown): void {
    if (!this.debugMode) return;
    fs.appendFileSync(
      'mistral-debug.log',
      `\n=== ${label} ${new Date().toISOString()} ===\n` +
        JSON.stringify(data, null, 2) +
        '\n',
    );
  }
}
