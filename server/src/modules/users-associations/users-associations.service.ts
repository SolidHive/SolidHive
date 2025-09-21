import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from './entities/user-association.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Association } from '../associations/entities/association.entity';
import { AssociationRole } from '../associations-roles/entities/association-role.entity';
import { CreateUsersAssociationDto } from './dto/create-users-association.dto';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';
import { UpdateUsersAssociationDto } from './dto/update-users-association.dto';

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
    private usersAssociationsRepository: Repository<UserAssociation>,
  ) {}

  async create(
    createUsersAssociationDto: CreateUsersAssociationDto,
    userId: string,
  ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const association = await this.associationsRepository.findOne({
      where: { id: createUsersAssociationDto.associationId },
    });
    if (!association) {
      throw new HttpException('Association not found', HttpStatus.NOT_FOUND);
    }

    const role = await this.associationsRolesRepository.findOne({
      where: { id: createUsersAssociationDto.roleId },
    });
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }

    const userAssociation = this.usersAssociationsRepository.create({
      user,
      association,
      role,
    });

    return this.usersAssociationsRepository.save(userAssociation);
  }

  async findAll(userAssociationId: string, options?: FindOptionsDto) {
    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { id: userAssociationId },
      relations: ['association'],
    });

    if (!userAssociation) {
      throw new HttpException(
        'User association not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.usersAssociationsRepository.find(options);
  }

  async findOne(
    userAssociationId: string,
    id: string,
    options?: FindOptionsDto,
  ) {
    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { id: userAssociationId },
      relations: ['association'],
    });

    if (!userAssociation) {
      throw new HttpException(
        'User association not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.usersAssociationsRepository.findOne({
      where: { id },
      ...options,
    });
  }

  async update(
    userAssociationId: string,
    id: string,
    updateUsersAssociationDto: UpdateUsersAssociationDto,
  ) {
    const role = await this.associationsRolesRepository.findOne({
      where: { id: updateUsersAssociationDto.roleId },
    });
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }

    await this.usersAssociationsRepository.update(id, {
      role,
    });
    return this.findOne(userAssociationId, id);
  }

  async remove(userAssociationId: string, id: string) {
    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { id: userAssociationId },
    });

    if (!userAssociation) {
      throw new HttpException(
        'User association not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.usersAssociationsRepository.delete(id);
  }
}
