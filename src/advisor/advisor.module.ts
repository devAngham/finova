import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from '../accounts/account.entity';
import { Transaction } from '../transactions/transaction.entity';
import { AdvisorController } from './advisor.controller';
import { AccountService } from 'src/accounts/accounts.service';
import { TransactionService } from 'src/transactions/transactions.service';
import { AdvisorService } from './advisor.service';
import { ConfigService } from '@nestjs/config';
import { EventsModule } from 'src/websocket/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Transaction]), EventsModule],
  controllers: [AdvisorController],
  providers: [
    AdvisorService,
    AccountService,
    TransactionService,
    ConfigService,
  ],
  exports: [AdvisorService],
})
export class AdvisorModule {}
