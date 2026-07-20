import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DemoService } from './demo.service';
import { DemoController } from './demo.controller';

import { User } from '../users/user.entity';
import { Account } from '../accounts/account.entity';
import { Transaction } from '../transactions/transaction.entity';
import { AccountService } from '../accounts/accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Account, Transaction])],
  controllers: [DemoController],
  providers: [DemoService, AccountService],
})
export class DemoModule {}
