import { RiskLevel } from './model-gateway.types';

/**
 * Tool names that involve moving money out of an account. Anything
 * here is treated as 'high' risk regardless of amount — a future
 * refinement (see RoutingContext.amount) could downgrade small
 * transfers, but starting conservative: any transfer is high risk
 * until we have real data showing otherwise.
 */
const HIGH_RISK_TOOLS = new Set(['internal_transfer', 'external_transfer']);

/**
 * Classifies risk based on which tool the model is about to execute.
 * Used after the model's first response, once we know what it's
 * actually asking to do — not before.
 */
export function classifyRisk(toolName: string | undefined): RiskLevel {
  if (!toolName) return 'low';
  return HIGH_RISK_TOOLS.has(toolName) ? 'high' : 'low';
}
