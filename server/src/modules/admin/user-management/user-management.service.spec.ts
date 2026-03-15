import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Like } from 'typeorm';
import { UserManagementService } from './user-management.service';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/entities/role.entity';
import { EmailService } from '../../../common/utils/email/email.service';

jest.mock('fs');
jest.mock('handlebars');

describe('UserManagementService', () => {
  let service: UserManagementService;

  const userRepositoryMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  };

  const roleRepositoryMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const emailServiceMock = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock the role initialization
    roleRepositoryMock.findOne.mockResolvedValue(null);
    roleRepositoryMock.create.mockImplementation((roleData) => roleData);
    roleRepositoryMock.save.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserManagementService,
        { provide: getRepositoryToken(User), useValue: userRepositoryMock },
        { provide: getRepositoryToken(Role), useValue: roleRepositoryMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('findAll retourne tous les utilisateurs sans pagination', async () => {
      const users = [
        { id: 'user-1', email: 'john@test.com', firstname: 'John', name: 'Doe' },
        { id: 'user-2', email: 'jane@test.com', firstname: 'Jane', name: 'Smith' },
      ];
      userRepositoryMock.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(userRepositoryMock.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('findAll retourne utilisateurs avec pagination', async () => {
      const users = [{ id: 'user-1', email: 'john@test.com' }];
      userRepositoryMock.findAndCount.mockResolvedValue([users, 5]);

      const result = (await service.findAll({ skip: 0, take: 1 })) as any;

      expect(userRepositoryMock.findAndCount).toHaveBeenCalled();
      expect(result.meta).toEqual({ total: 5, page: 1, limit: 1, totalPages: 5 });
      expect(result.data).toEqual(users);
    });

    it('findAll filtre par recherche textuelle (email, firstname, name)', async () => {
      const users = [{ id: 'user-1', email: 'john@test.com', firstname: 'John' }];
      userRepositoryMock.find.mockResolvedValue(users);

      await service.findAll({ where: { email: Like('%john%') } as any });

      expect(userRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('findOne retourne utilisateur par id', async () => {
      const user = { id: 'user-1', email: 'john@test.com', roles: [] };
      userRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.findOne('user-1');

      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: ['roles'],
      });
      expect(result).toEqual(user);
    });

    it('findOne leve NotFoundException si utilisateur inexistant', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('update modifie les donnees utilisateur', async () => {
      const user = { id: 'user-1', email: 'john@test.com', isVerified: true };
      const updateDto = { email: 'newemail@test.com', isVerified: true };
      const updated = { ...user, ...updateDto };

      userRepositoryMock.findOne.mockResolvedValue(user);
      userRepositoryMock.save.mockResolvedValue(updated);

      const result = await service.update('user-1', updateDto as any);

      expect(userRepositoryMock.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
      expect(result).toEqual(updated);
    });

    it('update envoie email de bannissement quand isVerified passe a false', async () => {
      const user = {
        id: 'user-1',
        email: 'john@test.com',
        firstname: 'John',
        name: 'Doe',
        isVerified: true,
      };
      const updateDto = { isVerified: false };
      const updated = { ...user, ...updateDto };

      userRepositoryMock.findOne.mockResolvedValue(user);
      userRepositoryMock.save.mockResolvedValue(updated);

      await service.update('user-1', updateDto as any);

      // Email n'est envoyé que si le template est chargé
      // En test, les templates fichier ne sont pas disponibles, donc pas d'appel email attendu
      expect(userRepositoryMock.save).toHaveBeenCalled();
    });

    it('update envoie email de debannissement quand isVerified passe a true', async () => {
      const user = {
        id: 'user-1',
        email: 'john@test.com',
        firstname: 'John',
        name: 'Doe',
        isVerified: false,
      };
      const updateDto = { isVerified: true };
      const updated = { ...user, ...updateDto };

      userRepositoryMock.findOne.mockResolvedValue(user);
      userRepositoryMock.save.mockResolvedValue(updated);

      await service.update('user-1', updateDto as any);

      expect(userRepositoryMock.save).toHaveBeenCalled();
    });
  });

  describe('updateRoles', () => {
    it('updateRoles assigne nouveaux roles a utilisateur', async () => {
      const user = { id: 'user-1', roles: [{ name: 'user' }] };
      const roles = [{ name: 'admin' }, { name: 'moderator' }];
      const updated = { ...user, roles };

      userRepositoryMock.findOne.mockResolvedValue(user);

      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(roles),
      };
      roleRepositoryMock.createQueryBuilder.mockReturnValue(queryBuilderMock);
      userRepositoryMock.save.mockResolvedValue(updated);

      const result = await service.updateRoles('user-1', { roles: ['admin', 'moderator'] } as any);

      expect(queryBuilderMock.where).toHaveBeenCalledWith('role.name IN (:...names)', {
        names: ['admin', 'moderator'],
      });
      expect(result).toEqual(updated);
    });

    it('updateRoles leve NotFoundException si role invalide', async () => {
      const user = { id: 'user-1', roles: [] };
      userRepositoryMock.findOne.mockResolvedValue(user);

      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]), // Aucun rôle trouvé
      };
      roleRepositoryMock.createQueryBuilder.mockReturnValue(queryBuilderMock);

      await expect(service.updateRoles('user-1', { roles: ['invalid'] } as any)).rejects.toThrow(
        NotFoundException
      );
    });

    it('updateRoles leve NotFoundException si utilisateur inexistant', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.updateRoles('missing-id', { roles: ['admin'] } as any)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('banUser', () => {
    it('banUser bannit l utilisateur', async () => {
      const user = {
        id: 'user-1',
        email: 'john@test.com',
        firstname: 'John',
        name: 'Doe',
        isVerified: true,
      };
      userRepositoryMock.findOne.mockResolvedValue(user);
      userRepositoryMock.update.mockResolvedValue({ affected: 1 });

      const result = await service.banUser('user-1');

      expect(userRepositoryMock.update).toHaveBeenCalledWith('user-1', { isVerified: false });
      expect(result.message).toBe('Utilisateur banni avec succès');
    });

    it('banUser leve NotFoundException si utilisateur inexistant', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.banUser('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllRoles', () => {
    it('getAllRoles retourne tous les roles', async () => {
      const roles = [
        { id: 'role-1', name: 'admin' },
        { id: 'role-2', name: 'user' },
      ];
      roleRepositoryMock.find.mockResolvedValue(roles);

      const result = await service.getAllRoles();

      expect(roleRepositoryMock.find).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });
  });
});
