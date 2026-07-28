import { Injectable } from '@nestjs/common';

import {
  GatewayMessage,
  ModelRequest,
  RiskLevel,
} from '../advisor/gateway/model-gateway.types';

@Injectable()
export class AiService {
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
}
