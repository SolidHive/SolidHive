import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { File } from '../../../files/entities/file.entity';

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

  async findAll(associationId: string, options?: FindOptionsDto) {
    const events = await this.eventsRepository.find({
      ...options,
      where: { association: { id: associationId } },
      relations: ['createdBy', 'association'],
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

    return enrichedEvents;
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
