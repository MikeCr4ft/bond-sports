import { Body, Controller, Param, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Controller('accounts')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post(':id/deposit')
  deposit(@Param('id') id: string, @Body() dto: DepositDto) {
    return this.transactionsService.deposit(id, dto.amount);
  }

  @Post(':id/withdraw')
  withdraw(@Param('id') id: string, @Body() dto: WithdrawDto) {
    return this.transactionsService.withdraw(id, dto.amount);
  }
}
