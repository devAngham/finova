/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import Groq from 'groq-sdk';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { bankingTools } from './tools/banking.tools';

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_call_id?: string;
  name?: string;
}

@Injectable()
export class AiService {
  private groq: Groq;

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY') ?? '',
    });
  }
  async chat(messages: Message[], userContext: string) {
    const systemPrompt: Message = {
      role: 'system',
      content: `You are Finova AI, an intelligent banking assistant.
      Current user context: ${userContext}
      Rules:
        - Always respond in the same language as the user (Arabic, English, French)
        - Before executing any transfer, ask for confirmation
        - Be concise and helpful
        - Use the available tools to perform banking operations
        - Never expose sensitive data like full account numbers`,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [systemPrompt, ...messages] as any,
      tools: bankingTools as any,
      tool_choice: 'auto',
      max_tokens: 1024,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return response.choices[0].message;
  }
}
