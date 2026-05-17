import { User } from '../users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.accounts)
  user!: User;

  @Column({ type: 'enum', enum: AccountType })
  accountType!: AccountType;

  @Column({ unique: true })
  accountNumber!: string;

  @Column({ type: 'decimal', default: 0 })
  balance!: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.USD })
  currency!: Currency;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
