import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventRegister } from './entities/event-register.entity';
import { User } from '../../../../../../modules/users/entities/user.entity';
import { CreateEventRegisterDto } from './dto/create-event-register.dto';
import { FindOptionsDto } from 'src/common/dto/find-all-query.dto';
import { EventPricing } from '../pricings/entities/event-pricing.entity';

@Injectable()
export class EventsRegistersService {
  constructor(
    @InjectRepository(EventRegister)
    private readonly eventsRegisterRepository: Repository<EventRegister>,
    @InjectRepository(EventPricing)
    private readonly eventsPricingRepository: Repository<EventPricing>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async create(createEventRegisterDto: CreateEventRegisterDto, userId?: string) {
    const user = userId ? await this.usersRepository.findOne({ where: { id: userId } }) : null;

    const eventPricing = await this.eventsPricingRepository.findOne({
      where: { id: createEventRegisterDto.eventPricingId },
    });

    if (!eventPricing) {
      throw new HttpException('Event pricing not found', HttpStatus.NOT_FOUND);
    }

    const eventRegister = this.eventsRegisterRepository.create({
      eventPricing,
      user,
    });

    return this.eventsRegisterRepository.save(eventRegister);
  }

  findAll(eventId: string, options?: FindOptionsDto) {
    return this.eventsRegisterRepository.find({
      ...options,
      where: { eventPricing: { event: { id: eventId } } },
    });
  }

  async findUserRegisters(eventId: string, userId: string) {
    const registers = await this.eventsRegisterRepository.find({
      where: {
        user: { id: userId },
        eventPricing: { event: { id: eventId } },
      },
      relations: ['eventPricing'],
    });

    return registers.map((register) => ({
      id: register.id,
      eventPricingId: register.eventPricing.id,
      registeredAt: register.registeredAt,
    }));
  }

  findOne(id: string, eventId: string, options?: FindOptionsDto) {
    return this.eventsRegisterRepository.findOne({
      ...options,
      where: { id, eventPricing: { event: { id: eventId } } },
    });
  }

  async remove(id: string, eventId: string) {
    return this.eventsRegisterRepository.delete({
      id,
      eventPricing: { event: { id: eventId } },
    });
  }
}
