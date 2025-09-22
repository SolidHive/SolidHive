import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    @InjectRepository(UserAssociation)
    private readonly userAssociationsRepository: Repository<UserAssociation>,
    @InjectRepository(AssociationAnnouncement)
    private readonly associationsAnnouncementsRepository: Repository<AssociationAnnouncement>,
  ) {}

  async create(
    createAssociationAnnouncementDto: CreateAssociationAnnouncementDto,
  ) {
    const userAssociation: UserAssociation | null =
      await this.userAssociationsRepository.findOne({
        where: { id: createAssociationAnnouncementDto.userAssociationId },
        relations: ['association'],
      });

    if (!userAssociation) {
      throw new HttpException(
        'User association not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const announcement = this.associationsAnnouncementsRepository.create({
      ...createAssociationAnnouncementDto,
      createdBy: userAssociation,
      association: userAssociation.association,
    });

    return this.associationsAnnouncementsRepository.save(announcement);
  }

  findAll(options?: FindOptionsDto) {
    return this.associationsAnnouncementsRepository.find(options);
  }

  findOne(id: string, options?: FindOptionsDto) {
    return this.associationsAnnouncementsRepository.findOne({
      ...options,
      where: { id },
    });
  }

  async update(
    id: string,
    updateAssociationAnnouncementDto: UpdateAssociationAnnouncementDto,
  ) {
    await this.associationsAnnouncementsRepository.update(
      id,
      updateAssociationAnnouncementDto,
    );
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.associationsAnnouncementsRepository.delete(id);
  }
}
