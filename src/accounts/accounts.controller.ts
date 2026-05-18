import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

import { AccountService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountService: AccountService) {}

  @Post()
  createAccount(
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Body() createAccountDto: CreateAccountDto,
  ) {
    const userId = req.user.userId;
    return this.accountService.create(userId, createAccountDto);
  }

  @Get()
  getAccounts(@Request() req: ExpressRequest & { user: { userId: string } }) {
    const userId = req.user.userId;
    return this.accountService.findAll(userId);
  }

  @Get(':id')
  getAccount(@Param('id') id: string) {
    return this.accountService.findById(id);
  }

  @Get(':id/balance')
  getAccountBalance(@Param('id') id: string) {
    return this.accountService.getBalance(id);
  }

  // @Post(':id/deposit')
  // deposit(@Param('id') id: string, @Body() body: { amount: number }) {
  //   return this.accountService.addBalance(id, body.amount);
  // }
}
