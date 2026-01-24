import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AssociationAnnouncement } from './entities/association-announcement.entity';
import { CreateAssociationAnnouncementDto } from './dto/create-association-announcement.dto';
import { UserAssociation } from '../users/entities/user-association.entity';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateAssociationAnnouncementDto } from './dto/update-association-announcement.dto';
import { File } from '../../../files/entities/file.entity';
import { FilesService } from '../../../files/files.service';

@Injectable()
export class AssociationsAnnouncementsService {
  constructor(
    @InjectRepository(AssociationAnnouncement)
    private readonly associationsAnnouncementsRepository: Repository<AssociationAnnouncement>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly filesService: FilesService
  ) {}

  async create(
    createAssociationAnnouncementDto: CreateAssociationAnnouncementDto,
    userAssociation: UserAssociation
  ) {
    const announcement = this.associationsAnnouncementsRepository.create({
      ...createAssociationAnnouncementDto,
      createdBy: userAssociation,
      association: { id: userAssociation.associationId },
    });

    return this.associationsAnnouncementsRepository.save(announcement);
  }

  async findAll(associationId: string, options?: FindOptionsDto) {
    let whereConditions: any = { association: { id: associationId } };
    if (options?.where && typeof options.where === 'string') {
      // Recherche textuelle sur title
      const searchTerm = options.where;
      whereConditions = {
        ...whereConditions,
        title: Like(`%${searchTerm}%`),
      };
    } else if (options?.where) {
      whereConditions = { ...options.where, ...whereConditions };
    }

    const findOptions: any = {
      where: whereConditions,
      relations: ['createdBy', 'association'],
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
      const [announcements, total] =
        await this.associationsAnnouncementsRepository.findAndCount(findOptions);
      const enrichedData = await Promise.all(
        announcements.map(async (announcement) => {
          const imageFile = await this.fileRepository.findOne({
            where: {
              relatedTo: 'AssociationAnnouncement',
              relatedBy: announcement.id,
              purpose: 'image',
              index: 0,
            },
          });

          const imageUrl = imageFile
            ? `/files/AssociationAnnouncement/${announcement.id}?index=${imageFile.index}`
            : null;

          return {
            ...announcement,
            image: imageUrl,
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
      const announcements = await this.associationsAnnouncementsRepository.find(findOptions);
      const enrichedAnnouncements = await Promise.all(
        announcements.map(async (announcement) => {
          const imageFile = await this.fileRepository.findOne({
            where: {
              relatedTo: 'AssociationAnnouncement',
              relatedBy: announcement.id,
              purpose: 'image',
              index: 0,
            },
          });

          const imageUrl = imageFile
            ? `/files/AssociationAnnouncement/${announcement.id}?index=${imageFile.index}`
            : null;

          return {
            ...announcement,
            image: imageUrl,
          };
        })
      );
      return enrichedAnnouncements;
    }
  }

  async findOne(id: string, associationId: string, options?: FindOptionsDto) {
    const announcement = await this.associationsAnnouncementsRepository.findOne({
      ...options,
      where: { id, association: { id: associationId } },
    });

    if (!announcement) {
      return null;
    }

    // Enrichir avec l'image
    const imageFile = await this.fileRepository.findOne({
      where: {
        relatedTo: 'AssociationAnnouncement',
        relatedBy: announcement.id,
        purpose: 'image',
        index: 0,
      },
    });

    const imageUrl = imageFile
      ? `/files/AssociationAnnouncement/${announcement.id}?index=${imageFile.index}`
      : null;

    return {
      ...announcement,
      image: imageUrl,
    };
  }

  async update(
    id: string,
    associationId: string,
    updateAssociationAnnouncementDto: UpdateAssociationAnnouncementDto
  ) {
    await this.associationsAnnouncementsRepository.update(id, updateAssociationAnnouncementDto);
    return this.findOne(id, associationId);
  }

  async remove(id: string, associationId: string) {
    // Supprimer les fichiers associés avant de supprimer l'annonce
    try {
      await this.filesService.remove('AssociationAnnouncement', id, 0, 'image');
    } catch (error) {
      console.error(`Erreur lors de la suppression des fichiers de l'annonce ${id}:`, error);
    }

    return this.associationsAnnouncementsRepository.delete({
      id,
      association: { id: associationId },
    });
  }
}
