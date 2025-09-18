import { Injectable } from '@nestjs/common';

@Injectable()
export class AssociationsService {
  create() {
    return 'This action adds a new association';
  }

  findAll() {
    return `This action returns all associations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} association`;
  }

  update(id: number) {
    return `This action updates a #${id} association`;
  }

  remove(id: number) {
    return `This action removes a #${id} association`;
  }
}
