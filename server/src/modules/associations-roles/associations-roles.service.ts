import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AssociationRole } from './entities/association-role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from '../users-associations/entities/user-association.entity';
import { CreateAssociationRoleDto } from './dto/create-association-role.dto';
import { FindAllQueryDto } from 'src/common/dto/find-all-query.dto';
import { UpdateAssociationRoleDto } from './dto/update-association-role.dto';

@Injectable()
export class AssociationsRolesService {
  constructor(
    @InjectRepository(UserAssociation)
    private readonly userAssociationsRepository: Repository<UserAssociation>,
    @InjectRepository(AssociationRole)
    private readonly associationsRolesRepository: Repository<AssociationRole>,
  ) {}

  async create(createAssociationRoleDto: CreateAssociationRoleDto) {
    const userAssociation: UserAssociation | null =
      await this.userAssociationsRepository.findOne({
        where: { id: createAssociationRoleDto.userAssociationId },
        relations: ['association'],
      });

    if (!userAssociation) {
      throw new HttpException(
        'User association not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const associationRole = this.associationsRolesRepository.create({
      ...createAssociationRoleDto,
      association: userAssociation.association,
      createdBy: userAssociation,
    });

    return this.associationsRolesRepository.save(associationRole);
  }

  async findAll(options?: FindAllQueryDto) {
    return this.associationsRolesRepository.find({
      ...options,
    });
  }

  findOne(id: string, options?: FindAllQueryDto) {
    return this.associationsRolesRepository.findOne({
      ...options,
      where: { id },
    });
  }

  async update(id: string, updateAssociationRoleDto: UpdateAssociationRoleDto) {
    await this.associationsRolesRepository.update(id, updateAssociationRoleDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.associationsRolesRepository.delete(id);
  }
}
