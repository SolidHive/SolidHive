import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  isAuthenticated(): this is AuthenticatedRequest;
  user: Express.User;
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Sans session valide, répondre 401 plutôt que le 403 par défaut : le client
    // ne déconnecte que sur 401, sinon une session expirée laissait l'interface
    // « connectée » avec des données mises en cache.
    if (typeof request.isAuthenticated !== 'function' || !request.isAuthenticated()) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
