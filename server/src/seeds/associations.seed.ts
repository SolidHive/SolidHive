import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Association } from '../modules/associations/entities/association.entity';
import { User } from '../modules/users/entities/user.entity';
import { UserAssociation } from '../modules/associations/modules/users/entities/user-association.entity';
import { AssociationRole } from '../modules/associations/modules/roles/entities/association-role.entity';
import { Status } from '../common/enums/status';
import { Permissions } from '../common/enums/permissions';

/**
 * Seed associations with fake data
 */
export async function seedAssociations(
  dataSource: DataSource,
  users: User[]
): Promise<Association[]> {
  const associationRepository = dataSource.getRepository(Association);
  const userAssociationRepository = dataSource.getRepository(UserAssociation);
  const roleRepository = dataSource.getRepository(AssociationRole);

  console.log('🌱 Seeding associations...');

  const associations: Association[] = [];

  // Helper function to generate random hex color
  const generateRandomHexColor = (): string => {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase()
    );
  };

  for (let i = 0; i < 10; i++) {
    const randomUser = faker.helpers.arrayElement(users);

    // Generate a valid 14-digit SIRET number
    const siret = faker.string.numeric(14);

    const association = associationRepository.create({
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      aboutText: faker.lorem.paragraphs(3),
      primaryColor: generateRandomHexColor(),
      contact: faker.internet.email(),
      siret: siret,
      status: Status.ACCEPTED,
      createdBy: randomUser,
    });

    const savedAssociation = await associationRepository.save(association);
    associations.push(savedAssociation);

    // Create UserAssociation for the creator with accepted status
    // First, find or create a default role for the association
    let defaultRole = await roleRepository.findOne({
      where: {
        name: `A${savedAssociation.id.slice(0, 3)}`,
        association: { id: savedAssociation.id },
      },
    });

    if (!defaultRole) {
      defaultRole = roleRepository.create({
        name: `A${savedAssociation.id.slice(0, 3)}`,
        permissions: [Permissions.ALL],
        association: savedAssociation,
        createdBy: null, // Will be set after user association is created
      });
      await roleRepository.save(defaultRole);
    }

    // Check if user association already exists
    let userAssociation = await userAssociationRepository.findOne({
      where: { userId: randomUser.id, associationId: savedAssociation.id },
    });

    if (!userAssociation) {
      userAssociation = userAssociationRepository.create({
        userId: randomUser.id,
        associationId: savedAssociation.id,
        status: Status.ACCEPTED,
        role: defaultRole,
      });

      await userAssociationRepository.save(userAssociation);
    }

    // Add 1-3 more random users to the association
    const otherUsers = users.filter((u) => u.id !== randomUser.id);
    const numAdditionalUsers = faker.number.int({ min: 1, max: 3 });

    for (let j = 0; j < numAdditionalUsers; j++) {
      const additionalUser = faker.helpers.arrayElement(otherUsers);

      // Create member role if it doesn't exist
      let memberRole = await roleRepository.findOne({
        where: {
          name: `M${savedAssociation.id.slice(0, 3)}`,
          association: { id: savedAssociation.id },
        },
      });

      if (!memberRole) {
        memberRole = roleRepository.create({
          name: `M${savedAssociation.id.slice(0, 3)}`,
          permissions: [],
          association: savedAssociation,
          createdBy: null, // Will be set after user association is created
        });
        await roleRepository.save(memberRole);
      }

      // Check if user association already exists
      let additionalUserAssociation = await userAssociationRepository.findOne({
        where: { userId: additionalUser.id, associationId: savedAssociation.id },
      });

      if (!additionalUserAssociation) {
        additionalUserAssociation = userAssociationRepository.create({
          userId: additionalUser.id,
          associationId: savedAssociation.id,
          status: Status.ACCEPTED,
          role: memberRole,
        });

        await userAssociationRepository.save(additionalUserAssociation);
      }
    }
  }

  console.log(`✅ Created ${associations.length} associations with user associations`);
  return associations;
}
