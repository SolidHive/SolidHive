import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface Role {
  name: string;
  description?: string;
}

interface UserWithRoles {
  id: string;
  roles: Role[];
}

interface AuthenticatedRequest extends Request {
  isAuthenticated(): boolean;
  user: UserWithRoles;
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (
      typeof request.isAuthenticated === 'function' &&
      !request.isAuthenticated()
    ) {
      throw new UnauthorizedException(
        'Vous devez être connecté pour accéder à cette ressource',
      );
    }

    const user = request.user;

    if (!user || !Array.isArray(user.roles) || user.roles.length === 0) {
      throw new ForbiddenException(
        "Vous n'avez pas les permissions nécessaires",
      );
    }

    const hasRole = requiredRoles.some((role) =>
      user.roles.some(
        (userRole) =>
          userRole &&
          typeof userRole === 'object' &&
          'name' in userRole &&
          userRole.name === role,
      ),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        "Vous n'avez pas les permissions nécessaires",
      );
    }

    return true;
  }
}
