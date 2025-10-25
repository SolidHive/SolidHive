import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventsDto } from './dto/filter-events.dto';
import { File } from '../../../files/entities/file.entity';
import { Like, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>
  ) {}

  async create(createEventDto: CreateEventDto, userAssociation: UserAssociation) {
    const event = this.eventsRepository.create({
      ...createEventDto,
      createdBy: userAssociation,
      association: { id: userAssociation.associationId },
    });

    return this.eventsRepository.save(event);
  }

  async findAll(associationId?: string, options?: FindOptionsDto, filters?: FilterEventsDto) {
    const whereClause: any = associationId
      ? { association: { id: associationId }, ...(options?.where || {}) }
      : options?.where || {};

    // Ajoute les filtres de recherche
    if (filters?.search) {
      whereClause.title = Like(`%${filters.search}%`);
    }

    if (filters?.isPaid !== undefined) {
      if (filters.isPaid) {
        // Événements payants (amount > 0)
        whereClause.amount = MoreThanOrEqual(0.01);
      } else {
        // Événements gratuits (amount = 0 ou null)
        whereClause.amount = 0;
      }
    }

    if (filters?.startDate) {
      whereClause.startDate = MoreThanOrEqual(new Date(filters.startDate));
    }

    if (filters?.endDate) {
      whereClause.endDate = LessThanOrEqual(new Date(filters.endDate));
    }

    // Compter le total d'événements (sans pagination)
    const total = await this.eventsRepository.count({
      where: whereClause,
    });

    const events = await this.eventsRepository.find({
      ...options,
      where: whereClause,
      relations: ['createdBy', 'association'],
      order: options?.order || { startDate: 'DESC' },
    });

    // Enrichir avec les images
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const imageFile = await this.fileRepository.findOne({
          where: {
            relatedTo: 'Event',
            relatedBy: event.id,
            purpose: 'image',
            index: 0,
          },
        });

        const imageUrl = imageFile ? `/files/Event/${event.id}?index=${imageFile.index}` : null; // Pas d'image par défaut, sera géré côté frontend

        return {
          ...event,
          image: imageUrl,
        };
      })
    );

    return {
      data: enrichedEvents,
      meta: {
        total,
        page: options?.skip ? Math.floor(options.skip / (options.take || 10)) + 1 : 1,
        limit: options?.take || 10,
        totalPages: Math.ceil(total / (options?.take || 10)),
      },
    };
  }

  findOne(id: string, associationId: string, options?: FindOptionsDto) {
    return this.eventsRepository.findOne({
      ...options,
      where: { id, association: { id: associationId } },
    });
  }

  async update(id: string, associationId: string, updateEventDto: UpdateEventDto) {
    await this.eventsRepository.update(id, updateEventDto);
    return this.findOne(id, associationId);
  }

  async remove(id: string, associationId: string) {
    return this.eventsRepository.delete({
      id,
      association: { id: associationId },
    });
  }
}
