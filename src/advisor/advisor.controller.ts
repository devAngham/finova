import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AdvisorService } from './advisor.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('advisor')
export class AdvisorController {
  constructor(private advisorService: AdvisorService) {}

  @Post('chat')
  chat(
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Body('message') message: string,
  ) {
    return this.advisorService.chat(req.user.userId, message);
  }

  @Get('history')
  getChatHistory(
    @Request() req: ExpressRequest & { user: { userId: string } },
  ) {
    return this.advisorService.getChatHistory(req.user.userId);
  }

  @Delete('history')
  clearChatHistory(
    @Request() req: ExpressRequest & { user: { userId: string } },
  ) {
    return this.advisorService.clearChatHistory(req.user.userId);
  }
}
