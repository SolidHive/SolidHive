import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AssociationsAnnouncementsService } from './associations-announcements.service';
import { AssociationAnnouncement } from './entities/association-announcement.entity';
import { File } from '../../../files/entities/file.entity';
import { FilesService } from '../../../files/files.service';

describe('AssociationsAnnouncementsService', () => {
  let service: AssociationsAnnouncementsService;

  const announcementsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
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
        AssociationsAnnouncementsService,
        {
          provide: getRepositoryToken(AssociationAnnouncement),
          useValue: announcementsRepositoryMock,
        },
        { provide: getRepositoryToken(File), useValue: fileRepositoryMock },
        { provide: FilesService, useValue: filesServiceMock },
      ],
    }).compile();

    service = module.get<AssociationsAnnouncementsService>(AssociationsAnnouncementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée une annonce d association', async () => {
      const dto = { title: 'Annonce', content: 'Contenu' };
      const userAssociation = { id: 'ua-1', associationId: 'assoc-1' };
      const created = { ...dto, createdBy: userAssociation };
      const saved = { id: 'ann-1', ...created };

      announcementsRepositoryMock.create.mockReturnValue(created);
      announcementsRepositoryMock.save.mockResolvedValue(saved);

      const result = await service.create(dto as any, userAssociation as any);

      expect(announcementsRepositoryMock.save).toHaveBeenCalled();
      expect(result.id).toEqual('ann-1');
    });
  });

  describe('findAll', () => {
    it('retourne les annonces', async () => {
      const announcements = [{ id: 'ann-1', title: 'Annonce' }];
      announcementsRepositoryMock.find.mockResolvedValue(announcements);

      const _result = await service.findAll('assoc-1');

      expect(announcementsRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('retourne une annonce par id', async () => {
      const announcement = { id: 'ann-1', title: 'Annonce' };
      announcementsRepositoryMock.findOne.mockResolvedValue(announcement);
      fileRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.findOne('assoc-1', 'ann-1');

      expect(announcementsRepositoryMock.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result?.id).toBe('ann-1');
    });
  });

  describe('update', () => {
    it('met à jour une annonce', async () => {
      const updateDto = { title: 'Updated' };
      const updated = { id: 'ann-1', ...updateDto };
      announcementsRepositoryMock.update.mockResolvedValue({ affected: 1 });
      announcementsRepositoryMock.findOne.mockResolvedValue(updated);

      const _result = await service.update('assoc-1', 'ann-1', updateDto as any);

      expect(announcementsRepositoryMock.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('supprime une annonce', async () => {
      filesServiceMock.remove.mockResolvedValue(void 0);
      announcementsRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      await service.remove('assoc-1', 'ann-1');

      expect(announcementsRepositoryMock.delete).toHaveBeenCalled();
    });
  });
});
