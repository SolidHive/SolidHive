import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Permissions } from '../../../common/enums/permissions';
import { UserAssociation } from '../modules/users/entities/user-association.entity';
import { Status } from '../../../common/enums/status';
import { Association } from '../entities/association.entity';
import { PermissionAccess } from '../../../modules/admin/permissions-access/entities/permission-access.entity';

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
    private usersAssociationsRepository: Repository<UserAssociation>,
    @InjectRepository(PermissionAccess)
    private permissionAccessRepository: Repository<PermissionAccess>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler());

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<UserRequest>();

    if (typeof request.isAuthenticated === 'function' && !request.isAuthenticated()) {
      return false;
    }

    const userId = request.user.id;
    const associationId = Array.isArray(request.params.associationId)
      ? request.params.associationId[0]
      : request.params.associationId;

    if (!associationId) {
      return false;
    }

    const userAssociation = await this.usersAssociationsRepository.findOne({
      where: { userId: userId, associationId, status: Status.ACCEPTED },
      relations: ['role', 'association'],
    });

    if (!userAssociation) {
      return false;
    }

    request.userAssociation = userAssociation;

    const today = new Date();

    const association: Association = userAssociation.association;
    requiredPermissions.forEach(async (permission: string) => {
      const permissionAccess = await this.permissionAccessRepository.findOne({
        where: { permission: permission as Permissions },
      });

      if (
        (permissionAccess?.requiresSubscription &&
          association.paymentServiceValidUntil &&
          today > association.paymentServiceValidUntil) ||
        (permissionAccess?.requiresSubscription && !association.paymentServiceValidUntil)
      ) {
        return false;
      }
    });

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
      return false;
    }

    return true;
  }
}
