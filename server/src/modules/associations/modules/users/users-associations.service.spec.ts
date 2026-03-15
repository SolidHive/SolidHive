import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersAssociationsService } from './users-associations.service';
import { AssociationRole } from '../roles/entities/association-role.entity';
import { Association } from '../../entities/association.entity';
import { User } from '../../../users/entities/user.entity';
import { UserAssociation } from './entities/user-association.entity';
import { EmailService } from '../../../../common/utils/email/email.service';

describe('UsersAssociationsService', () => {
  let service: UsersAssociationsService;

  const associationRoleRepositoryMock = {
    findOne: jest.fn(),
  };

  const associationRepositoryMock = {
    findOne: jest.fn(),
  };

  const userRepositoryMock = {
    findOne: jest.fn(),
  };

  const userAssociationRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const emailServiceMock = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersAssociationsService,
        { provide: getRepositoryToken(AssociationRole), useValue: associationRoleRepositoryMock },
        { provide: getRepositoryToken(Association), useValue: associationRepositoryMock },
        { provide: getRepositoryToken(User), useValue: userRepositoryMock },
        { provide: getRepositoryToken(UserAssociation), useValue: userAssociationRepositoryMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    service = module.get<UsersAssociationsService>(UsersAssociationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addUserToAssociation', () => {
    it('ajoute un utilisateur à une association', async () => {
      const user = { id: 'user-1', email: 'test@test.com' };
      const association = { id: 'assoc-1' };
      const role = { id: 'role-1', name: 'member' };
      const dto = { email: 'test@test.com', roleId: 'role-1' };
      const created = { user, association, role };
      const saved = { id: 'ua-1', ...created };

      userRepositoryMock.findOne.mockResolvedValue(user);
      associationRepositoryMock.findOne.mockResolvedValue(association);
      associationRoleRepositoryMock.findOne.mockResolvedValue(role);
      userAssociationRepositoryMock.create.mockReturnValue(created);
      userAssociationRepositoryMock.save.mockResolvedValue(saved);
      emailServiceMock.sendEmail.mockResolvedValue(void 0);

      const _result = await service.create(dto as any, 'assoc-1');

      expect(userAssociationRepositoryMock.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retourne les utilisateurs d une association', async () => {
      const users = [{ id: 'ua-1', user: { name: 'User' } }];
      userAssociationRepositoryMock.find.mockResolvedValue(users);

      const _result = await service.findAll('assoc-1');

      expect(userAssociationRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('retourne une association utilisateur par id', async () => {
      const ua = { id: 'ua-1', user: { name: 'User' } };
      userAssociationRepositoryMock.findOne.mockResolvedValue(ua);

      const result = await service.findOne('ua-1', 'assoc-1');

      expect(result).toEqual(ua);
    });
  });

  describe('remove', () => {
    it('supprime un utilisateur d une association', async () => {
      const ua = { id: 'ua-1', role: { id: 'role-1', name: 'member' } };
      userAssociationRepositoryMock.findOne.mockResolvedValue(ua);
      userAssociationRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      await service.remove('ua-1', 'assoc-1');

      expect(userAssociationRepositoryMock.delete).toHaveBeenCalled();
    });
  });
});
