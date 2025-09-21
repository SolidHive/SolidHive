import { Injectable } from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { Announcement } from './entities/announcement.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementsRepository: Repository<Announcement>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, userId: string) {
    const user: User | null = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const announcement = this.announcementsRepository.create({
      ...createAnnouncementDto,
      createdBy: user,
    });

    return this.announcementsRepository.save(announcement);
  }

  findAll(options?: FindOptionsDto) {
    return this.announcementsRepository.find(options);
  }

  findOne(id: string, options?: FindOptionsDto) {
    return this.announcementsRepository.findOne({
      where: { id },
      ...options,
    });
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto) {
    await this.announcementsRepository.update(id, updateAnnouncementDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.announcementsRepository.delete(id);
  }
}
