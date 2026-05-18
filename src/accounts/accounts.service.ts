import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(userId: string, accountDto: CreateAccountDto): Promise<Account> {
    const existing = await this.accountRepository.findOne({
      where: {
        user: { id: userId },
        accountType: accountDto.accountType,
        currency: accountDto.currency,
      },
    });

    if (existing) {
      throw new ConflictException(
        `You already have a ${accountDto.accountType} account in ${accountDto.currency}`,
      );
    }
    const account = this.accountRepository.create({
      ...accountDto,
      user: { id: userId },
      accountNumber: `FIN-${userId.replace(/-/g, '').slice(-6).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    });
    return this.accountRepository.save(account);
  }

  async findAll(userId: string): Promise<Account[]> {
    return this.accountRepository.find({ where: { user: { id: userId } } });
  }

  async findById(accountId: string): Promise<Account | null> {
    return this.accountRepository.findOne({ where: { id: accountId } });
  }

  async getBalance(accountId: string) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
      select: ['balance', 'currency'],
    });
    return { balance: account?.balance, Currency: account?.currency };
  }

  // async addBalance(accountId: string, amount: number): Promise<Account> {
  //   const account = await this.accountRepository.findOne({
  //     where: { id: accountId },
  //   });
  //   if (!account) throw new NotFoundException('Account not found');

  //   account.balance = Number(account.balance) + amount;
  //   return this.accountRepository.save(account);
  // }
}
