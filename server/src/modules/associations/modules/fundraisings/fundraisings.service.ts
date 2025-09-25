import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { Repository } from 'typeorm';
import { Fundraising } from './entities/fundraising.entity';
import { CreateFundraisingDto } from './dto/create-fundraising.dto';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateFundraisingDto } from './dto/update-fundraising.dto';

@Injectable()
export class FundraisingsService {
  constructor(
    @InjectRepository(Fundraising)
    private readonly fundraisingsRepository: Repository<Fundraising>
  ) {}

  async create(createFundraisingDto: CreateFundraisingDto, userAssociation: UserAssociation) {
    const fundraising = this.fundraisingsRepository.create({
      ...createFundraisingDto,
      createdBy: userAssociation,
      association: { id: userAssociation.associationId },
    });

    return this.fundraisingsRepository.save(fundraising);
  }

  findAll(associationId: string, options?: FindOptionsDto) {
    return this.fundraisingsRepository.find({
      ...options,
      where: { association: { id: associationId } },
    });
  }

  findOne(id: string, associationId: string, options?: FindOptionsDto) {
    return this.fundraisingsRepository.findOne({
      ...options,
      where: { id, association: { id: associationId } },
    });
  }

  async update(id: string, associationId: string, updateFundraisingDto: UpdateFundraisingDto) {
    await this.fundraisingsRepository.update(id, updateFundraisingDto);
    return this.findOne(id, associationId);
  }

  async remove(id: string, associationId: string) {
    return this.fundraisingsRepository.delete({
      id,
      association: { id: associationId },
    });
  }
}
