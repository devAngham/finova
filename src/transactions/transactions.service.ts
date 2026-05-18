import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InternalTransactionDto } from './dto/internal.transaction';
import { ExternalTransactionDto } from './dto/external.transaction';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from './transaction.entity';
import { Account } from 'src/accounts/account.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TransactionServices {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepositery: Repository<Transaction>,
    @InjectRepository(Account)
    private accountRepositery: Repository<Account>,
  ) {}

  async internalTransaction(
    userId: string,
    internalTransactionDto: InternalTransactionDto,
  ): Promise<Transaction> {
    const fromAccount = await this.accountRepositery.findOne({
      where: { id: internalTransactionDto.fromAccount },
    });

    if (!fromAccount) throw new NotFoundException('Source account not found');

    const toAccount = await this.accountRepositery.findOne({
      where: { id: internalTransactionDto.toAccount },
    });

    if (!toAccount)
      throw new NotFoundException('Destination account not found');

    if (fromAccount && fromAccount?.balance < internalTransactionDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    fromAccount.balance =
      Number(fromAccount.balance) - internalTransactionDto.amount;
    toAccount.balance =
      Number(toAccount.balance) + internalTransactionDto.amount;

    await this.accountRepositery.save(fromAccount);
    await this.accountRepositery.save(toAccount);

    const transaction = this.transactionRepositery.create({
      fromAccount,
      toAccount,
      amount: internalTransactionDto.amount,
      type: TransactionType.INTERNAL,
      status: TransactionStatus.COMPLETED,
      description: internalTransactionDto.description,
    });

    return this.transactionRepositery.save(transaction);
  }

  async externalTransaction(
    userId: string,
    externalTransactionDto: ExternalTransactionDto,
  ): Promise<Transaction> {
    const fromAccount = await this.accountRepositery.findOne({
      where: { id: externalTransactionDto.fromAccount, user: { id: userId } },
    });

    if (!fromAccount) throw new NotFoundException('Account not found');

    if (Number(fromAccount.balance) < externalTransactionDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    fromAccount.balance =
      Number(fromAccount.balance) - Number(externalTransactionDto.amount);
    await this.accountRepositery.save(fromAccount);

    const transaction = this.transactionRepositery.create({
      fromAccount,
      amount: externalTransactionDto.amount,
      type: TransactionType.EXTERNAL,
      status: TransactionStatus.PENDING,
      description: externalTransactionDto.description,
      recipientName: externalTransactionDto.recipientName,
      iban: externalTransactionDto.iban,
    });

    return this.transactionRepositery.save(transaction);
  }
}
