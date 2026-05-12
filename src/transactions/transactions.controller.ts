import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { StatementQueryDto } from './dto/statement-query.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@ApiTags('transactions')
@Controller('accounts')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Deposit money into an account' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiResponse({ status: 201, description: 'Deposit recorded.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  deposit(@Param('id') id: string, @Body() dto: DepositDto) {
    return this.transactionsService.deposit(id, dto.amount);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw money from an account' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiResponse({ status: 201, description: 'Withdrawal recorded.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 403, description: 'Account is blocked.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiResponse({
    status: 422,
    description: 'Insufficient balance or daily withdrawal limit exceeded.',
  })
  withdraw(@Param('id') id: string, @Body() dto: WithdrawDto) {
    return this.transactionsService.withdraw(id, dto.amount);
  }

  @Get(':id/statement')
  @ApiOperation({ summary: 'Get transaction statement for an account' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (ISO 8601)',
    example: '2026-05-01',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (ISO 8601)',
    example: '2026-05-31',
  })
  @ApiResponse({ status: 200, description: 'List of transactions.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  getStatement(@Param('id') id: string, @Query() query: StatementQueryDto) {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    return this.transactionsService.getStatement(id, from, to);
  }
}
