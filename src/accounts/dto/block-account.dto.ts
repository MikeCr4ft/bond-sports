import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class BlockAccountDto {
  @ApiProperty({ example: false, description: 'true = unblock, false = block' })
  @IsBoolean()
  active: boolean;
}
