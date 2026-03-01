import { Injectable } from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { Announcement } from './entities/announcement.entity';
import { Repository, Like } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { FindOptionsDto } from '../../../common/dto/find-all-query.dto';
import { FilesService } from '../../files/files.service';
import { File } from '../../files/entities/file.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementsRepository: Repository<Announcement>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly filesService: FilesService
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, userId: string) {
    const user: User | null = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const announcement = this.announcementsRepository.create({
      ...createAnnouncementDto,
      createdBy: user,
    });

    return this.announcementsRepository.save(announcement);
  }

  async findAll(options?: FindOptionsDto) {
    let whereConditions: any = { isActive: true };
    if (options?.where && typeof options.where === 'string') {
      // Recherche textuelle sur title
      const searchTerm = options.where;
      whereConditions = {
        title: Like(`%${searchTerm}%`),
        isActive: true,
      };
    } else if (options?.where) {
      whereConditions = { ...options.where, isActive: true };
    }

    return this.findAnnouncementsWithOptions(whereConditions, options);
  }

  async findAllForAdmin(options?: FindOptionsDto) {
    let whereConditions: any = {};
    if (options?.where && typeof options.where === 'string') {
      // Recherche textuelle sur title
      const searchTerm = options.where;
      whereConditions = {
        title: Like(`%${searchTerm}%`),
      };
    } else if (options?.where) {
      whereConditions = options.where;
    }

    return this.findAnnouncementsWithOptions(whereConditions, options);
  }

  private async findAnnouncementsWithOptions(whereConditions: any, options?: FindOptionsDto) {
    const findOptions: any = {
      where: whereConditions,
      relations: ['createdBy'],
    };

    if (options?.order) {
      findOptions.order = options.order;
    } else {
      findOptions.order = { timestamps: { createdAt: 'DESC' } };
    }

    if (options?.skip !== undefined) {
      findOptions.skip = options.skip;
    }

    if (options?.take !== undefined) {
      findOptions.take = options.take;
    }

    // Si pagination demandée, utiliser findAndCount
    if (options?.skip !== undefined || options?.take !== undefined) {
      const [announcements, total] = await this.announcementsRepository.findAndCount(findOptions);
      const enrichedData = await Promise.all(
        announcements.map(async (announcement) => {
          const imageFile = await this.fileRepository.findOne({
            where: {
              relatedTo: 'Announcement',
              relatedBy: announcement.id,
              purpose: 'image',
              index: 0,
            },
          });

          const imageUrl = imageFile
            ? `/files/Announcement/${announcement.id}?index=${imageFile.index}`
            : null;

          return {
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            isActive: announcement.isActive,
            image: imageUrl,
            timestamps: announcement.timestamps,
            createdBy: announcement.createdBy,
          };
        })
      );
      return {
        data: enrichedData,
        meta: {
          total,
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(total / (options.take || 10)),
        },
      };
    } else {
      // Sinon, retourner tous les résultats
      const announcements = await this.announcementsRepository.find(findOptions);
      const enrichedAnnouncements = await Promise.all(
        announcements.map(async (announcement) => {
          const imageFile = await this.fileRepository.findOne({
            where: {
              relatedTo: 'Announcement',
              relatedBy: announcement.id,
              purpose: 'image',
              index: 0,
            },
          });

          const imageUrl = imageFile
            ? `/files/Announcement/${announcement.id}?index=${imageFile.index}`
            : null;

          return {
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            isActive: announcement.isActive,
            image: imageUrl,
            timestamps: announcement.timestamps,
            createdBy: announcement.createdBy,
          };
        })
      );
      return enrichedAnnouncements;
    }
  }

  async findOne(id: string, options?: FindOptionsDto) {
    const announcement = await this.announcementsRepository.findOne({
      where: { id },
      relations: ['createdBy'],
      ...options,
    });

    if (!announcement) {
      return null;
    }

    // Enrichir avec l'image
    const imageFile = await this.fileRepository.findOne({
      where: {
        relatedTo: 'Announcement',
        relatedBy: announcement.id,
        purpose: 'image',
        index: 0,
      },
    });

    const imageUrl = imageFile
      ? `/files/Announcement/${announcement.id}?index=${imageFile.index}`
      : null;

    return {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      isActive: announcement.isActive,
      image: imageUrl,
      timestamps: announcement.timestamps,
      createdBy: announcement.createdBy,
    };
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto) {
    await this.announcementsRepository.update(id, updateAnnouncementDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    // Supprimer les fichiers associés avant de supprimer l'annonce
    try {
      await this.filesService.remove('Announcement', id, 0, 'image');
    } catch (error) {
      console.error(`Erreur lors de la suppression des fichiers de l'annonce ${id}:`, error);
    }

    return this.announcementsRepository.delete(id);
  }
}
