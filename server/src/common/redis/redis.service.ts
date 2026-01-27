import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Récupère une valeur depuis Redis
   * @param key Clé Redis
   * @returns Valeur désérialisée ou null si non trouvée
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Stocke une valeur dans Redis
   * @param key Clé Redis
   * @param value Valeur à stocker (sera sérialisée en JSON)
   * @param ttl Time To Live en secondes (optionnel)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Supprime une clé depuis Redis
   * @param key Clé à supprimer
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Vérifie si une clé existe dans Redis
   * @param key Clé à vérifier
   * @returns true si la clé existe, false sinon
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Définit une expiration sur une clé existante
   * @param key Clé Redis
   * @param ttl Time To Live en secondes
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl);
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Incrémente une valeur numérique
   * @param key Clé Redis
   * @returns Nouvelle valeur
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch (error) {
      console.error(`Redis INCR error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Supprime plusieurs clés
   * @param keys Clés à supprimer
   */
  async delMany(keys: string[]): Promise<void> {
    try {
      await this.redis.del(keys);
    } catch (error) {
      console.error(`Redis DEL many error for keys ${keys.join(', ')}:`, error);
      throw error;
    }
  }
}
