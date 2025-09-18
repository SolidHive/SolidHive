import { Injectable } from '@nestjs/common';

@Injectable()
export class FundraisingsService {
  create() {
    return 'This action adds a new fundraising';
  }

  findAll() {
    return `This action returns all fundraisings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fundraising`;
  }

  update(id: number) {
    return `This action updates a #${id} fundraising`;
  }

  remove(id: number) {
    return `This action removes a #${id} fundraising`;
  }
}
