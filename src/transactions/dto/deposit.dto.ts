import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class DepositDto {
  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @IsPositive()
  amount: number;
}
