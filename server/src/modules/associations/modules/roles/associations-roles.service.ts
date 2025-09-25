import { Injectable } from '@nestjs/common';
import { AssociationRole } from './entities/association-role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users/entities/user-association.entity';
import { CreateAssociationRoleDto } from './dto/create-association-role.dto';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import { UpdateAssociationRoleDto } from './dto/update-association-role.dto';

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

    return this.associationsRolesRepository.save(associationRole);
  }

  async findAll(associationId: string, options?: FindOptionsDto) {
    return this.associationsRolesRepository.find({
      ...options,
      where: {
        association: { id: associationId },
      },
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
    await this.associationsRolesRepository.update(id, updateAssociationRoleDto);
    return this.findOne(id, associationId);
  }

  async remove(id: string, associationId: string) {
    return this.associationsRolesRepository.delete({
      id,
      association: { id: associationId },
    });
  }
}
