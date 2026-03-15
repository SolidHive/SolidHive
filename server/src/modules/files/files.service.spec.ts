import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { Role } from '../users/entities/role.entity';
import { AssociationRole } from '../associations/modules/roles/entities/association-role.entity';
import { User } from '../users/entities/user.entity';

describe('FilesService', () => {
  let service: FilesService;

  const filesRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const roleRepositoryMock = {
    find: jest.fn(),
  };

  const associationRoleRepositoryMock = {
    find: jest.fn(),
  };

  const userRepositoryMock = {
    findOne: jest.fn(),
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
        FilesService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: getRepositoryToken(Role), useValue: roleRepositoryMock },
        { provide: getRepositoryToken(AssociationRole), useValue: associationRoleRepositoryMock },
        { provide: getRepositoryToken(User), useValue: userRepositoryMock },
        { provide: getRepositoryToken(File), useValue: filesRepositoryMock },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée un fichier quand la cible existe', async () => {
      const dto = { relatedTo: 'Association', relatedBy: 'assoc-1', type: 'image' };
      const file: Express.Multer.File = {
        originalname: 'test.jpg',
        filename: 'test-123.jpg',
        size: 1024,
        mimetype: 'image/jpeg',
      } as any;
      const created = { ...dto, userId: 'user-1', extension: 'jpg', ...file };
      const saved = { id: 'file-1', ...created };

      targetRepositoryMock.findOne.mockResolvedValue({ id: 'assoc-1' });
      roleRepositoryMock.find.mockResolvedValue([]);
      associationRoleRepositoryMock.find.mockResolvedValue([]);
      filesRepositoryMock.create.mockReturnValue(created);
      filesRepositoryMock.save.mockResolvedValue(saved);

      const result = await service.create(dto as any, file, 'user-1');

      expect(dataSourceMock.getRepository).toHaveBeenCalledWith('Association');
      expect(targetRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'assoc-1' } });
      expect(filesRepositoryMock.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(saved);
    });

    it('lève NOT_FOUND si cible n existe pas', async () => {
      const dto = { relatedTo: 'Association', relatedBy: 'missing', type: 'image' };
      const file: Express.Multer.File = { originalname: 'test.jpg' } as any;

      targetRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.create(dto as any, file, 'user-1')).rejects.toThrow(
        new HttpException('Association not found', HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('findOne', () => {
    it('retourne un fichier par relatedTo, relatedBy et index', async () => {
      const file = {
        id: 'file-1',
        relatedTo: 'Association',
        relatedBy: 'assoc-1',
        allowedAssociationRoles: [],
        allowedSystemRoles: [],
      };
      filesRepositoryMock.findOne.mockResolvedValue(file);

      const result = await service.findOne('Association', 'assoc-1', 0);

      expect(filesRepositoryMock.findOne).toHaveBeenCalled();
      expect(result).toEqual(file);
    });
  });

  describe('remove', () => {
    it('supprime un fichier', async () => {
      const file = { id: 'file-1', allowedAssociationRoles: [], allowedSystemRoles: [] };
      filesRepositoryMock.findOne.mockResolvedValue(file);
      filesRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      await service.remove('Association', 'assoc-1', 0, 'image');

      expect(filesRepositoryMock.delete).toHaveBeenCalled();
    });
  });
});
