import { Injectable } from '@nestjs/common';
import { CreatePermissionAccessDto } from './dto/create-permission-access.dto';
import { UpdatePermissionAccessDto } from './dto/update-permission-access.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionAccess } from './entities/permission-access.entity';
import { FindOptionsDto } from 'src/common/dto/find-all-query.dto';

@Injectable()
export class PermissionAccessService {
  constructor(@InjectRepository(PermissionAccess) private readonly permissionAccessRepository) {}

  async create(createPermissionAccessDto: CreatePermissionAccessDto) {
    const permissionAccess = this.permissionAccessRepository.create(createPermissionAccessDto);
    return this.permissionAccessRepository.save(permissionAccess);
  }

  findAll(options?: FindOptionsDto) {
    const findOptions: any = {};

    if (options?.where) {
      findOptions.where = options.where;
    }

    if (options?.order) {
      findOptions.order = options.order;
    }

    if (options?.relations) {
      findOptions.relations = options.relations;
    }

    if (options?.skip !== undefined) {
      findOptions.skip = options.skip;
    }

    if (options?.take !== undefined) {
      findOptions.take = options.take;
    }

    // Si pagination demandée, utiliser findAndCount
    if (options?.skip !== undefined || options?.take !== undefined) {
      return this.permissionAccessRepository.findAndCount(findOptions).then(([items, total]) => ({
        data: items,
        meta: {
          total,
          page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
          limit: options.take || 10,
          totalPages: Math.ceil(total / (options.take || 10)),
        },
      }));
    } else {
      // Sinon, retourner tous les résultats
      return this.permissionAccessRepository.find(findOptions);
    }
  }

  findOne(permission: string, options?: FindOptionsDto) {
    return this.permissionAccessRepository.findOne({
      where: { permission },
      ...options,
    });
  }

  async update(id: string, updatePermissionAccessDto: UpdatePermissionAccessDto) {
    await this.permissionAccessRepository.update(id, updatePermissionAccessDto);
    return this.permissionAccessRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    return this.permissionAccessRepository.delete(id);
  }
}
