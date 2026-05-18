import { Account } from '../accounts/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TransactionType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  BILL = 'bill',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Account, (account) => account.id)
  fromAccount!: Account;

  @ManyToOne(() => Account, { nullable: true })
  toAccount?: Account;

  @Column()
  amount!: number;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus })
  status!: TransactionStatus;

  @Column({ nullable: true })
  description?: string;

  @Column({ unique: true, nullable: true })
  iban?: string;

  @Column({ nullable: true })
  recipientName?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
