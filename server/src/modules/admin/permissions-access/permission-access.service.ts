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
    return this.permissionAccessRepository.find(options);
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
