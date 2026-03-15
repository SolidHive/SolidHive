import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserAssociation } from '../associations/modules/users/entities/user-association.entity';
import { EventRegister } from '../associations/modules/events/modules/registers/entities/event-register.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Association } from '../associations/entities/association.entity';
import { Fundraising } from '../associations/modules/fundraisings/entities/fundraising.entity';
import { Event } from '../associations/modules/events/entities/event.entity';
import { UserSecurityService } from '../security/user-security.service';
import { RedisService } from '../../common/redis/redis.service';
import { PasswordUtils } from '../../common/utils/password.utils';
import { Status } from '../../common/enums/status';
import { Roles } from '../../common/enums/roles';

jest.mock('../../common/utils/password.utils');

describe('UsersService', () => {
  let service: UsersService;

  const usersRepositoryMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const roleRepositoryMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const userAssociationRepositoryMock = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const eventRegisterRepositoryMock = {};
  const transactionRepositoryMock = {};
  const favoriteRepositoryMock = {};
  const associationRepositoryMock = {};
  const fundraisingRepositoryMock = {};
  const eventRepositoryMock = {};

  const userSecurityServiceMock = {
    sendVerificationEmail: jest.fn(),
  };

  const redisServiceMock = {
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepositoryMock },
        { provide: getRepositoryToken(Role), useValue: roleRepositoryMock },
        { provide: getRepositoryToken(UserAssociation), useValue: userAssociationRepositoryMock },
        { provide: getRepositoryToken(EventRegister), useValue: eventRegisterRepositoryMock },
        { provide: getRepositoryToken(Transaction), useValue: transactionRepositoryMock },
        { provide: getRepositoryToken(Favorite), useValue: favoriteRepositoryMock },
        { provide: getRepositoryToken(Association), useValue: associationRepositoryMock },
        { provide: getRepositoryToken(Fundraising), useValue: fundraisingRepositoryMock },
        { provide: getRepositoryToken(Event), useValue: eventRepositoryMock },
        { provide: UserSecurityService, useValue: userSecurityServiceMock },
        { provide: RedisService, useValue: redisServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('findByEmail retourne l utilisateur quand email existe', async () => {
      const user = {
        id: 'user-1',
        email: 'john@test.com',
        roles: [{ name: Roles.USER }],
      };
      usersRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('john@test.com');

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { email: 'john@test.com' },
        relations: ['roles'],
      });
      expect(result).toEqual(user);
    });

    it('findByEmail leve NotFoundException quand email inexistant', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findByEmail('missing@test.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('register', () => {
    it('register enregistre nouvel utilisateur avec email unique', async () => {
      const dto = {
        email: 'newuser@test.com',
        password: 'password123',
        firstname: 'John',
        name: 'Doe',
      };

      const role = { id: 'role-1', name: Roles.USER };
      const savedUser = { id: 'user-1', ...dto, isVerified: false, roles: [role] };

      usersRepositoryMock.findOne.mockResolvedValue(null);
      roleRepositoryMock.findOne.mockResolvedValue(role);
      usersRepositoryMock.create.mockReturnValue(savedUser);
      usersRepositoryMock.save.mockResolvedValue(savedUser);
      userSecurityServiceMock.sendVerificationEmail.mockResolvedValue(void 0);
      (PasswordUtils.generateSalt as jest.Mock).mockReturnValue('salt_value');
      (PasswordUtils.hashPassword as jest.Mock).mockReturnValue('hashed_password');

      const result = await service.register(dto as any);

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(result.message).toContain('Inscription réussie');
    });

    it('register leve ConflictException si email deja utilise', async () => {
      const dto = {
        email: 'existing@test.com',
        password: 'password123',
      };

      usersRepositoryMock.findOne.mockResolvedValue({ id: 'user-1', email: dto.email });

      await expect(service.register(dto as any)).rejects.toThrow(ConflictException);
    });

    it('register retourne message si email verification echoue', async () => {
      const dto = {
        email: 'newuser@test.com',
        password: 'password123',
        firstname: 'John',
        name: 'Doe',
      };

      const role = { id: 'role-1', name: Roles.USER };
      const savedUser = { id: 'user-1', ...dto, isVerified: false, roles: [role] };

      usersRepositoryMock.findOne.mockResolvedValue(null);
      roleRepositoryMock.findOne.mockResolvedValue(role);
      usersRepositoryMock.create.mockReturnValue(savedUser);
      usersRepositoryMock.save.mockResolvedValue(savedUser);
      userSecurityServiceMock.sendVerificationEmail.mockRejectedValue(new Error('Email error'));
      (PasswordUtils.generateSalt as jest.Mock).mockReturnValue('salt_value');
      (PasswordUtils.hashPassword as jest.Mock).mockReturnValue('hashed_password');

      const result = await service.register(dto as any);

      expect(result.message).toContain('email de vérification');
    });
  });

  describe('findOne', () => {
    it('findOne retourne utilisateur par id', async () => {
      const user = { id: 'user-1', email: 'john@test.com', roles: [] };
      usersRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.findOne('user-1');

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: ['roles'],
      });
      expect(result).toEqual(user);
    });

    it('findOne leve NotFoundException si id inexistant', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserAssociations', () => {
    it('getUserAssociations retourne associations de l utilisateur', async () => {
      const userAssociations = [
        {
          id: 'ua-1',
          association: {
            id: 'assoc-1',
            name: 'Assoc 1',
            description: 'Desc 1',
            primaryColor: '#FF0000',
            status: Status.ACCEPTED,
          },
          role: { id: 'role-1', name: 'owner', description: 'Propriétaire' },
          status: Status.ACCEPTED,
          createdAt: new Date(),
        },
      ];
      userAssociationRepositoryMock.find.mockResolvedValue(userAssociations as any);

      const result = await service.getUserAssociations('user-1');

      expect(userAssociationRepositoryMock.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: ['association', 'role'],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.association?.name).toBe('Assoc 1');
      expect(result[0]?.role?.name).toBe('owner');
    });
  });

  describe('hasAccessToAssociation', () => {
    it('hasAccessToAssociation retourne l acces si utilisateur accepte dans association', async () => {
      const userAssociation = {
        id: 'ua-1',
        role: { id: 'role-1', name: 'owner', permissions: ['ALL'] },
        user: {
          id: 'user-1',
          name: 'Doe',
          firstname: 'John',
          email: 'john@test.com',
          phone: '0612345678',
        },
        status: Status.ACCEPTED,
        association: { id: 'assoc-1', name: 'Assoc 1', status: Status.ACCEPTED },
      };
      userAssociationRepositoryMock.findOne.mockResolvedValue(userAssociation as any);

      const result = await service.hasAccessToAssociation('user-1', 'assoc-1');

      expect(userAssociationRepositoryMock.findOne).toHaveBeenCalledWith({
        relations: { role: true, association: true, user: true },
        select: expect.any(Object),
        where: {
          userId: 'user-1',
          associationId: 'assoc-1',
          status: Status.ACCEPTED,
        },
      });
      expect(result).toEqual(userAssociation);
    });

    it('hasAccessToAssociation retourne null si acces non trouve', async () => {
      userAssociationRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.hasAccessToAssociation('user-1', 'assoc-1');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('updateUser modifie donnees utilisateur et invalide cache', async () => {
      const user = {
        id: 'user-1',
        email: 'john@test.com',
        name: 'Doe',
        firstname: 'John',
        phone: '0612345678',
      };
      const updateDto = { firstname: 'Jane', name: 'Smith' };
      const updated = { ...user, ...updateDto };

      usersRepositoryMock.findOne.mockResolvedValue(user);
      usersRepositoryMock.save.mockResolvedValue(updated);
      redisServiceMock.del.mockResolvedValue(void 0);

      const result = await service.updateUser('user-1', updateDto as any);

      expect(usersRepositoryMock.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
      expect(redisServiceMock.del).toHaveBeenCalledWith('user:profile:user-1');
      expect(result).toEqual(updated);
    });
  });
});
