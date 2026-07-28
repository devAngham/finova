/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';

import Redis from 'ioredis';

import { AccountService } from '../accounts/accounts.service';
import { TransactionService } from '../transactions/transactions.service';
import { bankingTools } from './tools/banking.tools';

import { getBankingPrompt } from './prompts/banking.prompt';
import { AiService } from './ai.service';

@Injectable()
export class AdvisorService {
  constructor(
    @InjectRedis() private redis: Redis,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private aiService: AiService,
  ) {}

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
    const prompt = getBankingPrompt(userContext);
    const chatHistory = await this.getChatHistory(userId);

    const messages = [
      { role: 'system', content: prompt },
      ...chatHistory,
      { role: 'user', content: msg },
    ];

    const responseContent = await this.aiService.runConversation(
      messages,
      bankingTools,
      'low',
      (toolName, args) => this.handleToolCall(userId, toolName, args),
    );

    await this.saveChatHistory(userId, [
      ...chatHistory,
      { role: 'user', content: msg },
      { role: 'assistant', content: responseContent },
    ]);

    return responseContent;
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
      case 'find_account_by_number': {
        const account = await this.accountService.findByAccountNumber(
          toolArgs.accountNumber,
        );
        if (!account)
          return {
            error: 'Account not found. Please check the account number.',
          };
        return {
          accountId: account.id,
          accountNumber: account.accountNumber,
          ownerName: account.user?.name,
          currency: account.currency,
          accountType: account.accountType,
        };
      }
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  }
}
