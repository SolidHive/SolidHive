import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { User } from '../users/entities/user.entity';
import { Favorite } from './entities/favorite.entity';
import { Categories } from '../../common/enums/categories';

describe('FavoritesService', () => {
  let service: FavoritesService;

  const usersRepositoryMock = {
    findOne: jest.fn(),
  };

  const favoritesRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const targetRepositoryMock = {
    findOne: jest.fn(),
  };

  const dataSourceMock = {
    getRepository: jest.fn().mockReturnValue(targetRepositoryMock),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: getRepositoryToken(User), useValue: usersRepositoryMock },
        { provide: getRepositoryToken(Favorite), useValue: favoritesRepositoryMock },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée un favori quand utilisateur et cible existent', async () => {
      const dto = { relatedTo: Categories.ASSOCIATION, relatedBy: 'assoc-1' };
      const user = { id: 'user-1' };
      const created = { ...dto, user };
      const saved = { id: 'fav-1', ...created };

      usersRepositoryMock.findOne.mockResolvedValue(user);
      targetRepositoryMock.findOne.mockResolvedValue({ id: 'assoc-1' });
      favoritesRepositoryMock.create.mockReturnValue(created);
      favoritesRepositoryMock.save.mockResolvedValue(saved);

      const result = await service.create(dto as any, 'user-1');

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(dataSourceMock.getRepository).toHaveBeenCalledWith(Categories.ASSOCIATION);
      expect(targetRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'assoc-1' } });
      expect(favoritesRepositoryMock.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(saved);
    });

    it('lève NOT_FOUND si utilisateur n existe pas', async () => {
      const dto = { relatedTo: Categories.ASSOCIATION, relatedBy: 'assoc-1' };
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.create(dto as any, 'missing')).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND)
      );
    });

    it('lève NOT_FOUND si cible n existe pas', async () => {
      const dto = { relatedTo: Categories.ASSOCIATION, relatedBy: 'missing' };
      const user = { id: 'user-1' };
      usersRepositoryMock.findOne.mockResolvedValue(user);
      targetRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.create(dto as any, 'user-1')).rejects.toThrow(
        new HttpException(`${Categories.ASSOCIATION} not found`, HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('findAll', () => {
    it('retourne les favoris de l utilisateur', async () => {
      const favorites = [{ id: 'fav-1', relatedTo: Categories.ASSOCIATION }];
      favoritesRepositoryMock.find.mockResolvedValue(favorites);

      const result = await service.findAll('user-1');

      expect(favoritesRepositoryMock.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual(favorites);
    });
  });

  describe('findOne', () => {
    it('retourne un favori par relatedTo, relatedBy et userId', async () => {
      const favorite = { id: 'fav-1', relatedTo: Categories.ASSOCIATION, relatedBy: 'assoc-1' };
      favoritesRepositoryMock.findOne.mockResolvedValue(favorite);

      const result = await service.findOne(Categories.ASSOCIATION, 'assoc-1', 'user-1');

      expect(favoritesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          relatedTo: Categories.ASSOCIATION,
          relatedBy: 'assoc-1',
          userId: 'user-1',
        },
      });
      expect(result).toEqual(favorite);
    });
  });

  describe('remove', () => {
    it('supprime un favori', async () => {
      favoritesRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      await service.remove(Categories.ASSOCIATION, 'assoc-1', 'user-1');

      expect(favoritesRepositoryMock.delete).toHaveBeenCalledWith({
        relatedTo: Categories.ASSOCIATION,
        relatedBy: 'assoc-1',
        userId: 'user-1',
      });
    });
  });
});
