import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import * as requestIp from 'request-ip';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en millisecondes
  max: number; // Nombre maximum de requêtes dans cette fenêtre
  message?: string; // Message personnalisé (optionnel)
}

// Typage sécurisé pour le décorateur
export const SetRateLimit = (
  config: RateLimitConfig,
): MethodDecorator & ClassDecorator => {
  return (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ): void => {
    const metadataTarget: object = (descriptor?.value as object) ?? target;

    Reflect.defineMetadata(RATE_LIMIT_KEY, config, metadataTarget);
  };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limiters = new Map<string, RateLimitRequestHandler>();
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Trop de requêtes, veuillez réessayer plus tard',
  };

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const handler = context.getHandler();
    const controller = context.getClass();

    const config =
      this.reflector.get<RateLimitConfig>(RATE_LIMIT_KEY, handler) ??
      this.reflector.get<RateLimitConfig>(RATE_LIMIT_KEY, controller) ??
      this.defaultConfig;

    const key = `${controller.name}-${handler.name}`;

    if (!this.limiters.has(key)) {
      this.limiters.set(
        key,
        rateLimit({
          windowMs: config.windowMs,
          max: config.max,
          message: { message: config.message || this.defaultConfig.message },
          standardHeaders: true,
          legacyHeaders: false,
          keyGenerator: (req) =>
            requestIp.getClientIp(req) || req.ip || 'ip-inconnue',
          skip: () => false,
        }),
      );
    }

    const limiter = this.limiters.get(key);

    if (!limiter) {
      console.error(`Limiteur pour ${key} non trouvé`);
      return true;
    }

    return new Promise((resolve) => {
      // Utilisation de `void` pour marquer explicitement que la promesse retournée par le middleware est ignorée
      void limiter(request, response, () => {
        resolve(true);
      });
    });
  }
}
