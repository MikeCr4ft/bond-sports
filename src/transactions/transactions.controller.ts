import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { StatementQueryDto } from './dto/statement-query.dto';
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

  @Get(':id/statement')
  getStatement(@Param('id') id: string, @Query() query: StatementQueryDto) {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    return this.transactionsService.getStatement(id, from, to);
  }
}
