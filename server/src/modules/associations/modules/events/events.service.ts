import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { File } from '../../../files/entities/file.entity';
import { Like, Between } from 'typeorm';

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

  async findAllGlobal(
    options?: FindOptionsDto & {
      association?: string;
      date?: string;
    }
  ) {
    const where: any = {};

    if (options?.name) {
      where.title = Like(`%${options.name}%`);
    }

    if (options?.association) {
      where.association = { name: Like(`%${options.association}%`) };
    }

    if (options?.date) {
      const filterDate = new Date(options.date);
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.startDate = Between(startOfDay, endOfDay);
    }

    let order: any = options?.order;
    if (options?.orderBy) {
      order = { startDate: options.orderBy };
    }

    const relations = ['association', 'createdBy'];

    if (options?.take) {
      const result = await this.eventsRepository.findAndCount({
        where,
        relations,
        order,
        skip: options.skip,
        take: options.take,
      });

      const enrichedData = await this.enrichWithImages(result[0]);
      return { data: enrichedData, total: result[1] };
    }

    const events = await this.eventsRepository.find({
      where,
      relations,
      order,
    });

    return this.enrichWithImages(events);
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

  async findOne(id: string, associationId: string, options?: FindOptionsDto) {
    const event = await this.eventsRepository.findOne({
      ...options,
      where: { id, association: { id: associationId } },
      relations: ['association', 'createdBy', 'pricings', 'pricings.registers'],
    });

    if (!event) {
      return null;
    }

    // Enrichir avec l'image
    const imageFile = await this.fileRepository.findOne({
      where: {
        relatedTo: 'Event',
        relatedBy: event.id,
        purpose: 'image',
        index: 0,
      },
    });

    const imageUrl = imageFile ? `/files/Event/${event.id}?index=${imageFile.index}` : null;

    // Calculate available capacity for each pricing
    const enrichedPricings = event.pricings?.map((pricing) => {
      const registeredCount = pricing.registers?.length || 0;
      const availableCapacity = pricing.maxCapacity ? pricing.maxCapacity - registeredCount : null;

      // Return pricing with calculated available capacity, without the registers array
      const { registers: _registers, ...pricingData } = pricing;
      return {
        ...pricingData,
        availableCapacity,
      };
    });

    return {
      ...event,
      pricings: enrichedPricings,
      image: imageUrl,
    };
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

  private async enrichWithImages(events: Event[]) {
    return Promise.all(
      events.map(async (event) => {
        const imageFile = await this.fileRepository.findOne({
          where: {
            relatedTo: 'Event',
            relatedBy: event.id,
            purpose: 'image',
            index: 0,
          },
        });

        const imageUrl = imageFile ? `/files/Event/${event.id}?index=${imageFile.index}` : null;

        return {
          ...event,
          image: imageUrl,
        };
      })
    );
  }
}
