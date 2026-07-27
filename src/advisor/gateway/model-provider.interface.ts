import { ModelRequest, ModelResponse } from './model-gateway.types';

/**
 * Every model provider (Groq, Claude, Mistral, ...) implements this.
 * The Gateway only ever talks to providers through this interface —
 * it never imports a provider SDK directly.
 */
export interface ModelProvider {
  /** Short, stable identifier used in routing config, logs, and audit records. */
  readonly name: string;

  execute(request: ModelRequest): Promise<ModelResponse>;
}
