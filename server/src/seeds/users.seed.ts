import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../modules/users/entities/role.entity';

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
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = userRepository.create({
      name: faker.person.lastName(),
      firstname: faker.person.firstName(),
      email: faker.internet.email(),
      phone: faker.string.numeric(10), // Generate exactly 10 digits
      password: hashedPassword,
      salt: salt,
      siret: faker.string.numeric(14),
      isVerified: true,
      roles: [userRole],
    });

    const savedUser = await userRepository.save(user);
    users.push(savedUser);
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}
