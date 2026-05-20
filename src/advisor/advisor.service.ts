import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

import { AccountService } from 'src/accounts/accounts.service';
import { TransactionService } from 'src/transactions/transactions.service';
import { bankingTools } from './tools/banking.tools';

@Injectable()
export class AdvisorService {
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService,
  ) {}

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
      `;

    // let chatHistory = this.getChatHistory(userId);

    const messages = [
      { role: 'system', content: prompt },
      // ...chatHistory,
      { role: 'user', content: msg },
    ];

    // console.log('Messages sent to Groq:', messages);

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages as any[],
      tools: bankingTools,
      tool_choice: 'auto',
    });

    const choice = completion.choices[0];

    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      const results = await Promise.all(
        choice.message.tool_calls.map((toolCall) => {
          const args = JSON.parse(toolCall.function.arguments) as Record<
            string,
            unknown
          >;
          return this.handleToolCall(userId, toolCall.function.name, args);
        }),
      );
      return results.length === 1 ? results[0] : results;
    }

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
