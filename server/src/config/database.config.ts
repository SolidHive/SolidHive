import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration de base commune
export const getBaseConfig = (): DataSourceOptions => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'solidhive',
  synchronize: false,
  migrationsTableName: 'migrations',
});

// Configuration pour NestJS
export const getNestConfig = (): DataSourceOptions => ({
  ...getBaseConfig(),
  entities: [join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../..', 'migrations', '**', '*{.ts,.js}')],
});

// Configuration pour TypeORM CLI
export const getTypeOrmConfig = (): DataSourceOptions => ({
  ...getBaseConfig(),
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['migrations/**/*{.ts,.js}'],
});
