import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users-associations/entities/user-association.entity';
import { Repository } from 'typeorm';
import { Fundraising } from './entities/fundraising.entity';
import { CreateFundraisingDto } from './dto/create-fundraising.dto';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';
import { UpdateFundraisingDto } from './dto/update-fundraising.dto';

@Injectable()
export class FundraisingsService {
  constructor(
    @InjectRepository(UserAssociation)
    private readonly usersAssociationsRepository: Repository<UserAssociation>,
    @InjectRepository(Fundraising)
    private readonly fundraisingsRepository: Repository<Fundraising>,
  ) {}

  async create(createFundraisingDto: CreateFundraisingDto) {
    const userAssociation: UserAssociation | null =
      await this.usersAssociationsRepository.findOne({
        where: { id: createFundraisingDto.userAssociationId },
        relations: ['association'],
      });

    if (!userAssociation) {
      throw new HttpException(
        'User association not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const fundraising = this.fundraisingsRepository.create({
      ...createFundraisingDto,
      createdBy: userAssociation,
      association: userAssociation.association,
    });

    return this.fundraisingsRepository.save(fundraising);
  }

  findAll(options?: FindOptionsDto) {
    return this.fundraisingsRepository.find(options);
  }

  findOne(id: string, options?: FindOptionsDto) {
    return this.fundraisingsRepository.findOne({ where: { id }, ...options });
  }

  async update(id: string, updateFundraisingDto: UpdateFundraisingDto) {
    await this.fundraisingsRepository.update(id, updateFundraisingDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.fundraisingsRepository.delete(id);
  }
}
