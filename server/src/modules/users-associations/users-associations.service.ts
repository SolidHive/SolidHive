import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersAssociationsService {
  create() {
    return 'This action adds a new usersAssociation';
  }

  findAll() {
    return `This action returns all usersAssociations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usersAssociation`;
  }

  update(id: number) {
    return `This action updates a #${id} usersAssociation`;
  }

  remove(id: number) {
    return `This action removes a #${id} usersAssociation`;
  }
}
