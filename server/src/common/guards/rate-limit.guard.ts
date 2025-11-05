import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { rateLimit, RateLimitRequestHandler, ipKeyGenerator } from 'express-rate-limit';
import * as requestIp from 'request-ip';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en millisecondes
  max: number; // Nombre maximum de requêtes dans cette fenêtre
  message?: string; // Message personnalisé (optionnel)
}

// Typage sécurisé pour le décorateur
export const SetRateLimit = (config: RateLimitConfig): MethodDecorator & ClassDecorator => {
  return (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ): void => {
    const metadataTarget: object = (descriptor?.value as object) ?? target;

    Reflect.defineMetadata(RATE_LIMIT_KEY, config, metadataTarget);
  };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limiter: RateLimitRequestHandler;

  constructor(private reflector: Reflector) {
    // Créer le limiter une fois dans le constructor
    this.limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requêtes par fenêtre
      message: { message: 'Trop de requêtes, veuillez réessayer plus tard' },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => ipKeyGenerator(requestIp.getClientIp(req) || req.ip || 'unknown'),
      skip: () => false,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return new Promise((resolve) => {
      void this.limiter(request, response, () => {
        resolve(true);
      });
    });
  }
}
