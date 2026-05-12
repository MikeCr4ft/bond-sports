import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  account: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
    aggregate: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(
      (cb: (tx: typeof mockPrisma) => unknown) => cb(mockPrisma),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  // --- deposit ------------------------------------------------------------

  describe('deposit', () => {
    it('throws NotFoundException when account does not exist', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);

      await expect(service.deposit('no-id', 50)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the created transaction on success', async () => {
      const fakeAccount = {
        accountId: 'uuid-1',
        balance: new Prisma.Decimal(100),
        activeFlag: true,
      };
      const fakeTx = {
        transactionId: 'tx-1',
        accountId: 'uuid-1',
        value: new Prisma.Decimal(50),
        type: 'DEPOSIT',
        transactionDate: new Date(),
      };

      mockPrisma.account.findUnique.mockResolvedValue(fakeAccount);
      mockPrisma.account.update.mockResolvedValue({
        ...fakeAccount,
        balance: new Prisma.Decimal(150),
      });
      mockPrisma.transaction.create.mockResolvedValue(fakeTx);

      const result = await service.deposit('uuid-1', 50);

      expect(result).toEqual(fakeTx);
    });
  });

  // --- getStatement -------------------------------------------------------

  describe('getStatement', () => {
    it('throws NotFoundException when account does not exist', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);

      await expect(service.getStatement('no-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns all transactions ordered by date descending when no filters given', async () => {
      const fakeTxs = [
        {
          transactionId: 'tx-2',
          type: 'WITHDRAWAL',
          value: new Prisma.Decimal(20),
          transactionDate: new Date('2026-05-12'),
        },
        {
          transactionId: 'tx-1',
          type: 'DEPOSIT',
          value: new Prisma.Decimal(100),
          transactionDate: new Date('2026-05-11'),
        },
      ];
      mockPrisma.account.findUnique.mockResolvedValue({ accountId: 'uuid-1' });
      mockPrisma.transaction.findMany.mockResolvedValue(fakeTxs);

      const result = await service.getStatement('uuid-1');

      expect(result).toEqual(fakeTxs);
    });

    it('returns only transactions on or after `from` date', async () => {
      const from = new Date('2026-05-12T00:00:00.000Z');
      const matching = {
        transactionId: 'tx-2',
        type: 'DEPOSIT',
        value: new Prisma.Decimal(50),
        transactionDate: new Date('2026-05-12T10:00:00.000Z'),
      };
      mockPrisma.account.findUnique.mockResolvedValue({ accountId: 'uuid-1' });
      mockPrisma.transaction.findMany.mockResolvedValue([matching]);

      const result = await service.getStatement('uuid-1', from);

      expect(result).toEqual([matching]);
    });

    it('returns only transactions on or before `to` date', async () => {
      const to = new Date('2026-05-11T23:59:59.999Z');
      const matching = {
        transactionId: 'tx-1',
        type: 'DEPOSIT',
        value: new Prisma.Decimal(100),
        transactionDate: new Date('2026-05-11T08:00:00.000Z'),
      };
      mockPrisma.account.findUnique.mockResolvedValue({ accountId: 'uuid-1' });
      mockPrisma.transaction.findMany.mockResolvedValue([matching]);

      const result = await service.getStatement('uuid-1', undefined, to);

      expect(result).toEqual([matching]);
    });

    it('returns only transactions within the `from`+`to` range', async () => {
      const from = new Date('2026-05-10T00:00:00.000Z');
      const to = new Date('2026-05-11T23:59:59.999Z');
      const matching = {
        transactionId: 'tx-1',
        type: 'WITHDRAWAL',
        value: new Prisma.Decimal(30),
        transactionDate: new Date('2026-05-11T12:00:00.000Z'),
      };
      mockPrisma.account.findUnique.mockResolvedValue({ accountId: 'uuid-1' });
      mockPrisma.transaction.findMany.mockResolvedValue([matching]);

      const result = await service.getStatement('uuid-1', from, to);

      expect(result).toEqual([matching]);
    });
  });

  // --- withdraw -----------------------------------------------------------

  describe('withdraw', () => {
    it('throws NotFoundException when account does not exist', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await expect(service.withdraw('no-id', 50)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when account is blocked', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          accountId: 'uuid-1',
          balance: new Prisma.Decimal(500),
          dailyWithdrawalLimit: new Prisma.Decimal(1000),
          activeFlag: false,
        },
      ]);

      await expect(service.withdraw('uuid-1', 50)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws UnprocessableEntityException when amount exceeds balance', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          accountId: 'uuid-1',
          balance: new Prisma.Decimal(30),
          dailyWithdrawalLimit: new Prisma.Decimal(1000),
          activeFlag: true,
        },
      ]);

      await expect(service.withdraw('uuid-1', 50)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('throws UnprocessableEntityException when daily limit would be exceeded', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          accountId: 'uuid-1',
          balance: new Prisma.Decimal(500),
          dailyWithdrawalLimit: new Prisma.Decimal(100),
          activeFlag: true,
        },
      ]);
      // 80 already withdrawn today; 80 + 50 = 130 > 100
      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { value: new Prisma.Decimal(80) },
      });

      await expect(service.withdraw('uuid-1', 50)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('returns the created transaction on successful withdrawal', async () => {
      const fakeAccount = {
        accountId: 'uuid-1',
        balance: new Prisma.Decimal(500),
        dailyWithdrawalLimit: new Prisma.Decimal(1000),
        activeFlag: true,
      };
      const fakeTx = {
        transactionId: 'tx-1',
        accountId: 'uuid-1',
        value: new Prisma.Decimal(50),
        type: 'WITHDRAWAL',
        transactionDate: new Date(),
      };

      mockPrisma.$queryRaw.mockResolvedValue([fakeAccount]);
      // No withdrawals yet today
      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { value: null },
      });
      mockPrisma.account.update.mockResolvedValue({
        ...fakeAccount,
        balance: new Prisma.Decimal(450),
      });
      mockPrisma.transaction.create.mockResolvedValue(fakeTx);

      const result = await service.withdraw('uuid-1', 50);

      expect(result).toEqual(fakeTx);
    });
  });
});
