import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/entities/role.entity';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/update-user.dto';
import { RolesList } from '../../../common/enums/roles';
import { FindOptionsDto } from '../../../common/dto/find-all-query.dto';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {
    this.initializeRoles();
  }

  private async initializeRoles() {
    for (const roleData of RolesList) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
      }
    }
  }

  async findAll(options?: FindOptionsDto) {
    // Construction de la requête de recherche
    let whereConditions = {};
    if (options?.where && typeof options.where === 'string') {
      // Recherche textuelle sur email, firstname, name
      const searchTerm = options.where;
      whereConditions = [
        { email: Like(`%${searchTerm}%`) },
        { firstname: Like(`%${searchTerm}%`) },
        { name: Like(`%${searchTerm}%`) },
      ];
    } else if (options?.where) {
      whereConditions = options.where;
    }

    const findOptions: any = {
      where: whereConditions,
      relations: ['roles'],
    };

    if (options?.order) {
      findOptions.order = options.order;
    } else {
      findOptions.order = {
        timestamps: {
          createdAt: 'DESC',
        },
      };
    }

    if (options?.skip !== undefined) {
      findOptions.skip = options.skip;
    }

    if (options?.take !== undefined) {
      findOptions.take = options.take;
    }

    // Si pagination demandée, utiliser findAndCount
    if (options?.skip !== undefined || options?.take !== undefined) {
      const [users, total] = await this.userRepository.findAndCount(findOptions);
      return {
        data: users,
        meta: {
          total,
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(total / (options.take || 10)),
        },
      };
    } else {
      // Sinon, retourner tous les résultats
      const users = await this.userRepository.find(findOptions);
      return users;
    }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async updateRoles(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    const roles = await this.roleRepository
      .createQueryBuilder('role')
      .where('role.name IN (:...names)', { names: updateUserRoleDto.roles })
      .getMany();

    if (roles.length !== updateUserRoleDto.roles.length) {
      throw new NotFoundException('Un ou plusieurs rôles spécifiés sont invalides');
    }

    user.roles = roles;
    return await this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: 'Utilisateur supprimé avec succès' };
  }

  async getAllRoles() {
    return await this.roleRepository.find();
  }
}
