export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface GatewayMessage {
  role: MessageRole;
  content: string | null;
  tool_call_id?: string;
  name?: string;
}

export interface GatewayToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export type RiskLevel = 'low' | 'high';

export interface ModelRequest {
  messages: GatewayMessage[];
  tools?: unknown[];
  riskLevel: RiskLevel;
}

export interface ModelResponse {
  content: string | null;
  toolCalls: GatewayToolCall[] | null;
  providerName: string;
  raw: unknown;
}
