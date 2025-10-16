import { ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Permissions } from '../../../common/enums/permissions';
import { UserAssociation } from '../modules/users/entities/user-association.entity';
import { Status } from '../../../common/enums/status';

export const PERMISSIONS_KEY = 'associationPermissions';
export const AssociationPermissions = (...permissions: Permissions[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

interface UserRequest extends Request {
  user: { id: string };
  userAssociation: UserAssociation | undefined;
}

@Injectable()
export class AssociationPermissionsGuard {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserAssociation)
    private usersAssociationsRepository: Repository<UserAssociation>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler());

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<UserRequest>();

    if (typeof request.isAuthenticated === 'function' && !request.isAuthenticated()) {
      throw new UnauthorizedException('Vous devez être connecté pour accéder à cette ressource');
    }

    const userId = request.user.id;
    const associationId: string = request.params.associationId;

    if (!associationId) {
      throw new UnauthorizedException('The association ID need to be filled');
    }

    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { userId: userId, associationId, status: Status.ACCEPTED },
      relations: ['role'],
    });

    if (!userAssociation) {
      throw new UnauthorizedException(
        "Vous devez être membre de l'association pour accéder à cette ressource"
      );
    }

    request.userAssociation = userAssociation;

    const userPermissions = userAssociation.role.permissions;

    const hasPermissions = userPermissions.includes(Permissions.ALL)
      ? true
      : requiredPermissions.some((permission) =>
          userPermissions.some(
            (userPermission) =>
              userPermission && userPermission.toUpperCase() === permission.toUpperCase()
          )
        );

    if (!hasPermissions) {
      throw new UnauthorizedException(
        "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource"
      );
    }

    return true;
  }
}
