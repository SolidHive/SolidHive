import { HttpException, HttpStatus, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from './entities/user-association.entity';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Association } from '../../entities/association.entity';
import { AssociationRole } from '../roles/entities/association-role.entity';
import { CreateUserAssociationDto } from './dto/create-user-association.dto';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateUserAssociationDto } from './dto/update-user-association.dto';
import { Status } from '../../../../common/enums/status';
import { StatusUserAssociationDto } from './dto/status-user-association';

@Injectable()
export class UsersAssociationsService {
  constructor(
    @InjectRepository(AssociationRole)
    private associationsRolesRepository: Repository<AssociationRole>,
    @InjectRepository(Association)
    private associationsRepository: Repository<Association>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserAssociation)
    private usersAssociationsRepository: Repository<UserAssociation>
  ) {}

  async create(createUserAssociationDto: CreateUserAssociationDto, associationId: string) {
    const user = await this.usersRepository.findOne({
      where: { email: createUserAssociationDto.email },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const association = await this.associationsRepository.findOne({
      where: { id: associationId },
    });
    if (!association) {
      throw new HttpException('Association not found', HttpStatus.NOT_FOUND);
    }

    const role = await this.associationsRolesRepository.findOne({
      where: { id: createUserAssociationDto.roleId },
    });
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }

    // Vérifier si l'utilisateur est déjà membre de l'association
    const existingUserAssociation = await this.usersAssociationsRepository.findOne({
      where: { userId: user.id, associationId },
    });
    if (existingUserAssociation) {
      throw new HttpException(
        'Cet utilisateur est déjà membre de cette association',
        HttpStatus.CONFLICT
      );
    }

    const userAssociation = this.usersAssociationsRepository.create({
      user,
      association,
      role,
    });

    return this.usersAssociationsRepository.save(userAssociation);
  }

  async findAll(associationId: string, options?: FindOptionsDto) {
    let whereConditions: FindOptionsWhere<UserAssociation>[] = [{ associationId }];

    if (options?.where !== undefined && typeof options.where === 'string' && options.where !== '') {
      const searchTerm = `%${options.where}%`;
      whereConditions = [
        { associationId, user: { name: ILike(searchTerm) } },
        { associationId, user: { firstname: ILike(searchTerm) } },
        { associationId, user: { email: ILike(searchTerm) } },
        { associationId, user: { phone: ILike(searchTerm) } },
        { associationId, role: { name: ILike(searchTerm) } },
      ];
    }

    const findOptions: any = {
      relations: {
        user: true,
        role: true,
      },
      select: {
        id: true,
        user: {
          id: true,
          firstname: true,
          name: true,
          email: true,
          phone: true,
        },
        role: {
          name: true,
        },
        status: true,
      },
      where: whereConditions,
    };

    if (options?.order) {
      findOptions.order = options.order;
    }

    if (options?.skip !== undefined) {
      findOptions.skip = options.skip;
    }

    if (options?.take !== undefined) {
      findOptions.take = options.take;
    }

    // Si pagination demandée, utiliser findAndCount
    if (options?.skip !== undefined || options?.take !== undefined) {
      const [usersAssociations, total] =
        await this.usersAssociationsRepository.findAndCount(findOptions);
      return {
        data: usersAssociations,
        meta: {
          total,
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(total / (options.take || 10)),
        },
      };
    } else {
      // Sinon, retourner tous les résultats
      const usersAssociations = await this.usersAssociationsRepository.find(findOptions);
      return usersAssociations;
    }
  }

  async findOne(id: string, associationId: string, options?: FindOptionsDto) {
    return this.usersAssociationsRepository.findOne({
      ...options,
      relations: {
        user: true,
        role: true,
      },
      select: {
        id: true,
        user: {
          id: true,
          firstname: true,
          name: true,
          email: true,
          phone: true,
        },
        role: {
          name: true,
          id: true,
        },
        status: true,
      },
      where: { id, associationId },
    });
  }

  async findAllByStatus(associationId: string, status: string, options?: FindOptionsDto) {
    if (!Object.values(Status).includes(status as Status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    let whereConditions: any = { associationId, status: status as Status };

    if (options?.where !== undefined && typeof options.where === 'string' && options.where !== '') {
      const searchTerm = `%${options.where}%`;
      whereConditions = [
        { associationId, status: status as Status, user: { name: ILike(searchTerm) } },
        { associationId, status: status as Status, user: { firstname: ILike(searchTerm) } },
        { associationId, status: status as Status, user: { email: ILike(searchTerm) } },
        { associationId, status: status as Status, user: { phone: ILike(searchTerm) } },
        { associationId, status: status as Status, role: { name: ILike(searchTerm) } },
      ];
    }

    const findOptions: any = {
      relations: {
        user: true,
        role: true,
      },
      select: {
        id: true,
        user: {
          id: true,
          firstname: true,
          name: true,
          email: true,
          phone: true,
        },
        role: {
          name: true,
        },
        status: true,
      },
      where: whereConditions,
    };

    if (options?.order) {
      findOptions.order = options.order;
    }

    if (options?.skip !== undefined) {
      findOptions.skip = options.skip;
    }

    if (options?.take !== undefined) {
      findOptions.take = options.take;
    }

    // Si pagination demandée, utiliser findAndCount
    if (options?.skip !== undefined || options?.take !== undefined) {
      const [usersAssociations, total] =
        await this.usersAssociationsRepository.findAndCount(findOptions);
      return {
        data: usersAssociations,
        meta: {
          total,
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(total / (options.take || 10)),
        },
      };
    } else {
      // Sinon, retourner tous les résultats
      const usersAssociations = await this.usersAssociationsRepository.find(findOptions);
      return usersAssociations;
    }
  }

  async findOneByStatus(
    id: string,
    associationId: string,
    status: string,
    options?: FindOptionsDto
  ) {
    if (!Object.values(Status).includes(status as Status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    return this.usersAssociationsRepository.findOne({
      ...options,
      where: { id, associationId, status: status as Status },
    });
  }

  async update(
    id: string,
    associationId: string,
    updateUserAssociationDto: UpdateUserAssociationDto,
    currentUserId?: string
  ) {
    // Récupérer l'association utilisateur à modifier
    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { id, associationId },
      relations: ['user', 'role'],
    });

    if (!userAssociation) {
      throw new HttpException('User association not found', HttpStatus.NOT_FOUND);
    }

    // Empêcher la modification d'un propriétaire
    if (userAssociation.role.name === 'owner') {
      throw new ForbiddenException("Impossible de modifier le rôle d'un propriétaire");
    }

    // Empêcher l'auto-modification
    if (currentUserId && userAssociation.user.id === currentUserId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier votre propre rôle');
    }

    const role = await this.associationsRolesRepository.findOne({
      where: { id: updateUserAssociationDto.roleId },
    });
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }

    await this.usersAssociationsRepository.update(id, {
      role,
    });
    return this.findOne(id, associationId);
  }

  async updateStatus(
    userId: string,
    associationId: string,
    updateStatusUserAssociationDto: StatusUserAssociationDto
  ) {
    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { userId, associationId },
    });
    if (!userAssociation) {
      throw new HttpException('User association not found', HttpStatus.NOT_FOUND);
    }

    const validStatuses = [Status.ACCEPTED, Status.REJECTED];

    if (!validStatuses.includes(updateStatusUserAssociationDto.status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    await this.usersAssociationsRepository.update(userId, {
      status: updateStatusUserAssociationDto.status,
    });

    return this.findOne(userId, associationId);
  }

  async remove(id: string, associationId: string, currentUserId?: string) {
    // Récupérer l'association utilisateur à supprimer
    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { id, associationId },
      relations: ['user', 'role'],
    });

    if (!userAssociation) {
      throw new HttpException('User association not found', HttpStatus.NOT_FOUND);
    }

    // Empêcher la suppression d'un propriétaire
    if (userAssociation.role.name === 'owner') {
      throw new ForbiddenException('Impossible de supprimer un propriétaire');
    }

    // Empêcher l'auto-suppression
    if (currentUserId && userAssociation.user.id === currentUserId) {
      throw new ForbiddenException('Vous ne pouvez pas vous supprimer vous-même');
    }

    return this.usersAssociationsRepository.delete({ id, associationId });
  }
}
