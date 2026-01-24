import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { Repository } from 'typeorm';
import { Fundraising } from './entities/fundraising.entity';
import { CreateFundraisingDto } from './dto/create-fundraising.dto';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateFundraisingDto } from './dto/update-fundraising.dto';
import { File } from '../../../files/entities/file.entity';
import { FilesService } from '../../../files/files.service';
import { Like, Between } from 'typeorm';

@Injectable()
export class FundraisingsService {
  constructor(
    @InjectRepository(Fundraising)
    private readonly fundraisingsRepository: Repository<Fundraising>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly filesService: FilesService
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
      return {
        data: enrichedData,
        meta: {
          total: result[1],
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(result[1] / (options.take || 10)),
        },
      };
    }

    const fundraisings = await this.fundraisingsRepository.find({
      where,
      relations,
      order,
    });

    return this.enrichWithImages(fundraisings);
  }

  async findAll(associationId: string, options?: FindOptionsDto) {
    let whereConditions: any = { association: { id: associationId } };
    if (options?.where && typeof options.where === 'string') {
      // Recherche textuelle sur title
      const searchTerm = options.where;
      whereConditions = {
        ...whereConditions,
        title: Like(`%${searchTerm}%`),
      };
    } else if (options?.where) {
      whereConditions = { ...options.where, ...whereConditions };
    }

    const findOptions: any = {
      where: whereConditions,
      relations: ['createdBy', 'association'],
    };

    if (options?.order) {
      findOptions.order = options.order;
    } else {
      findOptions.order = { startDate: 'DESC' };
    }

    if (options?.skip !== undefined) {
      findOptions.skip = options.skip;
    }

    if (options?.take !== undefined) {
      findOptions.take = options.take;
    }

    // Si pagination demandée, utiliser findAndCount
    if (options?.skip !== undefined || options?.take !== undefined) {
      const [fundraisings, total] = await this.fundraisingsRepository.findAndCount(findOptions);
      const enrichedData = await Promise.all(
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
      return {
        data: enrichedData,
        meta: {
          total,
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(total / (options.take || 10)),
        },
      };
    } else {
      // Sinon, retourner tous les résultats
      const fundraisings = await this.fundraisingsRepository.find(findOptions);
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
            : null;

          return {
            ...fundraising,
            image: imageUrl,
          };
        })
      );
      return enrichedFundraisings;
    }
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
    try {
      await this.filesService.remove('Fundraising', id, 0, 'image');
    } catch (error) {
      console.error(`Erreur lors de la suppression des fichiers de la cagnotte ${id}:`, error);
    }

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
