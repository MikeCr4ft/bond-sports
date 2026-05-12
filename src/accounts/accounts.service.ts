import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        personId: dto.personId,
        dailyWithdrawalLimit: dto.dailyWithdrawalLimit,
        accountType: dto.accountType,
      },
    });
  }

  async setActive(id: string, active: boolean) {
    try {
      return await this.prisma.account.update({
        where: { accountId: id },
        data: { activeFlag: active },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      )
        throw new NotFoundException(`Account ${id} not found`);
      throw e;
    }
  }

  async findOne(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { accountId: id },
    });
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }
}
