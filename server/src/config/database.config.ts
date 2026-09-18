import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

type PostgresOptions = Extract<DataSourceOptions, { type: 'postgres' }>;

/**
 * Connexion PostgreSQL : soit une URL complète (`DATABASE_URL`, ce que donne un
 * fournisseur managé comme Neon), soit le détail hôte / port / identifiants du
 * docker-compose. `DB_SSL=true` active TLS sans vérifier la chaîne de
 * certificats, ce qu'exigent les bases managées accessibles sur Internet.
 */
const getConnection = (): Partial<PostgresOptions> => {
  const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;
  if (process.env.DATABASE_URL) {
    return { url: process.env.DATABASE_URL, ssl };
  }
  return {
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'solidhive',
    ssl,
  };
};

// Configuration de base commune
export const getBaseConfig = (): PostgresOptions => ({
  type: 'postgres',
  ...getConnection(),
  synchronize: false,
  migrationsTableName: 'migrations',
});

// Configuration pour NestJS
export const getNestConfig = (): DataSourceOptions => ({
  ...getBaseConfig(),
  entities: [join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../..', 'migrations', '**', '*{.ts,.js}')],
});

// Configuration pour TypeORM CLI. Chemins relatifs au répertoire courant :
// server/ en développement (.ts via ts-node), server/dist/ en production (.js).
export const getTypeOrmConfig = (): DataSourceOptions => ({
  ...getBaseConfig(),
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['migrations/**/*{.ts,.js}'],
});
