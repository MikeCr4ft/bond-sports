import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async deposit(accountId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { accountId } });
      if (!account)
        throw new NotFoundException(`Account ${accountId} not found`);

      await tx.account.update({
        where: { accountId },
        data: { balance: { increment: amount } },
      });

      return tx.transaction.create({
        data: { accountId, value: amount, type: 'DEPOSIT' },
      });
    });
  }

  async withdraw(accountId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const [account] = await tx.$queryRaw<Account[]>`
        SELECT * FROM "Account" WHERE "accountId" = ${accountId} FOR UPDATE
      `;
      if (!account)
        throw new NotFoundException(`Account ${accountId} not found`);
      if (!account.activeFlag)
        throw new ForbiddenException('Account is blocked');

      if (new Prisma.Decimal(account.balance).lessThan(amount)) {
        throw new UnprocessableEntityException('Insufficient balance');
      }

      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);

      const dailySumResult = await tx.transaction.aggregate({
        where: {
          accountId,
          type: 'WITHDRAWAL',
          transactionDate: { gte: todayStart },
        },
        _sum: { value: true },
      });

      const todayWithdrawn = new Prisma.Decimal(dailySumResult._sum.value ?? 0);
      const dailyLimit = new Prisma.Decimal(account.dailyWithdrawalLimit);

      if (todayWithdrawn.plus(amount).greaterThan(dailyLimit)) {
        throw new UnprocessableEntityException(
          'Daily withdrawal limit exceeded',
        );
      }

      await tx.account.update({
        where: { accountId },
        data: { balance: { decrement: amount } },
      });

      return tx.transaction.create({
        data: { accountId, value: amount, type: 'WITHDRAWAL' },
      });
    });
  }
}
