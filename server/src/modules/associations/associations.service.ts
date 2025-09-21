import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Association } from './entities/association.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateAssociationDto } from './dto/create-association.dto';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { AssociationRole } from '../associations-roles/entities/association-role.entity';
import { UserAssociation } from '../users-associations/entities/user-association.entity';
import { Permissions } from '../../common/enums/permissions';

@Injectable()
export class AssociationsService {
  constructor(
    @InjectRepository(AssociationRole)
    private associationsRolesRepository: Repository<AssociationRole>,
    @InjectRepository(UserAssociation)
    private readonly usersAssociationsRepository: Repository<UserAssociation>,
    @InjectRepository(Association)
    private readonly associationsRepository: Repository<Association>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createAssociationDto: CreateAssociationDto, userId: string) {
    const user: User | null = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return await this.associationsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // 1. créer l'association
        const addAssociation = transactionalEntityManager.create(Association, {
          ...createAssociationDto,
          createdBy: user,
        });
        const savedAssociation = await transactionalEntityManager.save(
          Association,
          addAssociation,
        );

        // 2. créer le rôle par défaut
        const addDefaultRole = transactionalEntityManager.create(
          AssociationRole,
          {
            name: 'owner',
            association: savedAssociation,
            description: "Rôle propriétaire de l'association",
            createdBy: null,
            permissions: [Permissions.ALL],
          },
        );
        const savedRole = await transactionalEntityManager.save(
          AssociationRole,
          addDefaultRole,
        );

        // 3. ajouter le lien user ↔ association ↔ rôle
        const addUserAssociation = transactionalEntityManager.create(
          UserAssociation,
          {
            user,
            association: savedAssociation,
            role: savedRole,
          },
        );
        await transactionalEntityManager.save(
          UserAssociation,
          addUserAssociation,
        );

        return savedAssociation;
      },
    );
  }

  findAll(options?: FindOptionsDto) {
    return this.associationsRepository.find(options);
  }

  findOne(id: string, options?: FindOptionsDto) {
    return this.associationsRepository.findOne({
      where: { id },
      ...options,
    });
  }

  async update(id: string, updateAssociationDto: UpdateAssociationDto) {
    await this.associationsRepository.update(id, updateAssociationDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.associationsRepository.delete(id);
  }
}
