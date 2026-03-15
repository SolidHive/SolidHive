import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AssociationsRolesService } from './associations-roles.service';
import { AssociationRole } from './entities/association-role.entity';
import { UserAssociation } from '../users/entities/user-association.entity';

describe('AssociationsRolesService', () => {
  let service: AssociationsRolesService;

  const associationRoleRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const userAssociationRepositoryMock = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociationsRolesService,
        { provide: getRepositoryToken(AssociationRole), useValue: associationRoleRepositoryMock },
        { provide: getRepositoryToken(UserAssociation), useValue: userAssociationRepositoryMock },
      ],
    }).compile();

    service = module.get<AssociationsRolesService>(AssociationsRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée un rôle d association', async () => {
      const dto = { name: 'Member', description: 'Membre' };
      const userAssociation = { id: 'ua-1', associationId: 'assoc-1' };
      const created = { ...dto, association: { id: 'assoc-1' }, createdBy: userAssociation };
      const saved = { id: 'role-1', ...created };

      associationRoleRepositoryMock.create.mockReturnValue(created);
      associationRoleRepositoryMock.save.mockResolvedValue(saved);

      const _result = await service.create(dto as any, userAssociation as any);

      expect(associationRoleRepositoryMock.save).toHaveBeenCalled();
      expect(_result).toEqual(saved);
    });
  });

  describe('findAll', () => {
    it('retourne tous les rôles', async () => {
      const roles = [{ id: 'role-1', name: 'Owner' }];
      associationRoleRepositoryMock.find.mockResolvedValue(roles);

      const _result = await service.findAll('assoc-1');

      expect(associationRoleRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('retourne un rôle par id', async () => {
      const role = { id: 'role-1', name: 'Owner' };
      associationRoleRepositoryMock.findOne.mockResolvedValue(role);

      const result = await service.findOne('role-1', 'assoc-1');

      expect(result).toEqual(role);
    });
  });

  describe('update', () => {
    it('met à jour un rôle', async () => {
      const updateDto = { description: 'Updated' };
      const updated = { id: 'role-1', name: 'Owner', ...updateDto };
      associationRoleRepositoryMock.update.mockResolvedValue({ affected: 1 });
      associationRoleRepositoryMock.findOne.mockResolvedValue(updated);

      await service.update('role-1', 'assoc-1', updateDto as any);

      expect(associationRoleRepositoryMock.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('supprime un rôle', async () => {
      userAssociationRepositoryMock.find.mockResolvedValue([]);
      associationRoleRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      await service.remove('role-1', 'assoc-1');

      expect(associationRoleRepositoryMock.delete).toHaveBeenCalled();
    });
  });
});
