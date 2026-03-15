import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from './entities/announcement.entity';
import { User } from '../../users/entities/user.entity';
import { File } from '../../files/entities/file.entity';
import { FilesService } from '../../files/files.service';
import { NewsletterService } from '../../newsletter/newsletter.service';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;

  const announcementsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const usersRepositoryMock = {
    findOne: jest.fn(),
  };

  const fileRepositoryMock = {
    findOne: jest.fn(),
  };

  const filesServiceMock = {
    remove: jest.fn(),
  };

  const newsletterServiceMock = {
    notifyAnnouncement: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: getRepositoryToken(Announcement), useValue: announcementsRepositoryMock },
        { provide: getRepositoryToken(User), useValue: usersRepositoryMock },
        { provide: getRepositoryToken(File), useValue: fileRepositoryMock },
        { provide: FilesService, useValue: filesServiceMock },
        { provide: NewsletterService, useValue: newsletterServiceMock },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crée une annonce quand l utilisateur existe', async () => {
      const dto = { title: 'Annonce Test', content: 'Contenu test' };
      const user = { id: 'user-1', email: 'test@test.com' };
      const created = { ...dto, createdBy: user };
      const saved = { id: 'ann-1', ...created };

      usersRepositoryMock.findOne.mockResolvedValue(user);
      announcementsRepositoryMock.create.mockReturnValue(created);
      announcementsRepositoryMock.save.mockResolvedValue(saved);
      newsletterServiceMock.notifyAnnouncement.mockResolvedValue(void 0);

      const result = await service.create(dto as any, 'user-1');

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(announcementsRepositoryMock.create).toHaveBeenCalledWith({ ...dto, createdBy: user });
      expect(announcementsRepositoryMock.save).toHaveBeenCalledWith(created);
      expect(newsletterServiceMock.notifyAnnouncement).toHaveBeenCalled();
      expect(result).toEqual(saved);
    });

    it('lève une erreur quand utilisateur n existe pas', async () => {
      const dto = { title: 'Test', content: 'Test' };
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.create(dto as any, 'missing')).rejects.toThrow('User not found');
    });
  });

  describe('findAll', () => {
    it('retourne les annonces actives sans pagination', async () => {
      const announcements = [
        {
          id: 'ann-1',
          title: 'Test',
          isActive: true,
          content: 'Content',
          createdBy: { id: 'user-1' },
          timestamps: { createdAt: new Date() },
          image: null,
        },
      ];
      announcementsRepositoryMock.find.mockResolvedValue(announcements);
      fileRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.findAll();

      expect(announcementsRepositoryMock.find).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('ann-1');
      }
    });

    it('retourne les annonces avec pagination', async () => {
      const announcements = [
        {
          id: 'ann-1',
          title: 'Test',
          isActive: true,
          content: 'Content',
          createdBy: { id: 'user-1' },
          timestamps: { createdAt: new Date() },
        },
      ];
      announcementsRepositoryMock.findAndCount.mockResolvedValue([announcements, 5]);
      fileRepositoryMock.findOne.mockResolvedValue(null);

      const result = (await service.findAll({ skip: 0, take: 1 })) as any;

      expect(result.meta).toEqual({ total: 5, page: 1, limit: 1, totalPages: 5 });
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('ann-1');
    });

    it('filtre par recherche textuelle sur title', async () => {
      const announcements = [{ id: 'ann-1', title: 'Test Search' }];
      announcementsRepositoryMock.find.mockResolvedValue(announcements);

      await service.findAll({ where: { title: 'Search' } } as any);

      expect(announcementsRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('retourne une annonce par id', async () => {
      const announcement = {
        id: 'ann-1',
        title: 'Test',
        content: 'Content',
        createdBy: { id: 'user-1' },
        timestamps: { createdAt: new Date() },
        isActive: true,
      };
      announcementsRepositoryMock.findOne.mockResolvedValue(announcement);
      fileRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.findOne('ann-1');

      expect(announcementsRepositoryMock.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ann-1' } })
      );
      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toBe('ann-1');
      }
    });
  });

  describe('update', () => {
    it('met à jour une annonce', async () => {
      const updateDto = { title: 'Updated' };
      const updated = { id: 'ann-1', title: 'Updated', isActive: true };
      announcementsRepositoryMock.update.mockResolvedValue({ affected: 1 });
      announcementsRepositoryMock.findOne.mockResolvedValue(updated);
      fileRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.update('ann-1', updateDto as any);

      expect(announcementsRepositoryMock.update).toHaveBeenCalledWith('ann-1', updateDto);
      expect(announcementsRepositoryMock.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toEqual('ann-1');
      }
    });
  });

  describe('remove', () => {
    it('supprime une annonce et ses fichiers', async () => {
      announcementsRepositoryMock.delete.mockResolvedValue({ affected: 1 });
      filesServiceMock.remove.mockResolvedValue(void 0);

      await service.remove('ann-1');

      expect(filesServiceMock.remove).toHaveBeenCalledWith(
        'Announcement',
        'ann-1',
        expect.any(Number),
        'image'
      );
      expect(announcementsRepositoryMock.delete).toHaveBeenCalledWith('ann-1');
    });
  });
});
