import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';

/**
 * Deux façons de désigner Redis : une URL complète (`REDIS_URL`, ce que
 * fournissent les hébergeurs managés, TLS compris avec `rediss://`), ou le
 * triplet hôte / port / mot de passe du docker-compose. L'URL prime.
 */
const createRedisClient = () =>
  process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis({
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      });

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: createRedisClient,
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
