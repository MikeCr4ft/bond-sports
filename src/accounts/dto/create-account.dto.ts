import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'person-123' })
  @IsString()
  @IsNotEmpty()
  personId: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  dailyWithdrawalLimit: number;

  @ApiProperty({ enum: [1, 2], description: '1 = Checking, 2 = Savings' })
  @IsIn([1, 2])
  accountType: number;
}
