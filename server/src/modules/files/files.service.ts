import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Role } from '../users/entities/role.entity';
import { AssociationRole } from '../associations/modules/roles/entities/association-role.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FilesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(AssociationRole)
    private associationRoleRepository: Repository<AssociationRole>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(File)
    private filesRepository: Repository<File>
  ) {}

  async create(createFileDto: CreateFileDto, file: Express.Multer.File, userId: string) {
    const extension = file.originalname.split('.').pop();

    // Vérifie que la cible existe
    const targetRepo = this.dataSource.getRepository(createFileDto.relatedTo);

    const target = await targetRepo.findOne({
      where: { id: createFileDto.relatedBy },
    });

    if (!target) {
      throw new HttpException(`${createFileDto.relatedTo} not found`, HttpStatus.NOT_FOUND);
    }

    let allowedSystemRoles: Role[] = [];
    if (createFileDto.allowedSystemRoles) {
      allowedSystemRoles = await this.roleRepository.find({
        where: { id: In(createFileDto.allowedSystemRoles) },
      });
    }

    let allowedAssociationRoles: AssociationRole[] = [];
    if (createFileDto.allowedAssociationRoles) {
      allowedAssociationRoles = await this.associationRoleRepository.find({
        where: { id: In(createFileDto.allowedAssociationRoles) },
      });
    }

    const addFile = this.filesRepository.create({
      ...createFileDto,
      userId,
      extension,
      oldFilename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      filename: file.filename,
      allowedSystemRoles,
      allowedAssociationRoles,
    });

    return this.filesRepository.save(addFile);
  }

  async findOne(relatedTo: string, relatedBy: string, index: number = 0, userId?: string) {
    const file = await this.filesRepository.findOne({
      where: { relatedTo, relatedBy, index },
      relations: ['allowedSystemRoles', 'allowedAssociationRoles'],
    });

    if (!file) {
      return null;
    }

    if (file.allowedAssociationRoles.length > 0 || file.allowedSystemRoles.length > 0) {
      if (!userId) {
        throw new ForbiddenException('You do not have permission to access this file');
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles', 'associations', 'associations.role'],
      });
      if (!user) {
        throw new ForbiddenException('You do not have permission to access this file');
      }

      let hasPermission =
        file.allowedAssociationRoles.length > 0 || file.allowedSystemRoles.length > 0
          ? false
          : true;
      // check if user has one of the allowed association roles
      if (
        file.allowedAssociationRoles.length > 0 &&
        user.associations.some((ua) =>
          file.allowedAssociationRoles.some((r) => r.id === ua.role.id)
        )
      ) {
        hasPermission = true;
      }

      // check if user has one of the allowed system roles
      if (
        file.allowedSystemRoles.length > 0 &&
        user.roles.some((role) => file.allowedSystemRoles.some((r) => r.id === role.id))
      ) {
        hasPermission = true;
      }

      if (!hasPermission) {
        throw new ForbiddenException('You do not have permission to access this file');
      }
    }

    return file;
  }

  async update(
    relatedTo: string,
    relatedBy: string,
    index: number = 0,
    updateFileDto: UpdateFileDto
  ) {
    let allowedSystemRoles: Role[] = [];
    if (updateFileDto.allowedSystemRoles) {
      allowedSystemRoles = await this.roleRepository.find({
        where: { id: In(updateFileDto.allowedSystemRoles) },
      });
    }

    let allowedAssociationRoles: AssociationRole[] = [];
    if (updateFileDto.allowedAssociationRoles) {
      allowedAssociationRoles = await this.associationRoleRepository.find({
        where: { id: In(updateFileDto.allowedAssociationRoles) },
      });
    }

    return this.filesRepository.update(
      { relatedTo, relatedBy, index },
      { ...updateFileDto, allowedSystemRoles, allowedAssociationRoles }
    );
  }

  async getFileStream(
    relatedTo: string,
    relatedBy: string,
    index: number = 0
  ): Promise<StreamableFile | null> {
    const file = await this.findOne(relatedTo, relatedBy, index);

    if (!file) {
      return null;
    }

    const fileStream = createReadStream(
      join(process.cwd(), 'uploads', file.userId, file.fullFilename())
    );

    return new StreamableFile(fileStream, {
      type: file.mimetype,
      disposition: `inline; filename="${file.oldFilename}"`,
    });
  }

  remove(relatedTo: string, relatedBy: string, index: number = 0) {
    return this.filesRepository.delete({ relatedTo, relatedBy, index });
  }
}
