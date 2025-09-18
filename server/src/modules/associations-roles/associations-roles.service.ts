import { Injectable } from '@nestjs/common';

@Injectable()
export class AssociationsRolesService {
  create() {
    return 'This action adds a new associationsRole';
  }

  findAll() {
    return `This action returns all associationsRoles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} associationsRole`;
  }

  update(id: number) {
    return `This action updates a #${id} associationsRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} associationsRole`;
  }
}
