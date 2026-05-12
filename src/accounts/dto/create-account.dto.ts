import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  personId: string;

  @IsNumber()
  dailyWithdrawalLimit: number;

  @IsIn([1, 2])
  accountType: number;
}
