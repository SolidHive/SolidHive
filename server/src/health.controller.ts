import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

/**
 * Point de vie pour l'hébergeur (health check) et pour le ping qui empêche
 * l'instance gratuite de s'endormir. Hors limitation de débit : il est appelé
 * à intervalle fixe par des automates, pas par des visiteurs.
 */
@SkipThrottle()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', uptime: Math.round(process.uptime()) };
  }
}
