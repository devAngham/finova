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

/**
 * Optional, extensible signals beyond riskLevel that can inform
 * routing decisions later. Everything here is optional on purpose —
 * the Gateway falls back to riskLevel alone when this is absent,
 * so existing callers never need to change.
 *
 * NOTE: none of these fields are consumed by any routing logic yet.
 * They exist so the shape is ready to extend without breaking
 * ModelRequest's signature when real routing rules are added.
 */
export interface RoutingContext {
  /**
   * The banking tool being invoked (e.g. 'external_transfer',
   * 'get_account_balance'). Not used by routing yet — intended to
   * let the Gateway route by task type in addition to risk level
   * (e.g. always send external_transfer through a stricter model,
   * regardless of amount).
   */
  toolName?: string;

  /**
   * The monetary value involved in the request, if any (e.g. a
   * transfer amount). Not used by routing yet — intended to let
   * high-value transactions escalate to a more careful model even
   * when riskLevel alone wouldn't trigger that on its own
   * (e.g. a $20 transfer vs. a $50,000 transfer under the same
   * 'high' riskLevel bucket).
   */
  amount?: number;
}

export type RiskLevel = 'low' | 'high';

export interface ModelRequest {
  messages: GatewayMessage[];
  tools?: unknown[];
  riskLevel: RiskLevel;
  routingContext?: RoutingContext,
}

export interface ModelResponse {
  content: string | null;
  toolCalls: GatewayToolCall[] | null;
  providerName: string;
  raw: unknown;
}
