import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../modules/users/entities/role.entity';
import { PasswordUtils } from '../common/utils/password.utils';

/**
 * Seed users with fake data
 */
export async function seedUsers(dataSource: DataSource): Promise<User[]> {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);

  console.log('🌱 Seeding users...');

  // Ensure USER role exists
  let userRole = await roleRepository.findOne({ where: { name: 'USER' } });
  if (!userRole) {
    userRole = roleRepository.create({
      name: 'USER',
      description: 'Utilisateur standard',
    });
    await roleRepository.save(userRole);
  }

  // Ensure ADMIN role exists
  let adminRole = await roleRepository.findOne({ where: { name: 'ADMIN' } });
  if (!adminRole) {
    adminRole = roleRepository.create({
      name: 'ADMIN',
      description: 'Administrateur du système',
    });
    await roleRepository.save(adminRole);
  }

  const users: User[] = [];

  // Create admin user first
  const adminSalt = PasswordUtils.generateSalt();
  const adminHashedPassword = PasswordUtils.hashPassword('Azerty123*', adminSalt);

  const adminUser = userRepository.create({
    name: 'Pagies',
    firstname: 'Théotime',
    email: 'tpagies@ailoop.io',
    phone: '0123456789',
    password: adminHashedPassword,
    salt: adminSalt,
    isVerified: true,
    roles: [adminRole],
  });

  const savedAdminUser = await userRepository.save(adminUser);
  users.push(savedAdminUser);

  // Create regular users
  for (let i = 1; i < 20; i++) {
    const salt = PasswordUtils.generateSalt();
    const hashedPassword = PasswordUtils.hashPassword('Azerty123*', salt);

    const user = userRepository.create({
      name: faker.person.lastName(),
      firstname: faker.person.firstName(),
      email: faker.internet.email(),
      phone: faker.string.numeric(10), // Generate exactly 10 digits
      password: hashedPassword,
      salt: salt,
      isVerified: true,
      roles: [userRole],
    });

    const savedUser = await userRepository.save(user);
    users.push(savedUser);
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}
