import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionAccessService } from './permission-access.service';
import { PermissionAccess } from './entities/permission-access.entity';

describe('PermissionAccessService', () => {
  let service: PermissionAccessService;

  const permissionAccessRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionAccessService,
        { provide: getRepositoryToken(PermissionAccess), useValue: permissionAccessRepositoryMock },
      ],
    }).compile();

    service = module.get<PermissionAccessService>(PermissionAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('create enregistre une nouvelle permission', async () => {
      const dto = { permission: 'users.create', description: 'Create users' };
      const created = { id: 'perm-1', ...dto };

      permissionAccessRepositoryMock.create.mockReturnValue(dto);
      permissionAccessRepositoryMock.save.mockResolvedValue(created);

      const _result = await service.create(dto as any);

      expect(permissionAccessRepositoryMock.create).toHaveBeenCalledWith(dto);
      expect(permissionAccessRepositoryMock.save).toHaveBeenCalledWith(dto);
      expect(_result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('findAll retourne toutes les permissions sans pagination', async () => {
      const permissions = [
        { id: 'perm-1', permission: 'users.create' },
        { id: 'perm-2', permission: 'users.delete' },
      ];
      permissionAccessRepositoryMock.find.mockResolvedValue(permissions);

      const result = await service.findAll();

      expect(permissionAccessRepositoryMock.find).toHaveBeenCalledWith({});
      expect(result).toEqual(permissions);
    });

    it('findAll retourne permissions avec pagination', async () => {
      const permissions = [{ id: 'perm-1', permission: 'users.create' }];
      permissionAccessRepositoryMock.findAndCount.mockResolvedValue([permissions, 5]);

      const result = (await service.findAll({ skip: 0, take: 1 })) as any;

      expect(permissionAccessRepositoryMock.findAndCount).toHaveBeenCalled();
      expect(result.meta).toEqual({ total: 5, page: 1, limit: 1, totalPages: 5 });
      expect(result.data).toEqual(permissions);
    });

    it('findAll filtre par condition where', async () => {
      const permissions = [{ id: 'perm-1', permission: 'users.create' }];
      const where = { permission: 'users.create' };
      permissionAccessRepositoryMock.find.mockResolvedValue(permissions);

      const result = await service.findAll({ where });

      expect(permissionAccessRepositoryMock.find).toHaveBeenCalledWith({
        where: where,
      });
      expect(result).toEqual(permissions);
    });
  });

  describe('findOne', () => {
    it('findOne retourne permission par permission string', async () => {
      const permission = { id: 'perm-1', permission: 'users.create' };
      permissionAccessRepositoryMock.findOne.mockResolvedValue(permission);

      const result = await service.findOne('users.create');

      expect(permissionAccessRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { permission: 'users.create' },
      });
      expect(result).toEqual(permission);
    });
  });

  describe('update', () => {
    it('update modifie une permission et retourne la version mise à jour', async () => {
      const updateDto = { description: 'Updated description' };
      const updated = { id: 'perm-1', permission: 'users.create', ...updateDto };

      permissionAccessRepositoryMock.update.mockResolvedValue({ affected: 1 });
      permissionAccessRepositoryMock.findOne.mockResolvedValue(updated);

      const result = await service.update('perm-1', updateDto as any);

      expect(permissionAccessRepositoryMock.update).toHaveBeenCalledWith('perm-1', updateDto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('remove supprime une permission', async () => {
      permissionAccessRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      const _result = await service.remove('perm-1');

      expect(permissionAccessRepositoryMock.delete).toHaveBeenCalledWith('perm-1');
    });
  });
});
