import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Association } from './entities/association.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateAssociationDto } from './dto/create-association.dto';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { StatusAssociationDto } from './dto/status-association.dto';
import { UpdateStripeAccountDto } from './dto/update-stripe-account.dto';
import { Permissions } from '../../common/enums/permissions';
import { AssociationRole } from './modules/roles/entities/association-role.entity';
import { UserAssociation } from './modules/users/entities/user-association.entity';
import { Status } from '../../common/enums/status';
import { Like } from 'typeorm';

@Injectable()
export class AssociationsService {
  constructor(
    @InjectRepository(Association)
    private readonly associationsRepository: Repository<Association>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async create(createAssociationDto: CreateAssociationDto, userId: string) {
    const user: User | null = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.associationsRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const addAssociation = transactionalEntityManager.create(Association, {
            ...createAssociationDto,
            createdBy: user,
          });
          const savedAssociation = await transactionalEntityManager.save(
            Association,
            addAssociation
          );

          const addDefaultRole = transactionalEntityManager.create(AssociationRole, {
            name: 'owner',
            association: savedAssociation,
            description: "Rôle propriétaire de l'association",
            createdBy: null,
            permissions: [Permissions.ALL],
          });
          const savedRole = await transactionalEntityManager.save(AssociationRole, addDefaultRole);

          const addUserAssociation = transactionalEntityManager.create(UserAssociation, {
            user,
            association: savedAssociation,
            role: savedRole,
            status: Status.ACCEPTED,
          });
          await transactionalEntityManager.save(UserAssociation, addUserAssociation);

          return savedAssociation;
        }
      );
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'UQ_ceee675aefe0bb8f10f54db1696') {
        throw new HttpException(
          'Ce numéro SIRET est déjà utilisé par une autre association',
          HttpStatus.CONFLICT
        );
      }
      throw error;
    }
  }

  findAll(
    options?: FindOptionsDto & {
      name?: string;
      orderBy?: 'ASC' | 'DESC';
      includeAllStatuses?: boolean;
    }
  ) {
    const where: any = {};

    if (!options?.includeAllStatuses) {
      where.status = Status.ACCEPTED;
    }

    if (options?.name) {
      where.name = Like(`%${options.name}%`);
    }

    let order: any = options?.order;
    if (options?.orderBy) {
      order = { name: options.orderBy };
    }

    if (options?.take) {
      return this.associationsRepository
        .findAndCount({
          where,
          order,
          skip: options.skip,
          take: options.take,
        })
        .then(([data, total]) => ({ data, total }));
    }
    return this.associationsRepository.find({
      where,
      order,
    });
  }

  findOne(id: string, options?: FindOptionsDto) {
    return this.associationsRepository.findOne({
      ...options,
      where: { id },
    });
  }

  findAllByStatus(status: string, options?: FindOptionsDto & { name?: string }) {
    if (!Object.values(Status).includes(status as Status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    const where: any = { status: status as Status };
    if (options?.name) {
      where.name = Like(`%${options.name}%`);
    }

    if (options?.take) {
      return this.associationsRepository
        .findAndCount({
          where,
          order: options?.order,
          skip: options.skip,
          take: options.take,
        })
        .then(([data, total]) => ({ data, total }));
    }

    return this.associationsRepository.find({
      ...options,
      where,
    });
  }

  findOneByStatus(id: string, status: string, options?: FindOptionsDto) {
    if (!Object.values(Status).includes(status as Status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    return this.associationsRepository.findOne({
      ...options,
      where: { id, status: status as Status },
    });
  }

  async update(id: string, updateAssociationDto: UpdateAssociationDto) {
    await this.associationsRepository.update(id, updateAssociationDto);
    return this.findOne(id);
  }

  async updateStatus(id: string, statusAssociationDto: StatusAssociationDto) {
    await this.associationsRepository.update(id, statusAssociationDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.associationsRepository.delete(id);
  }

  async updateStripeAccount(id: string, updateStripeAccountDto: UpdateStripeAccountDto) {
    await this.associationsRepository.update(id, updateStripeAccountDto);
    return this.findOne(id);
  }
}
