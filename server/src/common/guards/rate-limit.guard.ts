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
  private readonly limiters = new Map<string, RateLimitRequestHandler>();
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes
    message: 'Trop de requêtes, veuillez réessayer plus tard',
  };

  constructor(private reflector: Reflector) {
    // Pré-créer les limiters avec la configuration par défaut
    this.createLimiter('default', this.defaultConfig);
  }

  private createLimiter(key: string, config: RateLimitConfig): void {
    this.limiters.set(
      key,
      rateLimit({
        windowMs: config.windowMs,
        max: config.max,
        message: { message: config.message || this.defaultConfig.message },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
          const clientIp = requestIp.getClientIp(req) || req.ip || 'unknown';
          // Normaliser les adresses IPv6 pour éviter le contournement
          if (clientIp.includes(':')) {
            // Pour IPv6, utiliser seulement le préfixe /64 pour éviter la fragmentation
            const ipv6Parts = clientIp.split(':');
            return ipv6Parts.slice(0, 4).join(':') + '::/64';
          }
          return clientIp;
        },
        skip: () => false,
      })
    );
  }

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

    // Créer le limiter seulement s'il n'existe pas encore
    if (!this.limiters.has(key)) {
      this.createLimiter(key, config);
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
