import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../prisma/prisma.service';

// A "mock" is a fake version of a dependency.
// Instead of hitting a real database, we give Jest fake functions
// we can control and inspect.
const mockPrisma = {
  account: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('AccountsService', () => {
  let service: AccountsService;

  // beforeEach runs before EVERY it() block below.
  // Here we build a fake NestJS module, swap the real PrismaService
  // for our mockPrisma object, then grab the service we want to test.
  beforeEach(async () => {
    // Reset all mocks between tests so one test can't bleed into the next.
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  // --- create -----------------------------------------------------------

  describe('create', () => {
    it('calls prisma with personId, dailyWithdrawalLimit and accountType — and returns the result', async () => {
      // Arrange: decide what the fake DB will hand back
      const fakeAccount = {
        accountId: 'uuid-1',
        personId: 'person-1',
        dailyWithdrawalLimit: 500,
        accountType: 1,
        balance: 0,
        activeFlag: true,
        createDate: new Date(),
      };
      // mockResolvedValue makes the fake function return a resolved Promise
      mockPrisma.account.create.mockResolvedValue(fakeAccount);

      // Act: call the real service method
      const result = await service.create({
        personId: 'person-1',
        dailyWithdrawalLimit: 500,
        accountType: 1,
      });

      // Assert 1: prisma was called with exactly the right shape
      // (balance and createDate must NOT be passed — Prisma sets them via defaults)
      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: {
          personId: 'person-1',
          dailyWithdrawalLimit: 500,
          accountType: 1,
        },
      });

      // Assert 2: the service returns whatever Prisma gives back
      expect(result).toEqual(fakeAccount);
    });
  });

  // --- findOne ----------------------------------------------------------

  describe('findOne', () => {
    it('throws NotFoundException when account does not exist', async () => {
      // Prisma returns null when no record matches
      mockPrisma.account.findUnique.mockResolvedValue(null);

      // rejects.toThrow() is how you assert that an async function throws.
      // We wrap the call in expect() and chain .rejects before .toThrow().
      await expect(service.findOne('no-such-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the account when it exists', async () => {
      const fakeAccount = {
        accountId: 'uuid-1',
        personId: 'person-1',
        dailyWithdrawalLimit: 500,
        accountType: 1,
        balance: 0,
        activeFlag: true,
        createDate: new Date(),
      };
      mockPrisma.account.findUnique.mockResolvedValue(fakeAccount);

      const result = await service.findOne('uuid-1');

      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({
        where: { accountId: 'uuid-1' },
      });
      expect(result).toEqual(fakeAccount);
    });
  });

  // --- setActive --------------------------------------------------------

  describe('setActive', () => {
    const fakeAccount = {
      accountId: 'uuid-1',
      personId: 'person-1',
      dailyWithdrawalLimit: 500,
      accountType: 1,
      balance: 0,
      activeFlag: false,
      createDate: new Date(),
    };

    it('sets activeFlag to false (block)', async () => {
      mockPrisma.account.update.mockResolvedValue({
        ...fakeAccount,
        activeFlag: false,
      });

      const result = await service.setActive('uuid-1', false);

      expect(mockPrisma.account.update).toHaveBeenCalledWith({
        where: { accountId: 'uuid-1' },
        data: { activeFlag: false },
      });
      expect(result.activeFlag).toBe(false);
    });

    it('sets activeFlag to true (unblock)', async () => {
      mockPrisma.account.update.mockResolvedValue({
        ...fakeAccount,
        activeFlag: true,
      });

      const result = await service.setActive('uuid-1', true);

      expect(mockPrisma.account.update).toHaveBeenCalledWith({
        where: { accountId: 'uuid-1' },
        data: { activeFlag: true },
      });
      expect(result.activeFlag).toBe(true);
    });

    it('throws NotFoundException when account does not exist', async () => {
      const prismaNotFound = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '0.0.0' },
      );
      mockPrisma.account.update.mockRejectedValue(prismaNotFound);

      await expect(service.setActive('no-such-id', false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
