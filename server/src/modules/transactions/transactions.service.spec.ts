import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Not } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const usersRepositoryMock = {
    findOne: jest.fn(),
  };

  const transactionsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const targetRepositoryMock = {
    findOne: jest.fn(),
  };

  const associationRepositoryMock = {
    findOne: jest.fn(),
  };

  const dataSourceMock = {
    getRepository: jest.fn((entityName: string) => {
      if (entityName === 'Association') return associationRepositoryMock;
      return targetRepositoryMock;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Recréer le mock dataSourceMock avec sa logique conditionnelle après clearAllMocks
    dataSourceMock.getRepository = jest.fn((entityName: string) => {
      if (entityName === 'Association') return associationRepositoryMock;
      return targetRepositoryMock;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: getRepositoryToken(User), useValue: usersRepositoryMock },
        { provide: getRepositoryToken(Transaction), useValue: transactionsRepositoryMock },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create enregistre une transaction quand la cible existe', async () => {
    const dto = {
      amount: 10,
      type: 'donation',
      relatedTo: 'Association',
      relatedBy: 'assoc-1',
    } as any;

    const user = { id: 'user-1' };
    const created = { ...dto, user };
    const saved = { id: 'trx-1', ...created };

    usersRepositoryMock.findOne.mockResolvedValue(user);
    associationRepositoryMock.findOne.mockResolvedValue({ id: 'assoc-1' });
    transactionsRepositoryMock.create.mockReturnValue(created);
    transactionsRepositoryMock.save.mockResolvedValue(saved);

    const result = await service.create(dto, 'user-1');

    expect(dataSourceMock.getRepository).toHaveBeenCalledWith('Association');
    expect(associationRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'assoc-1' } });
    expect(transactionsRepositoryMock.create).toHaveBeenCalledWith({ ...dto, user });
    expect(transactionsRepositoryMock.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(saved);
  });

  it('create leve NOT_FOUND si la cible n existe pas', async () => {
    const dto = {
      amount: 10,
      type: 'donation',
      relatedTo: 'NonExistentEntity',
      relatedBy: 'missing',
    } as any;

    dataSourceMock.getRepository.mockReturnValue(targetRepositoryMock);
    targetRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.create(dto, 'user-1')).rejects.toEqual(
      new HttpException('NonExistentEntity not found', HttpStatus.NOT_FOUND)
    );
    expect(transactionsRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('findAll retourne les transactions sans pagination', async () => {
    const expected = [{ id: 'trx-1' }];
    transactionsRepositoryMock.find.mockResolvedValue(expected);

    const result = await service.findAll('user-1');

    expect(transactionsRepositoryMock.find).toHaveBeenCalledWith({
      where: { user: { id: 'user-1' } },
    });
    expect(result).toEqual(expected);
  });

  it('findAll utilise findAndCount et renvoie data+meta avec pagination', async () => {
    const rows = [{ id: 'trx-1' }, { id: 'trx-2' }];
    transactionsRepositoryMock.findAndCount.mockResolvedValue([rows, 5]);

    const result = (await service.findAll('user-1', {
      take: 2,
      skip: 2,
      order: { createdAt: 'DESC' },
    } as any)) as any;

    expect(transactionsRepositoryMock.findAndCount).toHaveBeenCalledWith({
      where: { user: { id: 'user-1' } },
      order: { createdAt: 'DESC' },
      skip: 2,
      take: 2,
    });
    expect(result.meta).toEqual({ total: 5, page: 2, limit: 2, totalPages: 3 });
    expect(result.data).toEqual(rows);
  });

  it('findAll applique l operateur $ne dans where', async () => {
    transactionsRepositoryMock.find.mockResolvedValue([]);

    await service.findAll('user-1', {
      where: { relatedTo: { $ne: 'Fundraising' } },
    } as any);

    expect(transactionsRepositoryMock.find).toHaveBeenCalledWith({
      where: {
        user: { id: 'user-1' },
        relatedTo: Not('Fundraising'),
      },
    });
  });

  it('findAll charge les relations demandees', async () => {
    const rows = [{ id: 'trx-1', relatedTo: 'Association', relatedBy: 'assoc-1' }];
    transactionsRepositoryMock.find.mockResolvedValue(rows);
    associationRepositoryMock.findOne.mockResolvedValue({ id: 'assoc-1', name: 'A1' });

    const result = (await service.findAll('user-1', {
      relations: ['association'],
    } as any)) as any[];

    expect(dataSourceMock.getRepository).toHaveBeenCalledWith('Association');
    expect(associationRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 'assoc-1' },
      select: ['id', 'name'],
    });
    expect(result[0].association).toEqual({ id: 'assoc-1', name: 'A1' });
  });

  it('findFiltered type associations exclut Fundraising', async () => {
    transactionsRepositoryMock.find.mockResolvedValue([]);

    await service.findFiltered('user-1', 'associations');

    expect(transactionsRepositoryMock.find).toHaveBeenCalledWith({
      where: {
        user: { id: 'user-1' },
        relatedTo: Not('Fundraising'),
      },
    });
  });

  it('findFiltered type cagnottes force relatedTo Fundraising', async () => {
    transactionsRepositoryMock.find.mockResolvedValue([]);

    await service.findFiltered('user-1', 'cagnottes');

    expect(transactionsRepositoryMock.find).toHaveBeenCalledWith({
      where: {
        user: { id: 'user-1' },
        relatedTo: 'Fundraising',
      },
    });
  });

  it('findOne recherche par id et userId', async () => {
    transactionsRepositoryMock.findOne.mockResolvedValue({ id: 'trx-1' });

    const result = await service.findOne('trx-1', 'user-1');

    expect(transactionsRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 'trx-1', user: { id: 'user-1' } },
    });
    expect(result).toEqual({ id: 'trx-1' });
  });

  it('remove delegue au repository delete', async () => {
    transactionsRepositoryMock.delete.mockResolvedValue({ affected: 1 });

    const result = await service.remove('trx-1');

    expect(transactionsRepositoryMock.delete).toHaveBeenCalledWith('trx-1');
    expect(result).toEqual({ affected: 1 });
  });
});
