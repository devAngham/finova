import { Injectable } from '@nestjs/common';

import {
  GatewayMessage,
  ModelRequest,
  RiskLevel,
} from '../advisor/gateway/model-gateway.types';
import { ModelGatewayService } from './gateway/model-gateway.service';

@Injectable()
export class AiService {
  constructor(private readonly modelGatewayService: ModelGatewayService) {}

  buildRequest(
    messages: GatewayMessage[],
    tools: unknown[],
    riskLevel: RiskLevel,
  ): ModelRequest {
    return {
      messages,
      tools,
      riskLevel,
    };
  }

  async runConversation(
    messages: GatewayMessage[],
    tools: unknown[],
    riskLevel: RiskLevel,
    executeTool: (toolName: string, args: Record<string, any>) => Promise<any>,
  ): Promise<string | null> {
    const request = this.buildRequest(messages, tools, riskLevel);

    // First call to the model
    const response = await this.modelGatewayService.execute(request);

    if (!response.toolCalls) {
      return response.content;
    }

    // Model asked for tools — execute them via the caller-supplied
    // function, then send the results back for a final answer.
    const toolResults = await Promise.all(
      response.toolCalls.map(async (toolCall) => ({
        toolCall,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        result: await executeTool(toolCall.name, toolCall.arguments),
      })),
    );

    const followedUpMessages: GatewayMessage[] = [
      ...messages,
      {
        role: 'assistant',
        content: response.content,
        tool_calls: response.toolCalls ?? undefined,
      },
      ...toolResults.map(({ toolCall, result }) => ({
        role: 'tool' as const,
        content: JSON.stringify(result) ?? '{}',
        tool_call_id: toolCall.id,
      })),
    ];

    const finalRequest = this.buildRequest(
      followedUpMessages,
      tools,
      riskLevel,
    );

    const finalResponse = await this.modelGatewayService.execute(finalRequest);

    return finalResponse.content;
  }
}
