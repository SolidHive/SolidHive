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

  const users: User[] = [];

  for (let i = 0; i < 5; i++) {
    const salt = PasswordUtils.generateSalt();
    const hashedPassword = PasswordUtils.hashPassword('password123', salt);

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
