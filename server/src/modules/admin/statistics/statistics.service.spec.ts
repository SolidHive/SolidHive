import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { Association } from '../../associations/entities/association.entity';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Fundraising } from '../../associations/modules/fundraisings/entities/fundraising.entity';

describe('StatisticsService', () => {
  let service: StatisticsService;

  const createQueryBuilderMock = () => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ total: '1000' }),
    getRawMany: jest.fn().mockResolvedValue([]),
    groupBy: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    innerJoin: jest.fn().mockReturnThis(),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Association),
          useValue: {
            count: jest.fn().mockResolvedValue(5),
            createQueryBuilder: jest.fn().mockReturnValue(createQueryBuilderMock()),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            count: jest.fn().mockResolvedValue(10),
          },
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            count: jest.fn().mockResolvedValue(20),
            createQueryBuilder: jest.fn().mockReturnValue(createQueryBuilderMock()),
          },
        },
        {
          provide: getRepositoryToken(Fundraising),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(createQueryBuilderMock()),
          },
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatistics', () => {
    it('getStatistics retourne les statistiques globales', async () => {
      const result = await service.getStatistics();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('associationsCount');
      expect(result).toHaveProperty('usersCount');
      expect(result).toHaveProperty('donationsCount');
      expect(result).toHaveProperty('totalAmountCollected');
      expect(result).toHaveProperty('solidHiveRevenue');
    });

    it('getStatistics retourne les associations count comme nombre', async () => {
      const result = await service.getStatistics();
      expect(typeof result.associationsCount).toBe('number');
      expect(result.associationsCount).toBe(5);
    });

    it('getStatistics retourne les utilisateurs count', async () => {
      const result = await service.getStatistics();
      expect(typeof result.usersCount).toBe('number');
      expect(result.usersCount).toBe(10);
    });

    it('getStatistics retourne les donations count', async () => {
      const result = await service.getStatistics();
      expect(typeof result.donationsCount).toBe('number');
      expect(result.donationsCount).toBe(20);
    });

    it('getStatistics calcule le montant total collecte', async () => {
      const result = await service.getStatistics();
      expect(typeof result.totalAmountCollected).toBe('number');
    });

    it('getStatistics calcule le revenu SolidHive', async () => {
      const result = await service.getStatistics();
      expect(typeof result.solidHiveRevenue).toBe('number');
    });

    it('getStatistics inclut le top 5 des associations', async () => {
      const result = await service.getStatistics();
      expect(result).toHaveProperty('top5Associations');
      expect(Array.isArray(result.top5Associations)).toBe(true);
    });

    it('getStatistics retourne les cagnottes actives', async () => {
      const result = await service.getStatistics();
      expect(result).toHaveProperty('activeFundraisings');
      expect(typeof result.activeFundraisings).toBe('number');
    });

    it('getStatistics retourne les nouvelles associations du mois', async () => {
      const result = await service.getStatistics();
      expect(result).toHaveProperty('newAssociations');
      expect(typeof result.newAssociations).toBe('number');
    });

    it('getStatistics calcule le taux d acceptation des associations', async () => {
      const result = await service.getStatistics();
      expect(result).toHaveProperty('acceptanceRate');
      expect(typeof result.acceptanceRate).toBe('number');
    });

    it('getStatistics retourne le taux de croissance des dons', async () => {
      const result = await service.getStatistics();
      expect(result).toHaveProperty('donationsGrowth');
      expect(typeof result.donationsGrowth).toBe('number');
    });
  });
});
