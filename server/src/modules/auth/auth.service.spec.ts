import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../../common/redis/redis.service';
import { PasswordUtils } from '../../common/utils/password.utils';

jest.mock('../../common/utils/password.utils');

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    getUserAssociations: jest.fn(),
  };

  const redisServiceMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: RedisService, useValue: redisServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('validateUser retourne l utilisateur quand les identifiants sont valides', async () => {
      const email = 'user@test.com';
      const password = 'password123';
      const user = {
        id: 'user-1',
        email,
        password: 'hashed_password',
        salt: 'salt_value',
        isVerified: true,
        roles: ['user'],
      };

      usersServiceMock.findByEmail.mockResolvedValue(user);
      (PasswordUtils.validatePassword as jest.Mock).mockReturnValue(true);

      const result = await service.validateUser(email, password);

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(email);
      expect(PasswordUtils.validatePassword).toHaveBeenCalledWith(
        password,
        user.salt,
        user.password
      );
      expect(result).toEqual({
        id: user.id,
        roles: user.roles,
        isVerified: user.isVerified,
      });
    });

    it('validateUser leve UnauthorizedException quand le mot de passe est invalide', async () => {
      const email = 'user@test.com';
      const password = 'wrongpassword';
      const user = {
        id: 'user-1',
        email,
        password: 'hashed_password',
        salt: 'salt_value',
        isVerified: true,
        roles: ['user'],
      };

      usersServiceMock.findByEmail.mockResolvedValue(user);
      (PasswordUtils.validatePassword as jest.Mock).mockReturnValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        new UnauthorizedException('Identifiants invalides')
      );
    });

    it('validateUser leve UnauthorizedException quand l utilisateur n est pas verifie', async () => {
      const email = 'user@test.com';
      const password = 'password123';
      const user = {
        id: 'user-1',
        email,
        password: 'hashed_password',
        salt: 'salt_value',
        isVerified: false,
        roles: ['user'],
      };

      usersServiceMock.findByEmail.mockResolvedValue(user);
      (PasswordUtils.validatePassword as jest.Mock).mockReturnValue(true);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        new UnauthorizedException(
          "Votre compte n'est pas vérifié. Veuillez vérifier votre email avant de vous connecter."
        )
      );
    });

    it('validateUser leve UnauthorizedException quand l utilisateur n existe pas', async () => {
      const email = 'nonexistent@test.com';
      const password = 'password123';

      usersServiceMock.findByEmail.mockRejectedValue(new Error('User not found'));

      await expect(service.validateUser(email, password)).rejects.toThrow(
        new UnauthorizedException('Identifiants invalides')
      );
    });
  });

  describe('login', () => {
    it('login retourne un message de succes', () => {
      const result = service.login();

      expect(result).toEqual({ message: 'Connexion réussie' });
    });
  });

  describe('getProfile', () => {
    it('getProfile retourne le profil depuis le cache si disponible', async () => {
      const userId = 'user-1';
      const cachedProfile = {
        name: 'Doe',
        firstname: 'John',
        email: 'john@test.com',
        phone: '0612345678',
        createdAt: new Date(),
        updatedAt: new Date(),
        associations: [],
        roles: ['user'],
      };

      redisServiceMock.get.mockResolvedValue(cachedProfile);

      const result = await service.getProfile(userId);

      expect(redisServiceMock.get).toHaveBeenCalledWith(`user:profile:${userId}`);
      expect(usersServiceMock.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(cachedProfile);
    });

    it('getProfile recupere et met en cache le profil quand non en cache', async () => {
      const userId = 'user-1';
      const user = {
        id: userId,
        name: 'Doe',
        firstname: 'John',
        email: 'john@test.com',
        phone: '0612345678',
        timestamps: {
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
        roles: ['user'],
      };
      const associations = [{ id: 'assoc-1', name: 'Association 1' }];

      redisServiceMock.get.mockResolvedValue(null);
      usersServiceMock.findOne.mockResolvedValue(user);
      usersServiceMock.getUserAssociations.mockResolvedValue(associations);

      const result = await service.getProfile(userId);

      expect(redisServiceMock.get).toHaveBeenCalledWith(`user:profile:${userId}`);
      expect(usersServiceMock.findOne).toHaveBeenCalledWith(userId);
      expect(usersServiceMock.getUserAssociations).toHaveBeenCalledWith(userId);
      expect(redisServiceMock.set).toHaveBeenCalledWith(
        `user:profile:${userId}`,
        {
          name: user.name,
          firstname: user.firstname,
          email: user.email,
          phone: user.phone,
          createdAt: user.timestamps.createdAt,
          updatedAt: user.timestamps.updatedAt,
          associations,
          roles: user.roles,
        },
        300
      );
      expect(result).toEqual({
        name: user.name,
        firstname: user.firstname,
        email: user.email,
        phone: user.phone,
        createdAt: user.timestamps.createdAt,
        updatedAt: user.timestamps.updatedAt,
        associations,
        roles: user.roles,
      });
    });
  });

  describe('logout', () => {
    it('logout invalide le cache et detruit la session', () => {
      const userId = 'user-1';
      const sessionMock = {
        passport: {
          user: {
            id: userId,
          },
        },
        destroy: jest.fn((callback) => callback(null)),
      };
      const responseMock = {
        clearCookie: jest.fn(),
      };

      const result = service.logout(sessionMock as any, responseMock as any);

      expect(redisServiceMock.del).toHaveBeenCalledWith(`user:profile:${userId}`);
      expect(sessionMock.destroy).toHaveBeenCalled();
      expect(responseMock.clearCookie).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });

    it('logout gere une session undefined', () => {
      const responseMock = {
        clearCookie: jest.fn(),
      };

      const result = service.logout(undefined, responseMock as any);

      expect(redisServiceMock.del).not.toHaveBeenCalled();
      expect(responseMock.clearCookie).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });

    it('logout gere une session sans passport user', () => {
      const sessionMock = {
        destroy: jest.fn((callback) => callback(null)),
      };
      const responseMock = {
        clearCookie: jest.fn(),
      };

      const result = service.logout(sessionMock as any, responseMock as any);

      expect(redisServiceMock.del).not.toHaveBeenCalled();
      expect(sessionMock.destroy).toHaveBeenCalled();
      expect(responseMock.clearCookie).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });
  });

  describe('invalidateUserCache', () => {
    it('invalidateUserCache supprime le cache utilisateur', async () => {
      const userId = 'user-1';

      await service.invalidateUserCache(userId);

      expect(redisServiceMock.del).toHaveBeenCalledWith(`user:profile:${userId}`);
    });
  });
});
