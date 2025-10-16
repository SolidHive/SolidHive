import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAssociation } from './entities/user-association.entity';
import { Repository } from 'typeorm';
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
      where: { id: createUserAssociationDto.userId },
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

    const userAssociation = this.usersAssociationsRepository.create({
      user,
      association,
      role,
    });

    return this.usersAssociationsRepository.save(userAssociation);
  }

  async findAll(associationId: string, options?: FindOptionsDto) {
    return this.usersAssociationsRepository.find({
      ...options,
      where: { associationId, status: Status.ACCEPTED },
    });
  }

  async findOne(id: string, associationId: string, options?: FindOptionsDto) {
    return this.usersAssociationsRepository.findOne({
      ...options,
      where: { id, associationId, status: Status.ACCEPTED },
    });
  }

  async findAllByStatus(associationId: string, status: string, options?: FindOptionsDto) {
    if (!Object.values(Status).includes(status as Status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    return this.usersAssociationsRepository.find({
      ...options,
      where: { associationId, status: status as Status },
    });
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
    updateUserAssociationDto: UpdateUserAssociationDto
  ) {
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

  async remove(id: string, associationId: string) {
    return this.usersAssociationsRepository.delete({ id, associationId });
  }
}
