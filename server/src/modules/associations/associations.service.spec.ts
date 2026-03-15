import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AssociationsService } from './associations.service';
import { Association } from './entities/association.entity';
import { User } from '../users/entities/user.entity';
import { File } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';
import { EmailService } from '../../common/utils/email/email.service';
import { Status } from '../../common/enums/status';

jest.mock('fs');
jest.mock('handlebars');

describe('AssociationsService', () => {
  let service: AssociationsService;

  const associationsRepositoryMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  const usersRepositoryMock = {
    findOne: jest.fn(),
  };

  const filesRepositoryMock = {};

  const filesServiceMock = {
    remove: jest.fn(),
  };

  const emailServiceMock = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociationsService,
        { provide: getRepositoryToken(Association), useValue: associationsRepositoryMock },
        { provide: getRepositoryToken(User), useValue: usersRepositoryMock },
        { provide: getRepositoryToken(File), useValue: filesRepositoryMock },
        { provide: FilesService, useValue: filesServiceMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    service = module.get<AssociationsService>(AssociationsService);
    // Ensure the service's filesService reference is set to our mock
    (service as any).filesService = filesServiceMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('create crée une association avec role owner quand utilisateur existe', async () => {
      const dto = {
        name: 'Association Test',
        description: 'Description test',
        siret: '12345678901234',
        contact: 'contact@test.com',
        primaryColor: '#FF0000',
      };

      const user = { id: 'user-1', firstname: 'John', name: 'Doe', email: 'john@test.com' };
      const savedAssociation = { id: 'assoc-1', ...dto, createdBy: user };

      usersRepositoryMock.findOne.mockResolvedValue(user);
      associationsRepositoryMock.manager.transaction.mockImplementation(async (callback) => {
        return callback({
          create: jest.fn().mockReturnValue({}),
          save: jest.fn().mockResolvedValue(savedAssociation),
        });
      });
      emailServiceMock.sendEmail.mockResolvedValue(void 0);

      const result = await service.create(dto as any, 'user-1');

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(result).toEqual(savedAssociation);
    });

    it('create leve NOT_FOUND quand utilisateur n existe pas', async () => {
      const dto = {
        name: 'Association Test',
        siret: '12345678901234',
      };

      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.create(dto as any, 'user-missing')).rejects.toThrow(
        new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND)
      );
    });

    it('create leve CONFLICT quand SIRET est duplique', async () => {
      const dto = {
        name: 'Association Test',
        siret: '12345678901234',
      };

      const user = { id: 'user-1' };
      usersRepositoryMock.findOne.mockResolvedValue(user);
      associationsRepositoryMock.manager.transaction.mockRejectedValue({
        code: '23505',
        constraint: 'UQ_ceee675aefe0bb8f10f54db1696',
      });

      await expect(service.create(dto as any, 'user-1')).rejects.toThrow(
        new HttpException(
          'Ce numéro SIRET est déjà utilisé par une autre association',
          HttpStatus.CONFLICT
        )
      );
    });
  });

  describe('findAll', () => {
    it('findAll retourne associations avec statut ACCEPTED par defaut', async () => {
      const associations = [{ id: 'assoc-1', name: 'Assoc 1', status: Status.ACCEPTED }];
      associationsRepositoryMock.find.mockResolvedValue(associations);

      const result = await service.findAll();

      expect(associationsRepositoryMock.find).toHaveBeenCalledWith({
        where: { status: Status.ACCEPTED },
        order: undefined,
      });
      expect(result).toEqual(associations);
    });

    it('findAll retourne pagination avec meta-donnees', async () => {
      const associations = [{ id: 'assoc-1' }, { id: 'assoc-2' }];
      associationsRepositoryMock.findAndCount.mockResolvedValue([associations, 5]);

      const result = (await service.findAll({
        take: 2,
        skip: 0,
      })) as any;

      expect(result.meta).toEqual({ total: 5, page: 1, limit: 2, totalPages: 3 });
      expect(result.data).toEqual(associations);
    });
  });

  describe('findOne', () => {
    it('findOne retourne association par id', async () => {
      const association = { id: 'assoc-1', name: 'Assoc 1' };
      associationsRepositoryMock.findOne.mockResolvedValue(association);

      const result = await service.findOne('assoc-1');

      expect(associationsRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'assoc-1' },
      });
      expect(result).toEqual(association);
    });
  });

  describe('update', () => {
    it('update modifie association et retourne la version mise a jour', async () => {
      const updateDto = { name: 'New Name' };
      const updated = { id: 'assoc-1', ...updateDto };
      associationsRepositoryMock.update.mockResolvedValue({ affected: 1 });
      associationsRepositoryMock.findOne.mockResolvedValue(updated);

      const result = await service.update('assoc-1', updateDto as any);

      expect(associationsRepositoryMock.update).toHaveBeenCalledWith('assoc-1', updateDto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('remove supprime fichiers puis association', async () => {
      filesServiceMock.remove.mockResolvedValue(void 0);
      associationsRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      await service.remove('assoc-1');

      expect(filesServiceMock.remove).toHaveBeenCalledWith('Association', 'assoc-1', 0, 'image');
      expect(associationsRepositoryMock.delete).toHaveBeenCalledWith('assoc-1');
    });
  });
});
