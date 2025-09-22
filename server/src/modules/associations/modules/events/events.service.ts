import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(UserAssociation)
    private readonly usersAssociationsRepository: Repository<UserAssociation>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const userAssociation: UserAssociation | null =
      await this.usersAssociationsRepository.findOne({
        where: { id: createEventDto.userAssociationId },
        relations: ['association'],
      });

    if (!userAssociation) {
      throw new HttpException(
        'User association not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const event = this.eventsRepository.create({
      ...createEventDto,
      createdBy: userAssociation,
      association: userAssociation.association,
    });

    return this.eventsRepository.save(event);
  }

  findAll(options?: FindOptionsDto) {
    return this.eventsRepository.find(options);
  }

  findOne(id: string, options?: FindOptionsDto) {
    return this.eventsRepository.findOne({
      where: { id },
      ...options,
    });
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    await this.eventsRepository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.eventsRepository.delete(id);
  }
}
