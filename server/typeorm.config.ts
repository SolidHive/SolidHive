import { DataSource } from 'typeorm';
import { getTypeOrmConfig } from './src/config/database.config';

export default new DataSource(getTypeOrmConfig());
