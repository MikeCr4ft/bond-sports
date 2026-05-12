import { IsBoolean } from 'class-validator';

export class BlockAccountDto {
  @IsBoolean()
  active: boolean;
}
