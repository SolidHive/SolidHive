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

  async create(createEventPricingDto: CreateEventPricingDto) {
    const event: Event | null = await this.eventsRepository.findOne({
      where: { id: createEventPricingDto.eventId },
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

  findAll(options?: FindOptionsDto) {
    return this.eventsPricingsRepository.find(options);
  }

  findOne(id: string, options?: FindOptionsDto) {
    return this.eventsPricingsRepository.findOne({
      where: { id },
      ...options,
    });
  }

  async update(id: string, updateEventPricingDto: UpdateEventPricingDto) {
    await this.eventsPricingsRepository.update(id, updateEventPricingDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.eventsPricingsRepository.delete(id);
  }
}
