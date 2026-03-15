import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FundraisingsService } from './fundraisings.service';
import { Fundraising } from './entities/fundraising.entity';
import { File } from '../../../files/entities/file.entity';
import { FilesService } from '../../../files/files.service';

describe('FundraisingsService', () => {
  let service: FundraisingsService;

  const fundraisingsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const fileRepositoryMock = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const filesServiceMock = {
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundraisingsService,
        { provide: getRepositoryToken(Fundraising), useValue: fundraisingsRepositoryMock },
        { provide: getRepositoryToken(File), useValue: fileRepositoryMock },
        { provide: FilesService, useValue: filesServiceMock },
      ],
    }).compile();

    service = module.get<FundraisingsService>(FundraisingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée une cagnotte', async () => {
      const dto = { name: 'Cagnotte Test', description: 'Test' };
      const userAssociation = { id: 'ua-1', associationId: 'assoc-1' };
      const created = { ...dto, createdBy: userAssociation, association: { id: 'assoc-1' } };
      const saved = { id: 'fund-1', ...created };

      fundraisingsRepositoryMock.create.mockReturnValue(created);
      fundraisingsRepositoryMock.save.mockResolvedValue(saved);

      const result = await service.create(dto as any, userAssociation as any);

      expect(fundraisingsRepositoryMock.create).toHaveBeenCalledWith(created);
      expect(fundraisingsRepositoryMock.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(saved);
    });
  });

  describe('findAllGlobal', () => {
    it('retourne toutes les cagnottes', async () => {
      const fundraisings = [{ id: 'fund-1', name: 'Cagnotte' }];
      fundraisingsRepositoryMock.find.mockResolvedValue(fundraisings);

      const _result = await service.findAllGlobal();

      expect(fundraisingsRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retourne les cagnottes d une association', async () => {
      const fundraisings = [{ id: 'fund-1', name: 'Cagnotte' }];
      fundraisingsRepositoryMock.find.mockResolvedValue(fundraisings);

      const _result = await service.findAll('assoc-1');

      expect(fundraisingsRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('retourne une cagnotte par id', async () => {
      const fundraising = { id: 'fund-1', name: 'Cagnotte' };
      fundraisingsRepositoryMock.findOne.mockResolvedValue(fundraising);
      fileRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.findOne('fund-1', 'assoc-1');

      expect(fundraisingsRepositoryMock.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result?.id).toBe('fund-1');
    });
  });

  describe('update', () => {
    it('met à jour une cagnotte', async () => {
      const updateDto = { name: 'Updated' };
      const updated = { id: 'fund-1', ...updateDto };
      fundraisingsRepositoryMock.update.mockResolvedValue({ affected: 1 });
      fundraisingsRepositoryMock.findOne.mockResolvedValue(updated);

      const _result = await service.update('fund-1', 'assoc-1', updateDto as any);

      expect(fundraisingsRepositoryMock.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('supprime une cagnotte', async () => {
      filesServiceMock.remove.mockResolvedValue(void 0);
      fundraisingsRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      await service.remove('fund-1', 'assoc-1');

      expect(fundraisingsRepositoryMock.delete).toHaveBeenCalled();
    });
  });
});
