import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssociationAnnouncement } from './entities/association-announcement.entity';
import { CreateAssociationAnnouncementDto } from './dto/create-association-announcement.dto';
import { UserAssociation } from '../users/entities/user-association.entity';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateAssociationAnnouncementDto } from './dto/update-association-announcement.dto';

@Injectable()
export class AssociationsAnnouncementsService {
  constructor(
    @InjectRepository(AssociationAnnouncement)
    private readonly associationsAnnouncementsRepository: Repository<AssociationAnnouncement>,
  ) {}

  async create(
    createAssociationAnnouncementDto: CreateAssociationAnnouncementDto,
    userAssociation: UserAssociation,
  ) {
    const announcement = this.associationsAnnouncementsRepository.create({
      ...createAssociationAnnouncementDto,
      createdBy: userAssociation,
      association: userAssociation.association,
    });

    return this.associationsAnnouncementsRepository.save(announcement);
  }

  findAll(associationId: string, options?: FindOptionsDto) {
    return this.associationsAnnouncementsRepository.find({
      ...options,
      where: { association: { id: associationId } },
    });
  }

  findOne(id: string, associationId: string, options?: FindOptionsDto) {
    return this.associationsAnnouncementsRepository.findOne({
      ...options,
      where: { id, association: { id: associationId } },
    });
  }

  async update(
    id: string,
    associationId: string,
    updateAssociationAnnouncementDto: UpdateAssociationAnnouncementDto,
  ) {
    await this.associationsAnnouncementsRepository.update(
      id,
      updateAssociationAnnouncementDto,
    );
    return this.findOne(id, associationId);
  }

  async remove(id: string, associationId: string) {
    return this.associationsAnnouncementsRepository.delete({
      id,
      association: { id: associationId },
    });
  }
}
