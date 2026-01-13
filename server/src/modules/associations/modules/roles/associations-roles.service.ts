import { Injectable, BadRequestException } from '@nestjs/common';
import { AssociationRole } from './entities/association-role.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { CreateAssociationRoleDto } from './dto/create-association-role.dto';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateAssociationRoleDto } from './dto/update-association-role.dto';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class AssociationsRolesService {
  constructor(
    @InjectRepository(UserAssociation)
    private readonly userAssociationsRepository: Repository<UserAssociation>,
    @InjectRepository(AssociationRole)
    private readonly associationsRolesRepository: Repository<AssociationRole>
  ) {}

  async create(
    createAssociationRoleDto: CreateAssociationRoleDto,
    userAssociation: UserAssociation
  ) {
    const associationRole = this.associationsRolesRepository.create({
      ...createAssociationRoleDto,
      association: { id: userAssociation.associationId },
      createdBy: userAssociation,
    });

    try {
      return await this.associationsRolesRepository.save(associationRole);
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
        // Violation de contrainte d'unicité (duplicate key)
        throw new BadRequestException('Un rôle avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async findAll(associationId: string, options?: FindOptionsDto) {
    let whereConditions: FindOptionsWhere<AssociationRole>[] = [
      { association: { id: associationId } },
    ];

    if (options?.where !== undefined && typeof options.where === 'string' && options.where !== '') {
      const searchTerm = `%${options.where}%`;
      whereConditions = [{ association: { id: associationId }, name: ILike(searchTerm) }];
    }

    return this.associationsRolesRepository.find({
      ...options,
      where: whereConditions,
    });
  }

  async findOne(id: string, associationId: string, options?: FindOptionsDto) {
    return this.associationsRolesRepository.findOne({
      ...options,
      where: { id, association: { id: associationId } },
    });
  }

  async update(
    id: string,
    associationId: string,
    updateAssociationRoleDto: UpdateAssociationRoleDto
  ) {
    try {
      await this.associationsRolesRepository.update(id, updateAssociationRoleDto);
      return this.findOne(id, associationId);
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
        // Violation de contrainte d'unicité (duplicate key)
        throw new BadRequestException('Un rôle avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async remove(id: string, associationId: string) {
    return this.associationsRolesRepository.delete({
      id,
      association: { id: associationId },
    });
  }
}
