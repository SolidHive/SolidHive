import { Injectable } from '@nestjs/common';

@Injectable()
export class AssociationsAnnouncementsService {
  create() {
    return 'This action adds a new associationsAnnouncement';
  }

  findAll() {
    return `This action returns all associationsAnnouncements`;
  }

  findOne(id: number) {
    return `This action returns a #${id} associationsAnnouncement`;
  }

  update(id: number) {
    return `This action updates a #${id} associationsAnnouncement`;
  }

  remove(id: number) {
    return `This action removes a #${id} associationsAnnouncement`;
  }
}
