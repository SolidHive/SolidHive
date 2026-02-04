import { DataSource } from 'typeorm';
import {
  seedUsers,
  seedAssociations,
  seedFiles,
  seedAnnouncements,
  seedFundraisings,
  seedEvents,
  seedPermissionAccess,
} from './seeds';
import { UserAssociation } from './modules/associations/modules/users/entities/user-association.entity';

/**
 * Main seeding function that orchestrates all seeding operations
 */
async function seed(dataSource: DataSource): Promise<void> {
  try {
    console.log('🚀 Starting database seeding...');

    // Seed permission access first (required for other operations)
    await seedPermissionAccess(dataSource);

    // Clean existing data to avoid conflicts
    console.log('🧹 Cleaning existing data...');
    await dataSource.query('TRUNCATE TABLE file CASCADE');
    await dataSource.query('TRUNCATE TABLE fundraising CASCADE');
    await dataSource.query('TRUNCATE TABLE event CASCADE');
    await dataSource.query('TRUNCATE TABLE association_announcement CASCADE');
    await dataSource.query('TRUNCATE TABLE user_association CASCADE');
    await dataSource.query('TRUNCATE TABLE association_role CASCADE');
    await dataSource.query('TRUNCATE TABLE association CASCADE');
    await dataSource.query('TRUNCATE TABLE "user" CASCADE');

    // Seed users first
    const users = await seedUsers(dataSource);

    // Seed associations using the created users
    const associations = await seedAssociations(dataSource, users);

    // Seed files/images for the associations
    await seedFiles(dataSource, associations);

    // Get user associations for announcements, fundraisings and events
    const userAssociationRepository = dataSource.getRepository(UserAssociation);
    const userAssociations = await userAssociationRepository.find({
      relations: ['user', 'association', 'role'],
    });

    // Seed announcements
    await seedAnnouncements(dataSource, associations, userAssociations);

    // Seed fundraisings (cagnottes)
    await seedFundraisings(dataSource, associations, userAssociations);

    // Seed events
    await seedEvents(dataSource, associations, userAssociations);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

export default seed;

/**
 * Standalone seeding script that can be run directly
 */
async function runSeed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'solidhive',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();
  await seed(dataSource);
  await dataSource.destroy();
}

// Run seeding if this file is executed directly
if (require.main === module) {
  runSeed().catch(console.error);
}
