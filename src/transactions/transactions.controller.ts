import {
  Body,
  Request,
  Param,
  Controller,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TransactionService } from './transactions.service';
import { ExternalTransactionDto } from './dto/external.transaction';
import { InternalTransactionDto } from './dto/internal.transaction';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post('internal')
  createInternalTransaction(
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Body() internalTransaction: InternalTransactionDto,
  ) {
    return this.transactionService.internalTransaction(
      req.user.userId,
      internalTransaction,
    );
  }

  @Post('external')
  createExternalTransaction(
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Body() externalTransaction: ExternalTransactionDto,
  ) {
    return this.transactionService.externalTransaction(
      req.user.userId,
      externalTransaction,
    );
  }

  @Get()
  getTransactions(
    @Request() req: ExpressRequest & { user: { userId: string } },
  ) {
    return this.transactionService.getTransactions(req.user.userId);
  }

  @Get(':accountId')
  getAccountTransactions(@Param('accountId') accountId: string) {
    return this.transactionService.getAccountTransactions(accountId);
  }
}
