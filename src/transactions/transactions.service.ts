import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { InternalTransactionDto } from './dto/internal.transaction';
import { ExternalTransactionDto } from './dto/external.transaction';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from './transaction.entity';
import { Account } from 'src/accounts/account.entity';
import { EventsGateway } from 'src/websocket/events.gateway';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepositery: Repository<Transaction>,
    @InjectRepository(Account)
    private accountRepositery: Repository<Account>,
    private eventsGateway: EventsGateway,
  ) {}

  async internalTransaction(
    userId: string,
    internalTransactionDto: InternalTransactionDto,
  ): Promise<void> {
    const fromAccount = await this.accountRepositery.findOne({
      where: { id: internalTransactionDto.fromAccount },
      relations: ['user'],
    });

    if (!fromAccount) throw new NotFoundException('Source account not found');

    const toAccount = await this.accountRepositery.findOne({
      where: { id: internalTransactionDto.toAccount },
      relations: ['user'],
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

    this.transactionRepositery.save(transaction);

    // Send real-time notifications to (fromAccount) owner
    console.log('Notifying user', fromAccount)
    this.eventsGateway.transactionCompleted(
      fromAccount.user.id,
      internalTransactionDto.amount,
    );
    this.eventsGateway.balanceUpdated(
      fromAccount.user.id,
      fromAccount.id,
      Number(fromAccount.balance),
    );

    // Send real-time notifications to (toAccount) owner
    if (toAccount.user) {
      this.eventsGateway.transactionCompleted(
        toAccount.user.id,
        internalTransactionDto.amount,
      );
      this.eventsGateway.balanceUpdated(
        toAccount.user.id,
        internalTransactionDto.toAccount,
        toAccount.balance,
      );
    }
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

  async getTransactions(userId: string): Promise<Transaction[]> {
    return this.transactionRepositery.find({
      where: { fromAccount: { user: { id: userId } } },
      relations: ['fromAccount', 'toAccount'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAccountTransactions(accountId: string): Promise<Transaction[]> {
    return this.transactionRepositery.find({
      where: { fromAccount: { id: accountId } },
      relations: ['fromAccount', 'toAccount'],
      order: { createdAt: 'DESC' },
    });
  }
}
