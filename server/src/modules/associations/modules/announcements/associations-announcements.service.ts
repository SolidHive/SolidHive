import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssociationAnnouncement } from './entities/association-announcement.entity';
import { CreateAssociationAnnouncementDto } from './dto/create-association-announcement.dto';
import { UserAssociation } from '../users/entities/user-association.entity';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateAssociationAnnouncementDto } from './dto/update-association-announcement.dto';
import { File } from '../../../files/entities/file.entity';

@Injectable()
export class AssociationsAnnouncementsService {
  constructor(
    @InjectRepository(AssociationAnnouncement)
    private readonly associationsAnnouncementsRepository: Repository<AssociationAnnouncement>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>
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
    const announcements = await this.associationsAnnouncementsRepository.find({
      ...options,
      where: { association: { id: associationId } },
      relations: ['createdBy', 'association'],
    });

    // Enrichir avec les images
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
    return this.associationsAnnouncementsRepository.delete({
      id,
      association: { id: associationId },
    });
  }
}
