import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account, Currency } from './account.entity';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(userId: string, accountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepository.create({
      ...accountDto,
      user: { id: userId },
      accountNumber: `FIN-${userId.replace(/-/g, '').slice(-8).toUpperCase()}`,
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
}
