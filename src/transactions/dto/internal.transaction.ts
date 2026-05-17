import { IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class InternalTransactionDto {
  @IsString()
  fromAccount!: string;

  @IsString()
  toAccount!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;
}
