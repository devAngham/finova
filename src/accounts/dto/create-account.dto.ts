import { IsEnum } from 'class-validator';
import { AccountType, Currency } from '../account.entity';

export class CreateAccountDto {
  @IsEnum(AccountType)
  accountType!: AccountType;

  @IsEnum(Currency)
  currency!: Currency;
}
