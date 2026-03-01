import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { Repository, In } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { File } from '../../../files/entities/file.entity';
import { EventPricing } from './modules/pricings/entities/event-pricing.entity';
import { EventRegister } from './modules/registers/entities/event-register.entity';
import { FilesService } from '../../../files/files.service';
import { Like, Between, IsNull } from 'typeorm';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(EventPricing)
    private readonly eventPricingRepository: Repository<EventPricing>,
    @InjectRepository(EventRegister)
    private readonly eventRegisterRepository: Repository<EventRegister>,
    private readonly filesService: FilesService
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
      return {
        data: enrichedData,
        meta: {
          total: result[1],
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(result[1] / (options.take || 10)),
        },
      };
    }

    const events = await this.eventsRepository.find({
      where,
      relations,
      order,
    });

    return this.enrichWithImages(events);
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
      relations: ['createdBy', 'association', 'pricings'],
    };

    if (options?.order) {
      findOptions.order = options.order;
    } else {
      findOptions.order = { startDate: 'DESC' };
    }

    if (options?.skip !== undefined) {
      findOptions.skip = options.skip;
    }

    if (options?.take !== undefined) {
      findOptions.take = options.take;
    } else {
      findOptions.take = 5; // Valeur par défaut de 5 événements par page
    }

    // Si pagination demandée, utiliser findAndCount
    if (options?.skip !== undefined || options?.take !== undefined) {
      const [events, total] = await this.eventsRepository.findAndCount(findOptions);
      const enrichedData = await Promise.all(
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
      const events = await this.eventsRepository.find(findOptions);
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

          const imageUrl = imageFile ? `/files/Event/${event.id}?index=${imageFile.index}` : null;

          return {
            ...event,
            image: imageUrl,
          };
        })
      );
      return enrichedEvents;
    }
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
    // Récupérer l'événement pour vérifier sa date
    const event = await this.eventsRepository.findOne({
      where: { id, association: { id: associationId } },
    });

    if (!event) {
      throw new HttpException('Événement non trouvé', HttpStatus.NOT_FOUND);
    }

    // Compter les inscriptions actives (non annulées) liées à l'événement
    const activeRegistrationsCount = await this.eventRegisterRepository.count({
      where: {
        eventPricing: { event: { id } },
        cancelledAt: IsNull(), // Uniquement les inscriptions non annulées
      },
    });

    // Vérifier si l'événement est passé (date de fin dépassée ou date de début dépassée si pas de date de fin)
    const eventDate = event.endDate || event.startDate;
    const now = new Date();

    // Si l'événement a des inscriptions actives, vérifier qu'il est passé
    if (activeRegistrationsCount > 0 && eventDate > now) {
      throw new HttpException(
        "Impossible de supprimer un événement qui n'est pas encore passé et qui a des inscriptions actives.",
        HttpStatus.BAD_REQUEST
      );
    }

    // Supprimer les inscriptions liées aux tarifs de l'événement
    const pricings = await this.eventPricingRepository.find({
      where: { event: { id } },
      select: ['id'],
    });

    const pricingIds = pricings.map((p) => p.id);

    if (pricingIds.length > 0) {
      await this.eventRegisterRepository.delete({ eventPricing: { id: In(pricingIds) } });
    }

    // Supprimer les tarifs
    await this.eventPricingRepository.delete({ event: { id } });

    try {
      await this.filesService.remove('Event', id, 0, 'image');
    } catch (error) {
      console.error(`Erreur lors de la suppression des fichiers de l'événement ${id}:`, error);
    }

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
