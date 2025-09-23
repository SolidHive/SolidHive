import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventPricing } from './entities/event-pricing.entity';
import { CreateEventPricingDto } from './dto/create-event-pricing.dto';
import { Event } from '../../entities/event.entity';
import { FindOptionsDto } from '../../../../../../common/dto/find-all-query.dto';
import { UpdateEventPricingDto } from './dto/update-event-pricing.dto';

@Injectable()
export class EventsPricingsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventPricing)
    private readonly eventsPricingsRepository: Repository<EventPricing>,
  ) {}

  async create(createEventPricingDto: CreateEventPricingDto, eventId: string) {
    const event: Event | null = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    const eventPricing = this.eventsPricingsRepository.create({
      ...createEventPricingDto,
      event,
    });

    return this.eventsPricingsRepository.save(eventPricing);
  }

  findAll(eventId: string, options?: FindOptionsDto) {
    return this.eventsPricingsRepository.find({
      ...options,
      where: { event: { id: eventId } },
    });
  }

  findOne(id: string, eventId: string, options?: FindOptionsDto) {
    return this.eventsPricingsRepository.findOne({
      ...options,
      where: { id, event: { id: eventId } },
    });
  }

  async update(
    id: string,
    eventId: string,
    updateEventPricingDto: UpdateEventPricingDto,
  ) {
    await this.eventsPricingsRepository.update(id, updateEventPricingDto);
    return this.findOne(id, eventId);
  }

  async remove(id: string, eventId: string) {
    return this.eventsPricingsRepository.delete({ id, event: { id: eventId } });
  }
}
