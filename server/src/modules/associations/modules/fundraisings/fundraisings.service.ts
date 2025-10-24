import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { Repository } from 'typeorm';
import { Fundraising } from './entities/fundraising.entity';
import { CreateFundraisingDto } from './dto/create-fundraising.dto';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateFundraisingDto } from './dto/update-fundraising.dto';
import { File } from '../../../files/entities/file.entity';

@Injectable()
export class FundraisingsService {
  constructor(
    @InjectRepository(Fundraising)
    private readonly fundraisingsRepository: Repository<Fundraising>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>
  ) {}

  async create(createFundraisingDto: CreateFundraisingDto, userAssociation: UserAssociation) {
    const fundraising = this.fundraisingsRepository.create({
      ...createFundraisingDto,
      createdBy: userAssociation,
      association: { id: userAssociation.associationId },
    });

    return this.fundraisingsRepository.save(fundraising);
  }

  async findAll(associationId: string, options?: FindOptionsDto) {
    const fundraisings = await this.fundraisingsRepository.find({
      ...options,
      where: { association: { id: associationId } },
      relations: ['createdBy', 'association'],
    });

    // Enrichir avec les images
    const enrichedFundraisings = await Promise.all(
      fundraisings.map(async (fundraising) => {
        const imageFile = await this.fileRepository.findOne({
          where: {
            relatedTo: 'Fundraising',
            relatedBy: fundraising.id,
            purpose: 'image',
            index: 0,
          },
        });

        const imageUrl = imageFile
          ? `/files/Fundraising/${fundraising.id}?index=${imageFile.index}`
          : null; // Pas d'image par défaut, sera géré côté frontend

        return {
          ...fundraising,
          image: imageUrl,
        };
      })
    );

    return enrichedFundraisings;
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
