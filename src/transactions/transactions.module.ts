import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { Account } from 'src/accounts/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    TypeOrmModule.forFeature([Transaction, Account]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionsModule {}
