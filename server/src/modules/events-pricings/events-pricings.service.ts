import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsPricingsService {
  create() {
    return 'This action adds a new eventsPricing';
  }

  findAll() {
    return `This action returns all eventsPricings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventsPricing`;
  }

  update(id: number) {
    return `This action updates a #${id} eventsPricing`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventsPricing`;
  }
}
