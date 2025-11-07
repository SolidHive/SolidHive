import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { Repository } from 'typeorm';
import { Fundraising } from './entities/fundraising.entity';
import { CreateFundraisingDto } from './dto/create-fundraising.dto';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateFundraisingDto } from './dto/update-fundraising.dto';
import { File } from '../../../files/entities/file.entity';
import { Like, Between } from 'typeorm';

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

  async findAllGlobal(
    options?: FindOptionsDto & {
      association?: string;
      date?: string;
    }
  ) {
    const where: any = {};

    if (options?.name) {
      where.title = Like(`%${options.name}%`);
    }

    if (options?.association) {
      where.association = { name: Like(`%${options.association}%`) };
    }

    if (options?.date) {
      const filterDate = new Date(options.date);
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.startDate = Between(startOfDay, endOfDay);
    }

    let order: any = options?.order;
    if (options?.orderBy) {
      order = { startDate: options.orderBy };
    }

    const relations = ['association', 'createdBy'];

    if (options?.take) {
      const result = await this.fundraisingsRepository.findAndCount({
        where,
        relations,
        order,
        skip: options.skip,
        take: options.take,
      });

      const enrichedData = await this.enrichWithImages(result[0]);
      return { data: enrichedData, total: result[1] };
    }

    const fundraisings = await this.fundraisingsRepository.find({
      where,
      relations,
      order,
    });

    return this.enrichWithImages(fundraisings);
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

  async findOne(id: string, associationId: string, options?: FindOptionsDto) {
    const fundraising = await this.fundraisingsRepository.findOne({
      ...options,
      where: { id, association: { id: associationId } },
      relations: ['association', 'createdBy'],
    });

    if (!fundraising) {
      return null;
    }

    // Enrichir avec l'image
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
      : null;

    return {
      ...fundraising,
      image: imageUrl,
    };
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

  private async enrichWithImages(fundraisings: Fundraising[]) {
    return Promise.all(
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
          : null;

        return {
          ...fundraising,
          image: imageUrl,
        };
      })
    );
  }
}
