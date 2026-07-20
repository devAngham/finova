import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as bcrypt from 'bcryptjs';

import { Account, AccountType, Currency } from '../accounts/account.entity';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../transactions/transaction.entity';
import { User } from '../users/user.entity';
import { AccountService } from '../accounts/accounts.service';

const DEMO_USERS: {
  name: string;
  email: string;
  phone: string;
  password: string;
  balance: number;
  accountType: AccountType;
  currency: Currency;
}[] = [
  {
    name: 'Sarah Johnson',
    email: 'demo1@finova.app',
    phone: '+1234567001',
    password: 'Demo@123',
    balance: 2500,
    accountType: AccountType.SAVINGS,
    currency: Currency.USD,
  },
  {
    name: 'Ahmed Hassan',
    email: 'demo2@finova.app',
    phone: '+1234567002',
    password: 'Demo@123',
    balance: 1800,
    accountType: AccountType.SAVINGS,
    currency: Currency.USD,
  },
];

@Injectable()
export class DemoService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRedis() private redis: Redis,
    private accountService: AccountService,
  ) {}

  async resetDemo(): Promise<{ message: string; accounts: any }> {
    const accounts: Account[] = [];

    for (const demoUser of DEMO_USERS) {
      let user = await this.userRepository.findOne({
        where: { email: demoUser.email },
      });

      if (!user) {
        const hashedPassword = bcrypt.hashSync(demoUser.password, 10);
        user = this.userRepository.create({
          name: demoUser.name,
          email: demoUser.email,
          phone: demoUser.phone,
          password: hashedPassword,
        });
        user = await this.userRepository.save(user);
      }

      await this.redis.del(`chat:${user.id}`);

      let account = await this.accountRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user'],
      });

      if (!account) {
        account = await this.accountService.create(user.id, {
          accountType: demoUser.accountType,
          currency: demoUser.currency,
        });
      }

      account.balance = demoUser.balance;
      account = await this.accountRepository.save(account);
      accounts.push(account);
    }

    const [sarahAccount, ahmedAccount] = accounts;

    await this.transactionRepository.delete({
      fromAccount: { id: sarahAccount.id },
    });
    await this.transactionRepository.delete({
      fromAccount: { id: ahmedAccount.id },
    });

    const demoTransactions = [
      {
        fromAccount: sarahAccount,
        toAccount: ahmedAccount,
        amount: 500,
        type: TransactionType.INTERNAL,
        status: TransactionStatus.COMPLETED,
        description: 'Rent payment',
      },
      {
        fromAccount: ahmedAccount,
        toAccount: sarahAccount,
        amount: 200,
        type: TransactionType.INTERNAL,
        status: TransactionStatus.COMPLETED,
        description: 'Dinner split',
      },
      {
        fromAccount: sarahAccount,
        amount: 150,
        type: TransactionType.EXTERNAL,
        status: TransactionStatus.COMPLETED,
        description: 'Electricity bill',
        recipientName: 'Power Company',
        iban: 'GB29NWBK60161331926819',
      },
      {
        fromAccount: ahmedAccount,
        amount: 300,
        type: TransactionType.EXTERNAL,
        status: TransactionStatus.COMPLETED,
        description: 'Online shopping',
        recipientName: 'Amazon Store',
        iban: 'DE89370400440532013000',
      },
    ];

    for (const tx of demoTransactions) {
      const transaction = this.transactionRepository.create(tx as any);
      await this.transactionRepository.save(transaction);
    }

    return {
      message: 'Demo reset successfully!',
      accounts: {
        sarah: {
          email: 'demo1@finova.app',
          password: 'Demo@123',
          balance: '$2,500',
          accountNumber: sarahAccount.accountNumber,
          accountId: sarahAccount.id,
        },
        ahmed: {
          email: 'demo2@finova.app',
          password: 'Demo@123',
          balance: '$1,800',
          accountNumber: ahmedAccount.accountNumber,
          accountId: ahmedAccount.id,
        },
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getDemoCredentials() {
    return {
      accounts: [
        {
          label: 'Sarah Johnson',
          email: 'demo1@finova.app',
          password: 'Demo@123',
          balance: '$2,500',
        },
        {
          label: 'Ahmed Hassan',
          email: 'demo2@finova.app',
          password: 'Demo@123',
          balance: '$1,800',
        },
      ],
      note: 'Click Reset Demo to restore original balances',
    };
  }
}
