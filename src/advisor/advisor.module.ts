import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from 'src/accounts/account.entity';
import { Transaction } from 'src/transactions/transaction.entity';
import { AdvisorController } from './advisor.controller';
import { AccountService } from 'src/accounts/accounts.service';
import { TransactionService } from 'src/transactions/transactions.service';
import { AdvisorService } from './advisor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Transaction])],
  controllers: [AdvisorController],
  providers: [AdvisorService, AccountService, TransactionService],
  exports: [AdvisorService],
})
export class AdvisorModule {}
