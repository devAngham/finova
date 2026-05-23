/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';

import Redis from 'ioredis';
import Groq from 'groq-sdk';

import { AccountService } from '../accounts/accounts.service';
import { TransactionService } from '../transactions/transactions.service';
import { bankingTools } from './tools/banking.tools';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdvisorService {
  private groq: Groq;

  constructor(
    @InjectRedis() private redis: Redis,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private configService: ConfigService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get('GROQ_API_KEY'),
    });
  }

  async getChatHistory(userId: string): Promise<any[]> {
    try {
      const history = await this.redis.get(`chat:${userId}`);
      if (!history) return [];
      return JSON.parse(history) as any[];
    } catch (error) {
      console.error('Error accessing Redis:', error);
      return [];
    }
  }

  async saveChatHistory(userId: string, messages: any[]) {
    await this.redis.set(`chat:${userId}`, JSON.stringify(messages));
  }

  async clearChatHistory(userId: string) {
    await this.redis.del(`chat:${userId}`);
  }

  async chat(userId: string, msg: string) {
    const userContext = await this.buildUserContext(userId);

    const prompt = `
      You are finova AI, an intelligent and friendly banking account,
      User context:
      ${userContext}
      
      Rules:
        - Respond in the same language of the user (Arabic, English), Never switch language
        - Before executing any transaction, always ask for confirmation first
        - After confirmation, proceed with the transfer
        - Never expose full account numbers
        - If user asks something unrelated to banking, politely decline
        - Be concise and professional

        NOT supported: cash deposits, loans, credit cards
      `;

    const chatHistory = await this.getChatHistory(userId);

    const messages = [
      { role: 'system', content: prompt },
      ...chatHistory,
      { role: 'user', content: msg },
    ];

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages as any[],
      tools: bankingTools,
      tool_choice: 'auto',
    });

    const choice = completion.choices[0];

    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      const toolResults = await Promise.all(
        choice.message.tool_calls.map(async (toolCall) => {
          const args = JSON.parse(toolCall.function.arguments) as Record<
            string,
            any
          >;
          const results = (await this.handleToolCall(
            userId,
            toolCall.function.name,
            args,
          )) as any;

          return { toolCall, results };
        }),
      );
      messages.push(choice.message as any); // Add the tool call message to the history
      toolResults.forEach(({ toolCall, results }) => {
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(results),
        } as any);
      });

      const finalCompletion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: messages as any[],
        tools: bankingTools,
        tool_choice: 'auto',
      });
      // return results.length === 1 ? results[0] : results;
      await this.saveChatHistory(userId, [
        ...chatHistory,
        { role: 'user', content: msg },
        {
          role: 'assistant',
          content: finalCompletion.choices[0].message.content,
        },
      ]);
      return finalCompletion.choices[0].message.content;
    }

    await this.saveChatHistory(userId, [
      ...chatHistory,
      { role: 'user', content: msg },
      { role: 'assistant', content: choice.message.content },
    ]);
    return choice.message.content;
  }
  buildUserContext = async (userId: string) => {
    const accounts = await this.accountService.findAll(userId);
    return `Accounts: ${'\n'} ${accounts
      .map(
        (acc) =>
          `Type: ${acc.accountType} (${acc.currency}) : $ ${acc.balance} | ID: ${acc.id}`,
      )
      .join('\n')}
      IMPORTANT: Always use the exact user ID and account ID (uuid) when calling tools.
    `;
  };

  async handleToolCall(
    userId: string,
    toolName: string,
    toolArgs: Record<string, any>,
  ): Promise<any> {
    switch (toolName) {
      case 'create_account':
        return this.accountService.create(userId, toolArgs as any);

      case 'get_accounts':
        return this.accountService.findAll(userId);

      case 'get_account':
        return this.accountService.findById(toolArgs.accountId);

      case 'get_account_balance':
        return this.accountService.getBalance(toolArgs.accountId);

      case 'internal_transfer':
        return this.transactionService.internalTransaction(
          userId,
          toolArgs as any,
        );

      case 'external_transfer':
        return this.transactionService.externalTransaction(
          userId,
          toolArgs as any,
        );

      case 'get_account_transactions':
        return this.transactionService.getAccountTransactions(
          toolArgs.accountId,
        );

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  }
}
