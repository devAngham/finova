import { IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class ExternalTransactionDto {
  @IsString()
  fromAccount!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  iban!: string;

  @IsString()
  recipientName!: string;
}
