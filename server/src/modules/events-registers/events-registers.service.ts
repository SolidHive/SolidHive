import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsRegistersService {
  create() {
    return 'This action adds a new eventsRegister';
  }

  findAll() {
    return `This action returns all eventsRegisters`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventsRegister`;
  }

  update(id: number) {
    return `This action updates a #${id} eventsRegister`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventsRegister`;
  }
}
