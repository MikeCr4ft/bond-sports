import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { BlockAccountDto } from './dto/block-account.dto';
import { CreateAccountDto } from './dto/create-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiResponse({ status: 201, description: 'Account created successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Validation error — missing or invalid fields.',
  })
  create(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiResponse({ status: 200, description: 'Account found.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Block or unblock an account' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiResponse({ status: 200, description: 'Account active flag updated.' })
  @ApiResponse({ status: 400, description: 'Validation error — invalid body.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  setActive(@Param('id') id: string, @Body() dto: BlockAccountDto) {
    return this.accountsService.setActive(id, dto.active);
  }
}
